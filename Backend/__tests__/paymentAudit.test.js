const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const User = require('../Models/userModel');
const Employee = require('../Models/employeeModel');
const Payment = require('../Models/paymentModel');
const { AuditEvent, verifyAuditChain } = require('../Services/auditService');

const employeeToken = (employee) => jwt.sign(
    { id: employee._id, username: employee.username, role: employee.role, type: 'employee' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
);

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await Promise.all([
        User.deleteMany({}),
        Employee.deleteMany({}),
        Payment.deleteMany({})
    ]);
    if (mongoose.connection.collections.auditevents) {
        await mongoose.connection.collections.auditevents.deleteMany({});
    }
});

describe('Staff payment decision audit logging', () => {
    test('records PAYMENT_APPROVED audit event when staff approves payment', async () => {
        const employee = await Employee.create({
            username: 'approver1',
            password: 'EmployeePass123',
            role: 'employee'
        });

        const customer = await User.create({
            fullName: 'Customer One',
            accountNumber: '1111111111',
            nationalId: '9001011111111',
            password: 'CustomerPass123'
        });

        const payment = await Payment.create({
            userId: customer._id,
            amount: 500,
            currency: 'ZAR',
            paymentMethod: 'bank_transfer',
            transactionId: `TXN-${new mongoose.Types.ObjectId()}`,
            status: 'pending'
        });

        const res = await request(app)
            .put(`/api/v1/employee/payments/${payment._id}/process`)
            .set('Authorization', `Bearer ${employeeToken(employee)}`)
            .send({ action: 'approve' });

        expect(res.status).toBe(200);

        const events = await AuditEvent.find({ targetId: payment._id.toString() });
        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.action).toBe('PAYMENT_APPROVED');
        expect(event.actorId.toString()).toBe(employee._id.toString());
        expect(event.actorRole).toBe('employee');
        expect(event.targetType).toBe('Payment');
        expect(event.targetId).toBe(payment._id.toString());
        expect(event.requestId).toBeTruthy();
        expect(event.details.amount).toBe(500);
        expect(event.details.currency).toBe('ZAR');
        expect(event.details.transactionId).toBe(payment.transactionId);

        const chain = await verifyAuditChain();
        expect(chain.valid).toBe(true);
        expect(chain.count).toBe(1);
    });

    test('records PAYMENT_DENIED audit event when staff denies payment', async () => {
        const employee = await Employee.create({
            username: 'denier1',
            password: 'EmployeePass123',
            role: 'employee'
        });

        const customer = await User.create({
            fullName: 'Customer Two',
            accountNumber: '2222222222',
            nationalId: '9001012222222',
            password: 'CustomerPass123'
        });

        const payment = await Payment.create({
            userId: customer._id,
            amount: 1200,
            currency: 'USD',
            paymentMethod: 'credit_card',
            transactionId: `TXN-${new mongoose.Types.ObjectId()}`,
            status: 'pending'
        });

        const res = await request(app)
            .put(`/api/v1/employee/payments/${payment._id}/process`)
            .set('Authorization', `Bearer ${employeeToken(employee)}`)
            .send({ action: 'deny' });

        expect(res.status).toBe(200);

        const events = await AuditEvent.find({ targetId: payment._id.toString() });
        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.action).toBe('PAYMENT_DENIED');
        expect(event.actorId.toString()).toBe(employee._id.toString());
        expect(event.actorRole).toBe('employee');
        expect(event.targetType).toBe('Payment');
        expect(event.details.amount).toBe(1200);

        const chain = await verifyAuditChain();
        expect(chain.valid).toBe(true);
    });

    test('does not record audit event when processing fails with 409 or 404', async () => {
        const employee = await Employee.create({
            username: 'staff1',
            password: 'EmployeePass123',
            role: 'employee'
        });

        const customer = await User.create({
            fullName: 'Customer Three',
            accountNumber: '3333333333',
            nationalId: '9001013333333',
            password: 'CustomerPass123'
        });

        const payment = await Payment.create({
            userId: customer._id,
            amount: 300,
            currency: 'ZAR',
            paymentMethod: 'bank_transfer',
            transactionId: `TXN-${new mongoose.Types.ObjectId()}`,
            status: 'approved'
        });

        // Try to process already approved payment -> 409
        const res409 = await request(app)
            .put(`/api/v1/employee/payments/${payment._id}/process`)
            .set('Authorization', `Bearer ${employeeToken(employee)}`)
            .send({ action: 'approve' });
        expect(res409.status).toBe(409);

        // Try to process non-existent payment -> 404
        const fakeId = new mongoose.Types.ObjectId();
        const res404 = await request(app)
            .put(`/api/v1/employee/payments/${fakeId}/process`)
            .set('Authorization', `Bearer ${employeeToken(employee)}`)
            .send({ action: 'approve' });
        expect(res404.status).toBe(404);

        const count = await AuditEvent.countDocuments();
        expect(count).toBe(0);
    });
});
