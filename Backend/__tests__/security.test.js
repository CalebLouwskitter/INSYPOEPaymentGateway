// Attack-scenario tests. Each test describes an attack against the API and asserts
// that it is blocked. They are referenced from docs/security-case-study.md.
//
// Rate limiters are module-level singletons shared across this file, so the number of
// login (5/15min), registration (3/hour) and payment (30/15min) calls is kept within budget.
// Rate limiting itself is tested in rateLimit.test.js.

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../Models/userModel');
const Employee = require('../Models/employeeModel');
const Payment = require('../Models/paymentModel');

const customerToken = (user, overrides = {}) => jwt.sign(
    { fullName: user.fullName, userId: user._id, type: 'customer', ...overrides },
    process.env.JWT_SECRET,
    overrides.exp ? {} : { expiresIn: '1h' }
);

const employeeToken = (employee) => jwt.sign(
    { id: employee._id, username: employee.username, role: employee.role, type: 'employee' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
);

const makeUser = (n) => User.create({
    fullName: `Customer ${'ABCDEFGHIJ'[n]}`,
    accountNumber: String(1000000000 + n),
    nationalId: String(9000000000000 + n),
    password: 'CustomerPass123',
});

const makeEmployee = (username, role = 'employee', createdBy = new mongoose.Types.ObjectId()) =>
    Employee.create({ username, password: 'EmployeePass123', role, createdBy });

const makePayment = (user, status = 'pending') => Payment.create({
    userId: user._id,
    amount: 250,
    currency: 'ZAR',
    paymentMethod: 'bank_transfer',
    transactionId: `TXN-${new mongoose.Types.ObjectId()}`,
    status,
});

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await Promise.all([User.deleteMany({}), Employee.deleteMany({}), Payment.deleteMany({})]);
});

describe('Broken access control (OWASP A01)', () => {
    test('a customer cannot approve their own payment by setting its status', async () => {
        const user = await makeUser(1);
        const payment = await makePayment(user);

        await request(app)
            .put(`/api/v1/payments/${payment._id}/status`)
            .set('Authorization', `Bearer ${customerToken(user)}`)
            .send({ status: 'completed' });

        const after = await Payment.findById(payment._id);
        expect(after.status).toBe('pending');
    });

    test('a customer cannot delete a payment an employee has already processed', async () => {
        const user = await makeUser(1);
        const payment = await makePayment(user, 'approved');

        const res = await request(app)
            .delete(`/api/v1/payments/${payment._id}`)
            .set('Authorization', `Bearer ${customerToken(user)}`);

        expect(res.status).toBe(409);
        expect(await Payment.findById(payment._id)).not.toBeNull();
    });

    test('a customer can still withdraw a payment that is pending review', async () => {
        const user = await makeUser(1);
        const payment = await makePayment(user);

        await request(app)
            .delete(`/api/v1/payments/${payment._id}`)
            .set('Authorization', `Bearer ${customerToken(user)}`)
            .expect(200);
        expect(await Payment.findById(payment._id)).toBeNull();
    });

    test('a customer cannot read another customer\'s payment (IDOR)', async () => {
        const alice = await makeUser(1);
        const bob = await makeUser(2);
        const alicesPayment = await makePayment(alice);

        await request(app)
            .get(`/api/v1/payments/${alicesPayment._id}`)
            .set('Authorization', `Bearer ${customerToken(bob)}`)
            .expect(404);
    });

    test('an employee token is rejected on customer routes and leaks no payments', async () => {
        const alice = await makeUser(1);
        await makePayment(alice);
        const employee = await makeEmployee('teller_one');

        const res = await request(app)
            .get('/api/v1/payments')
            .set('Authorization', `Bearer ${employeeToken(employee)}`);

        expect(res.status).toBe(403);
        expect(res.body.data).toBeUndefined();
    });

    test('a customer token is rejected on employee routes', async () => {
        const user = await makeUser(1);
        const res = await request(app)
            .get('/api/v1/employee/payments/pending')
            .set('Authorization', `Bearer ${customerToken(user)}`);
        expect(res.status).toBe(403);
    });

    test('an employee cannot reach admin-only routes', async () => {
        const employee = await makeEmployee('teller_one');
        await request(app)
            .get('/api/v1/employee/admin/employees')
            .set('Authorization', `Bearer ${employeeToken(employee)}`)
            .expect(403);
    });

    test('a deleted employee\'s still-unexpired token stops working immediately', async () => {
        const employee = await makeEmployee('teller_one');
        const token = employeeToken(employee);
        await Employee.findByIdAndDelete(employee._id);

        await request(app)
            .get('/api/v1/employee/payments/pending')
            .set('Authorization', `Bearer ${token}`)
            .expect(401);
    });

    test('a demoted admin loses admin access even though the token still says "admin"', async () => {
        const admin = await makeEmployee('branch_admin', 'admin');
        const token = employeeToken(admin);
        await Employee.updateOne({ _id: admin._id }, { role: 'employee' });

        await request(app)
            .get('/api/v1/employee/admin/employees')
            .set('Authorization', `Bearer ${token}`)
            .expect(403);
    });

    test.failing('two employees racing to approve and deny the same payment: exactly one wins', async () => {
        const user = await makeUser(1);
        const payment = await makePayment(user);
        const a = await makeEmployee('teller_one');
        const b = await makeEmployee('teller_two');

        const [r1, r2] = await Promise.all([
            request(app).put(`/api/v1/employee/payments/${payment._id}/process`)
                .set('Authorization', `Bearer ${employeeToken(a)}`).send({ action: 'approve' }),
            request(app).put(`/api/v1/employee/payments/${payment._id}/process`)
                .set('Authorization', `Bearer ${employeeToken(b)}`).send({ action: 'deny' }),
        ]);

        const statuses = [r1.status, r2.status].sort();
        expect(statuses).toEqual([200, 409]);
        const winner = r1.status === 200 ? r1 : r2;
        const after = await Payment.findById(payment._id);
        expect(after.status).toBe(winner.body.payment.status);
    });
});

