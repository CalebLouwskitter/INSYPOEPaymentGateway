const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Employee = require('../Models/employeeModel');
const User = require('../Models/userModel');
const { AuditEvent, recordAuditEvent } = require('../Services/auditService');

const employeeToken = (employee) => jwt.sign(
    { id: employee._id, username: employee.username, role: employee.role, type: 'employee' },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
);

const customerToken = (user) => jwt.sign(
    { fullName: user.fullName, userId: user._id, type: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
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
        Employee.deleteMany({}),
        User.deleteMany({})
    ]);
    if (mongoose.connection.collections.auditevents) {
        await mongoose.connection.collections.auditevents.deleteMany({});
    }
});

describe('GET /api/admin/audit Endpoint', () => {
    test('rejects unauthenticated requests with 401', async () => {
        const res = await request(app).get('/api/admin/audit');
        expect(res.status).toBe(401);
    });

    test('rejects customer tokens with 403', async () => {
        const customer = await User.create({
            fullName: 'Customer Test',
            accountNumber: '9999999999',
            nationalId: '9001019999999',
            password: 'CustomerPass123'
        });

        const res = await request(app)
            .get('/api/admin/audit')
            .set('Authorization', `Bearer ${customerToken(customer)}`);

        expect(res.status).toBe(403);
    });

    test('rejects non-admin employee tokens with 403', async () => {
        const worker = await Employee.create({
            username: 'regular_worker',
            password: 'WorkerPass123',
            role: 'employee'
        });

        const res = await request(app)
            .get('/api/admin/audit')
            .set('Authorization', `Bearer ${employeeToken(worker)}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toMatch(/Admin/i);
    });

    test('allows admin to query audit logs at /api/admin/audit and /api/v1/employee/admin/audit', async () => {
        const admin = await Employee.create({
            username: 'admin_user',
            password: 'AdminPass123',
            role: 'admin'
        });

        await recordAuditEvent({
            actorId: admin._id,
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            targetType: 'Employee',
            targetId: 'emp-101',
            details: { username: 'created_user' }
        });

        const res1 = await request(app)
            .get('/api/admin/audit')
            .set('Authorization', `Bearer ${employeeToken(admin)}`);

        expect(res1.status).toBe(200);
        expect(res1.body.success).toBe(true);
        expect(res1.body.count).toBe(1);
        expect(res1.body.events[0].action).toBe('EMPLOYEE_CREATED');

        const res2 = await request(app)
            .get('/api/v1/employee/admin/audit')
            .set('Authorization', `Bearer ${employeeToken(admin)}`);

        expect(res2.status).toBe(200);
        expect(res2.body.count).toBe(1);
    });

    test('paginates audit logs correctly', async () => {
        const admin = await Employee.create({
            username: 'paging_admin',
            password: 'AdminPass123',
            role: 'admin'
        });

        // Create 5 events
        for (let i = 1; i <= 5; i++) {
            await recordAuditEvent({
                actorId: admin._id,
                actorRole: 'admin',
                action: 'EMPLOYEE_CREATED',
                targetId: `emp-${i}`,
                details: { idx: i }
            });
        }

        const resPage1 = await request(app)
            .get('/api/admin/audit?page=1&limit=2')
            .set('Authorization', `Bearer ${employeeToken(admin)}`);

        expect(resPage1.status).toBe(200);
        expect(resPage1.body.total).toBe(5);
        expect(resPage1.body.page).toBe(1);
        expect(resPage1.body.totalPages).toBe(3);
        expect(resPage1.body.count).toBe(2);

        const resPage2 = await request(app)
            .get('/api/admin/audit?page=2&limit=2')
            .set('Authorization', `Bearer ${employeeToken(admin)}`);

        expect(resPage2.status).toBe(200);
        expect(resPage2.body.page).toBe(2);
        expect(resPage2.body.count).toBe(2);

        const resPage3 = await request(app)
            .get('/api/admin/audit?page=3&limit=2')
            .set('Authorization', `Bearer ${employeeToken(admin)}`);

        expect(resPage3.status).toBe(200);
        expect(resPage3.body.page).toBe(3);
        expect(resPage3.body.count).toBe(1);
    });

    test('filters audit logs by action, actorId and date range', async () => {
        const admin1 = await Employee.create({
            username: 'filter_admin1',
            password: 'AdminPass123',
            role: 'admin'
        });

        const admin2 = await Employee.create({
            username: 'filter_admin2',
            password: 'AdminPass123',
            role: 'admin'
        });

        const d1 = new Date('2026-01-01T10:00:00Z');
        const d2 = new Date('2026-01-05T10:00:00Z');
        const d3 = new Date('2026-01-10T10:00:00Z');

        await recordAuditEvent({
            actorId: admin1._id,
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            at: d1,
            details: { marker: 'event-1' }
        });

        await recordAuditEvent({
            actorId: admin1._id,
            actorRole: 'admin',
            action: 'PAYMENT_APPROVED',
            at: d2,
            details: { marker: 'event-2' }
        });

        await recordAuditEvent({
            actorId: admin2._id,
            actorRole: 'admin',
            action: 'PAYMENT_DENIED',
            at: d3,
            details: { marker: 'event-3' }
        });

        // Filter by action
        const resAction = await request(app)
            .get('/api/admin/audit?action=PAYMENT_APPROVED')
            .set('Authorization', `Bearer ${employeeToken(admin1)}`);
        expect(resAction.status).toBe(200);
        expect(resAction.body.count).toBe(1);
        expect(resAction.body.events[0].action).toBe('PAYMENT_APPROVED');

        // Filter by actorId
        const resActor = await request(app)
            .get(`/api/admin/audit?actorId=${admin2._id.toString()}`)
            .set('Authorization', `Bearer ${employeeToken(admin1)}`);
        expect(resActor.status).toBe(200);
        expect(resActor.body.count).toBe(1);
        expect(resActor.body.events[0].action).toBe('PAYMENT_DENIED');

        // Filter by date range (from / to)
        const resDate = await request(app)
            .get('/api/admin/audit?from=2026-01-04T00:00:00Z&to=2026-01-06T00:00:00Z')
            .set('Authorization', `Bearer ${employeeToken(admin1)}`);
        expect(resDate.status).toBe(200);
        expect(resDate.body.count).toBe(1);
        expect(resDate.body.events[0].details.marker).toBe('event-2');

        // Filter by date range (startDate / endDate)
        const resStartDate = await request(app)
            .get('/api/admin/audit?startDate=2026-01-02T00:00:00Z&endDate=2026-01-12T00:00:00Z')
            .set('Authorization', `Bearer ${employeeToken(admin1)}`);
        expect(resStartDate.status).toBe(200);
        expect(resStartDate.body.count).toBe(2);
    });

    test('returns only safe fields with no passwords or secrets', async () => {
        const admin = await Employee.create({
            username: 'safe_admin',
            password: 'AdminPass123',
            role: 'admin'
        });

        await recordAuditEvent({
            actorId: admin._id,
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            details: {
                username: 'newhire',
                role: 'employee',
                safeParam: 'publicInfo'
            }
        });

        const res = await request(app)
            .get('/api/admin/audit')
            .set('Authorization', `Bearer ${employeeToken(admin)}`);

        expect(res.status).toBe(200);
        const event = res.body.events[0];

        // Safe fields present
        expect(event._id).toBeDefined();
        expect(event.action).toBe('EMPLOYEE_CREATED');
        expect(event.actorRole).toBe('admin');
        expect(event.prevHash).toBeNull();
        expect(event.hash).toMatch(/^[a-f0-9]{64}$/);
        expect(event.details.username).toBe('newhire');
        expect(event.details.safeParam).toBe('publicInfo');

        // Sensitive fields absent
        expect(event.actorId.password).toBeUndefined();
        expect(event.details.password).toBeUndefined();
        expect(event.details.token).toBeUndefined();
        expect(event.details.nationalId).toBeUndefined();
        expect(JSON.stringify(res.body)).not.toContain('AdminPass123');
    });
});
