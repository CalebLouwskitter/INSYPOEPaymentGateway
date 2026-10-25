const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Employee = require('../Models/employeeModel');
const { AuditEvent, verifyAuditChain } = require('../Services/auditService');

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    await Employee.deleteMany({});
    if (mongoose.connection.collections.auditevents) {
        await mongoose.connection.collections.auditevents.deleteMany({});
    }
});

describe('Staff authentication audit logging', () => {
    test('records STAFF_LOGIN_SUCCEEDED on valid staff login', async () => {
        const employee = await Employee.create({
            username: 'staff_auth_1',
            password: 'StaffPass123',
            role: 'employee'
        });

        const res = await request(app)
            .post('/api/v1/employee/auth/login')
            .send({
                username: 'staff_auth_1',
                password: 'StaffPass123'
            });

        expect(res.status).toBe(200);

        const events = await AuditEvent.find({ action: 'STAFF_LOGIN_SUCCEEDED' });
        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.action).toBe('STAFF_LOGIN_SUCCEEDED');
        expect(event.actorId.toString()).toBe(employee._id.toString());
        expect(event.actorRole).toBe('employee');
        expect(event.targetType).toBe('StaffAuth');
        expect(event.targetId).toBe(employee._id.toString());
        expect(event.requestId).toBeTruthy();
        expect(event.details.username).toBe('staff_auth_1');
        expect(event.details.password).toBeUndefined();
        expect(event.details.token).toBeUndefined();

        const chain = await verifyAuditChain();
        expect(chain.valid).toBe(true);
        expect(chain.count).toBe(1);
    });

    test('records STAFF_LOGIN_FAILED on wrong password', async () => {
        const employee = await Employee.create({
            username: 'staff_auth_2',
            password: 'StaffPass123',
            role: 'employee'
        });

        const res = await request(app)
            .post('/api/v1/employee/auth/login')
            .send({
                username: 'staff_auth_2',
                password: 'WrongPassword999'
            });

        expect(res.status).toBe(401);

        const events = await AuditEvent.find({ action: 'STAFF_LOGIN_FAILED' });
        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.action).toBe('STAFF_LOGIN_FAILED');
        expect(event.actorId.toString()).toBe(employee._id.toString());
        expect(event.actorRole).toBe('employee');
        expect(event.targetType).toBe('StaffAuth');
        expect(event.details.username).toBe('staff_auth_2');
        expect(event.details.reason).toBe('Invalid password');
        expect(event.details.password).toBeUndefined();

        const chain = await verifyAuditChain();
        expect(chain.valid).toBe(true);
        expect(chain.count).toBe(1);
    });

    test('records STAFF_LOGIN_FAILED on unknown username', async () => {
        const res = await request(app)
            .post('/api/v1/employee/auth/login')
            .send({
                username: 'nonexistent_staff',
                password: 'SomePassword123'
            });

        expect(res.status).toBe(401);

        const events = await AuditEvent.find({ action: 'STAFF_LOGIN_FAILED' });
        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.action).toBe('STAFF_LOGIN_FAILED');
        expect(event.actorId).toBeNull();
        expect(event.actorRole).toBeNull();
        expect(event.targetType).toBe('StaffAuth');
        expect(event.details.username).toBe('nonexistent_staff');
        expect(event.details.reason).toBe('User not found');
        expect(event.details.password).toBeUndefined();

        const chain = await verifyAuditChain();
        expect(chain.valid).toBe(true);
        expect(chain.count).toBe(1);
    });
});