describe('Token integrity (OWASP A02/A07)', () => {
    test('an unsigned "alg: none" token is rejected', async () => {
        const user = await makeUser(1);
        const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
        const body = Buffer.from(JSON.stringify({ userId: user._id, type: 'customer' })).toString('base64url');

        await request(app)
            .get('/api/v1/payments')
            .set('Authorization', `Bearer ${header}.${body}.`)
            .expect(403);
    });

    test('a token signed with a different secret is rejected', async () => {
        const user = await makeUser(1);
        const forged = jwt.sign({ userId: user._id, type: 'customer' }, 'attacker-guess');
        await request(app)
            .get('/api/v1/payments')
            .set('Authorization', `Bearer ${forged}`)
            .expect(403);
    });

    test('an expired token is rejected', async () => {
        const user = await makeUser(1);
        const expired = customerToken(user, { exp: Math.floor(Date.now() / 1000) - 60 });
        await request(app)
            .get('/api/v1/payments')
            .set('Authorization', `Bearer ${expired}`)
            .expect(403);
    });
});

describe('Injection (OWASP A03)', () => {
    test.failing('NoSQL operator injection in customer login is rejected', async () => {
        await makeUser(1);
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ fullName: { $ne: null }, accountNumber: '1000000001', nationalId: '9000000000001', password: { $ne: null } });
        expect(res.status).toBe(400);
        expect(res.body.token).toBeUndefined();
    });

    test('NoSQL operator injection in employee login is rejected', async () => {
        await makeEmployee('teller_one');
        const res = await request(app)
            .post('/api/v1/employee/auth/login')
            .send({ username: { $gt: '' }, password: { $gt: '' } });
        expect(res.status).toBe(400);
        expect(res.body.token).toBeUndefined();
    });

    test.failing('operator keys smuggled into payment metadata are stripped before storage', async () => {
        const user = await makeUser(1);
        const res = await request(app)
            .post('/api/v1/payments')
            .set('Authorization', `Bearer ${customerToken(user)}`)
            .send({ amount: 10, paymentMethod: 'paypal', metadata: { $where: 'sleep(1000)', note: 'ok' } })
            .expect(201);
        const stored = await Payment.findById(res.body.data._id);
        expect(stored.metadata.has('$where')).toBe(false);
    });
});

