#!/usr/bin/env node
// Runs a set of real attacks against the API and reports whether each one was blocked.
//
//   cd Backend && npm run demo:attacks
//
// The API runs in-process with CSRF enforcement on (NODE_ENV=development) against a
// throwaway in-memory MongoDB, so nothing needs to be running and no real data is touched.
// Set MONGODB_URI to use your own database instead (its users/employees/payments are wiped).
// Exits non-zero if any attack succeeds, so CI can run it.

const crypto = require('node:crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');

const main = async () => {
    let mongod;
    if (!process.env.MONGODB_URI) {
        mongod = await MongoMemoryServer.create();
        process.env.MONGODB_URI = mongod.getUri('attack_demo');
    }
    process.env.NODE_ENV = 'development';
    process.env.PORT = '0';
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    process.env.DEMO_PAYMENTS_ENABLED = 'false';

    // quiet the API's own request logging (console and morgan) so the report is readable
    const log = console.log;
    const stdoutWrite = process.stdout.write.bind(process.stdout);
    console.log = console.warn = console.error = () => {};
    process.stdout.write = () => true;

    const request = require('supertest');
    const mongoose = require('mongoose');
    const jwt = require('jsonwebtoken');
    const app = require('../server');
    const User = require('../Models/userModel');
    const Employee = require('../Models/employeeModel');
    const Payment = require('../Models/paymentModel');

    if (mongoose.connection.readyState !== 1) await mongoose.connection.asPromise();
    await Promise.all([User.deleteMany({}), Employee.deleteMany({}), Payment.deleteMany({})]);

    // --- fixtures -------------------------------------------------------------------------
    const alice = await User.create({ fullName: 'Alice Customer', accountNumber: '1000000001', nationalId: '9001010000001', password: 'AlicePass123' });
    const bob = await User.create({ fullName: 'Bob Customer', accountNumber: '1000000002', nationalId: '9001010000002', password: 'BobPass12345' });
    const teller = await Employee.create({ username: 'teller', password: 'TellerPass123', role: 'employee', createdBy: new mongoose.Types.ObjectId() });
    const tellerTwo = await Employee.create({ username: 'teller_two', password: 'TellerPass123', role: 'employee', createdBy: new mongoose.Types.ObjectId() });
    const newPayment = (user, status = 'pending') => Payment.create({
        userId: user._id, amount: 5000, currency: 'ZAR', paymentMethod: 'bank_transfer',
        transactionId: `TXN-DEMO-${crypto.randomUUID()}`, status,
    });

    // Every state-changing request needs the double-submit CSRF token, like the real frontend.
    const agent = request.agent(app);
    const { body: { csrfToken } } = await agent.get('/api/v1/csrf-token');
    const send = (method, url, token) => {
        const r = agent[method](url).set('X-CSRF-Token', csrfToken);
        return token ? r.set('Authorization', `Bearer ${token}`) : r;
    };

    const sign = (claims, secret = process.env.JWT_SECRET) => jwt.sign(claims, secret, { expiresIn: '1h' });
    const aliceToken = sign({ fullName: alice.fullName, userId: alice._id, type: 'customer' });
    const bobToken = sign({ fullName: bob.fullName, userId: bob._id, type: 'customer' });
    const tellerToken = (e) => sign({ id: e._id, username: e.username, role: e.role, type: 'employee' });

    // --- attacks ---------------------------------------------------------------------------
    const results = [];
    const attack = async (name, fn) => {
        try {
            const { blocked, detail } = await fn();
            results.push({ name, blocked, detail });
        } catch (err) {
            results.push({ name, blocked: false, detail: `error: ${err.message}` });
        }
    };

    await attack('NoSQL injection: log in as anyone with {"$ne": null}', async () => {
        const res = await send('post', '/api/v1/auth/login')
            .send({ fullName: { $ne: null }, accountNumber: '1000000001', nationalId: '9001010000001', password: { $ne: null } });
        return {
            blocked: !res.body.token,
            detail: res.status === 400
                ? 'rejected by input validation (HTTP 400)'
                : `no token, but the operator object reached the database query (HTTP ${res.status})`,
        };
    });

    await attack('Brute force: rotate X-Forwarded-For to dodge the login rate limit', async () => {
        let attempts = 0;
        let status;
        do {
            attempts += 1;
            const res = await send('post', '/api/v1/auth/login')
                .set('X-Forwarded-For', `198.51.100.${attempts}`)
                .send({ fullName: 'Alice Customer', accountNumber: '1000000001', nationalId: '9001010000001', password: `guess${attempts}xx` });
            status = res.status;
        } while (status !== 429 && attempts < 20);
        return {
            blocked: status === 429,
            detail: status === 429
                ? `throttled (429) after ${attempts} guesses, despite a new spoofed IP each time`
                : `never throttled: ${attempts} guesses, each from a "new" IP`,
        };
    });

    await attack('Customer approves their own payment via PUT /payments/:id/status', async () => {
        const p = await newPayment(alice);
        const res = await send('put', `/api/v1/payments/${p._id}/status`, aliceToken).send({ status: 'completed' });
        const after = await Payment.findById(p._id);
        return { blocked: after.status === 'pending', detail: `HTTP ${res.status}, payment is now "${after.status}"` };
    });

    await attack('Customer deletes a payment that was already approved (audit trail)', async () => {
        const p = await newPayment(alice, 'approved');
        const res = await send('delete', `/api/v1/payments/${p._id}`, aliceToken);
        return { blocked: res.status === 409 && !!(await Payment.findById(p._id)), detail: `HTTP ${res.status}` };
    });

    await attack('IDOR: Bob reads Alice\'s payment by id', async () => {
        const p = await newPayment(alice);
        const res = await agent.get(`/api/v1/payments/${p._id}`).set('Authorization', `Bearer ${bobToken}`);
        return { blocked: res.status === 404, detail: `HTTP ${res.status}` };
    });

    await attack('Token confusion: employee token on customer routes', async () => {
        const res = await agent.get('/api/v1/payments').set('Authorization', `Bearer ${tellerToken(teller)}`);
        return { blocked: res.status === 403, detail: `HTTP ${res.status}` };
    });

    await attack('Unsigned JWT ("alg": "none") claiming to be Alice', async () => {
        const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
        const token = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ userId: alice._id, type: 'customer' })}.`;
        const res = await agent.get('/api/v1/payments').set('Authorization', `Bearer ${token}`);
        return { blocked: res.status === 403, detail: `HTTP ${res.status}` };
    });

    await attack('Forged admin token signed with a guessed secret ("secret")', async () => {
        const token = sign({ id: teller._id, username: 'teller', role: 'admin', type: 'employee' }, 'secret');
        const res = await agent.get('/api/v1/employee/admin/employees').set('Authorization', `Bearer ${token}`);
        return { blocked: res.status === 403, detail: `HTTP ${res.status}` };
    });

    await attack('Fired employee keeps using their unexpired token', async () => {
        const fired = await Employee.create({ username: 'fired_teller', password: 'TellerPass123', role: 'employee', createdBy: new mongoose.Types.ObjectId() });
        const token = tellerToken(fired);
        await Employee.findByIdAndDelete(fired._id);
        const res = await agent.get('/api/v1/employee/payments/pending').set('Authorization', `Bearer ${token}`);
        return { blocked: res.status === 401, detail: `HTTP ${res.status}` };
    });

    await attack('Race: two employees approve and deny the same payment at once', async () => {
        const p = await newPayment(alice);
        const url = `/api/v1/employee/payments/${p._id}/process`;
        const [a, b] = await Promise.all([
            send('put', url, tellerToken(teller)).send({ action: 'approve' }),
            send('put', url, tellerToken(tellerTwo)).send({ action: 'deny' }),
        ]);
        const codes = [a.status, b.status].sort();
        return { blocked: codes[0] === 200 && codes[1] === 409, detail: `HTTP ${codes.join(' / ')}` };
    });

    await attack('CSRF: cross-site POST without the double-submit token', async () => {
        const res = await request(app).post('/api/v1/payments')
            .set('Authorization', `Bearer ${aliceToken}`)
            .send({ amount: 999, paymentMethod: 'paypal' });
        return { blocked: res.status === 403, detail: `HTTP ${res.status}` };
    });

    await attack('CORS: https://evil.example asks to read API responses', async () => {
        const res = await request(app).options('/api/v1/payments')
            .set('Origin', 'https://evil.example').set('Access-Control-Request-Method', 'GET');
        const granted = res.headers['access-control-allow-origin'];
        return { blocked: !granted, detail: granted ? `granted to ${granted}` : 'no Access-Control-Allow-Origin header' };
    });

    // --- report ----------------------------------------------------------------------------
    console.log = log;
    process.stdout.write = stdoutWrite;
    const width = Math.max(...results.map((r) => r.name.length));
    log('\nAttack demo against the INSY7314 payments API\n');
    for (const r of results) {
        log(`${r.blocked ? 'BLOCKED   ' : 'SUCCEEDED '} ${r.name.padEnd(width)}  ${r.detail}`);
    }
    const failed = results.filter((r) => !r.blocked).length;
    log(`\n${results.length - failed}/${results.length} attacks blocked\n`);

    await mongoose.connection.close();
    if (mongod) await mongod.stop();
    process.exit(failed ? 1 : 0);
};

main().catch((err) => {
    process.stderr.write(`${err.stack}\n`);
    process.exit(2);
});
