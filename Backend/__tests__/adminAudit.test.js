const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Employee = require('../Models/employeeModel');
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
    await Employee.deleteMany({});
    if (mongoose.connection.collections.auditevents) {
        await mongoose.connection.collections.auditevents.deleteMany({});
    }
});

describe('Staff employee management audit logging', () => {
    test('records EMPLOYEE_CREATED audit event when admin creates employee', async () => {
        const superAdmin = await Employee.create({
            username: 'superadmin',
            password: 'SuperAdminPass123',
            role: 'admin',
            createdBy: null
        });

        const res = await request(app)
            .post('/api/v1/employee/admin/employees')
            .set('Authorization', `Bearer ${employeeToken(superAdmin)}`)
            .send({
                username: 'newworker',
                password: 'WorkerPass123',
                role: 'employee'
            });

        expect(res.status).toBe(201);
        const newEmployeeId = res.body.employee.id;

        const events = await AuditEvent.find({ targetId: newEmployeeId });
        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.action).toBe('EMPLOYEE_CREATED');
        expect(event.actorId.toString()).toBe(superAdmin._id.toString());
        expect(event.actorRole).toBe('admin');
        expect(event.targetType).toBe('Employee');
        expect(event.targetId).toBe(newEmployeeId);
        expect(event.requestId).toBeTruthy();
        expect(event.details.username).toBe('newworker');
        expect(event.details.role).toBe('employee');
        expect(event.details.password).toBeUndefined();

        const chain = await verifyAuditChain();
        expect(chain.valid).toBe(true);
        expect(chain.count).toBe(1);
    });

    test('records EMPLOYEE_DELETED audit event when admin deletes employee', async () => {
        const superAdmin = await Employee.create({
            username: 'superadmin',
            password: 'SuperAdminPass123',
            role: 'admin',
            createdBy: null
        });

        const employeeToDelete = await Employee.create({
            username: 'worker_to_delete',
            password: 'WorkerPass123',
            role: 'employee',
            createdBy: superAdmin._id
        });

        const res = await request(app)
            .delete(`/api/v1/employee/admin/employees/${employeeToDelete._id}`)
            .set('Authorization', `Bearer ${employeeToken(superAdmin)}`);

        expect(res.status).toBe(200);

        const events = await AuditEvent.find({ targetId: employeeToDelete._id.toString() });
        expect(events).toHaveLength(1);
        const event = events[0];

        expect(event.action).toBe('EMPLOYEE_DELETED');
        expect(event.actorId.toString()).toBe(superAdmin._id.toString());
        expect(event.actorRole).toBe('admin');
        expect(event.targetType).toBe('Employee');
        expect(event.targetId).toBe(employeeToDelete._id.toString());
        expect(event.details.username).toBe('worker_to_delete');

        const chain = await verifyAuditChain();
        expect(chain.valid).toBe(true);
        expect(chain.count).toBe(1);
    });

    test('does not record audit events on failed employee operations', async () => {
        const superAdmin = await Employee.create({
            username: 'superadmin',
            password: 'SuperAdminPass123',
            role: 'admin',
            createdBy: null
        });

        // Failed create: duplicate username
        const resDup = await request(app)
            .post('/api/v1/employee/admin/employees')
            .set('Authorization', `Bearer ${employeeToken(superAdmin)}`)
            .send({
                username: 'superadmin',
                password: 'WorkerPass123',
                role: 'employee'
            });
        expect(resDup.status).toBe(400);

        // Failed delete: non-existent employee
        const fakeId = new mongoose.Types.ObjectId();
        const resNonExistent = await request(app)
            .delete(`/api/v1/employee/admin/employees/${fakeId}`)
            .set('Authorization', `Bearer ${employeeToken(superAdmin)}`);
        expect(resNonExistent.status).toBe(404);

        const count = await AuditEvent.countDocuments();
        expect(count).toBe(0);
    });
});