describe('Authentication hardening (OWASP A07)', () => {
    test.failing('registration rejects passwords shorter than 8 characters', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({ fullName: 'Short Password', accountNumber: '2000000001', nationalId: '8000000000001', password: 'abc1234' });
        expect(res.status).toBe(400);
        expect(await User.countDocuments()).toBe(0);
    });

    test.failing('login does the same bcrypt work whether or not the account exists (no timing oracle)', async () => {
        const spy = jest.spyOn(bcrypt, 'compare');
        await request(app)
            .post('/api/v1/auth/login')
            .send({ fullName: 'Nobody Here', accountNumber: '3000000001', nationalId: '7000000000001', password: 'WhateverPass1' })
            .expect(401);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});

describe('Logging and error handling (OWASP A09/A05)', () => {
    test.failing('national ID and account number never reach the logs', async () => {
        const lines = [];
        const capture = (...args) => lines.push(args.map(String).join(' '));
        const spies = ['log', 'info', 'warn', 'error'].map((m) => jest.spyOn(console, m).mockImplementation(capture));

        const creds = { fullName: 'Logging Check', accountNumber: '4000000001', nationalId: '6000000000001', password: 'LoggingPass123' };
        await request(app).post('/api/v1/auth/register').send(creds).expect(201);
        await request(app).post('/api/v1/auth/login').send(creds).expect(200);

        spies.forEach((s) => s.mockRestore());
        const output = lines.join('\n');
        expect(output).not.toContain(creds.nationalId);
        expect(output).not.toContain(creds.accountNumber);
        expect(output).not.toContain(creds.password);
    });

    test.failing('server errors do not echo internal error messages to the client', async () => {
        const user = await makeUser(1);
        const spy = jest.spyOn(Payment, 'find').mockImplementation(() => {
            throw new Error('MongoServerError: connection to 10.0.3.7:27017 refused');
        });
        jest.spyOn(console, 'error').mockImplementation(() => {});

        const res = await request(app)
            .get('/api/v1/payments')
            .set('Authorization', `Bearer ${customerToken(user)}`)
            .expect(500);

        spy.mockRestore();
        console.error.mockRestore();
        expect(JSON.stringify(res.body)).not.toContain('10.0.3.7');
    });
});

describe('Browser-facing controls (CSRF, CORS, headers)', () => {
    const withCsrfEnforced = async (fn) => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        try { return await fn(); } finally { process.env.NODE_ENV = previous; }
    };

    test('a state-changing request without a matching CSRF token is refused', async () => {
        const res = await withCsrfEnforced(() => request(app)
            .post('/api/v1/test/greet')
            .set('Cookie', 'XSRF-TOKEN=cookie-value')
            .set('X-CSRF-Token', 'different-value')
            .send({ name: 'x' }));
        expect(res.status).toBe(403);
    });

    test('a request carrying the double-submit token passes the CSRF check', async () => {
        const res = await withCsrfEnforced(() => request(app)
            .post('/api/v1/test/greet')
            .set('Cookie', 'XSRF-TOKEN=same-value')
            .set('X-CSRF-Token', 'same-value')
            .send({ name: 'x' }));
        expect(res.status).toBe(200);
    });

    test.failing('an untrusted origin gets no CORS grant', async () => {
        const res = await request(app)
            .options('/api/v1/auth/login')
            .set('Origin', 'https://evil.example')
            .set('Access-Control-Request-Method', 'POST');
        expect(res.headers['access-control-allow-origin']).toBeUndefined();
        expect(res.status).toBeLessThan(500);
    });

    test('responses carry HSTS, a CSP that forbids framing, and no X-Powered-By', async () => {
        const res = await request(app).get('/health').expect(200);
        expect(res.headers['strict-transport-security']).toMatch(/max-age=\d+/);
        expect(res.headers['content-security-policy']).toContain("frame-ancestors 'none'");
        expect(res.headers['x-powered-by']).toBeUndefined();
    });
});
