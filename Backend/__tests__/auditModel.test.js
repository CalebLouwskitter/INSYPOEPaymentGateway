const mongoose = require('mongoose');
const {
    AuditEvent,
    AUDIT_ACTIONS,
    sanitizeAuditDetails,
    recordAuditEvent,
    verifyAuditChain
} = require('../Services/auditService');

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Drop / clean the collection using raw collection to bypass Mongoose append-only pre-hooks
    if (mongoose.connection.collections.auditevents) {
        await mongoose.connection.collections.auditevents.deleteMany({});
    }
});

describe('AuditEvent Model & Hash Chain', () => {
    test('creates genesis event with prevHash null and valid sha256 hash', async () => {
        const actorId = new mongoose.Types.ObjectId();
        const event = await recordAuditEvent({
            actorId,
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            targetType: 'Employee',
            targetId: new mongoose.Types.ObjectId().toString(),
            requestId: 'req-123',
            ip: '127.0.0.1',
            userAgent: 'jest-agent',
            details: { username: 'testemployee', role: 'employee' }
        });

        expect(event._id).toBeDefined();
        expect(event.prevHash).toBeNull();
        expect(event.hash).toMatch(/^[a-f0-9]{64}$/);
        expect(event.action).toBe('EMPLOYEE_CREATED');
        expect(event.details.username).toBe('testemployee');
    });

    test('chains subsequent events with previous event hash', async () => {
        const actorId = new mongoose.Types.ObjectId();

        const ev1 = await recordAuditEvent({
            actorId,
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            targetType: 'Employee',
            targetId: 'target-1',
            details: { step: 1 }
        });

        const ev2 = await recordAuditEvent({
            actorId,
            actorRole: 'employee',
            action: 'PAYMENT_APPROVED',
            targetType: 'Payment',
            targetId: 'target-2',
            details: { step: 2 }
        });

        const ev3 = await recordAuditEvent({
            actorId,
            actorRole: 'employee',
            action: 'PAYMENT_DENIED',
            targetType: 'Payment',
            targetId: 'target-3',
            details: { step: 3 }
        });

        expect(ev1.prevHash).toBeNull();
        expect(ev2.prevHash).toBe(ev1.hash);
        expect(ev3.prevHash).toBe(ev2.hash);

        const check = await verifyAuditChain();
        expect(check.valid).toBe(true);
        expect(check.count).toBe(3);
    });

    test('verifyAuditChain returns valid: true for an empty log', async () => {
        const result = await verifyAuditChain();
        expect(result.valid).toBe(true);
        expect(result.count).toBe(0);
    });

    test('detects tampered event content via verifyAuditChain', async () => {
        const ev1 = await recordAuditEvent({
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            targetType: 'Employee',
            targetId: 'emp-1',
            details: { username: 'alice' }
        });

        const ev2 = await recordAuditEvent({
            actorRole: 'admin',
            action: 'EMPLOYEE_DELETED',
            targetType: 'Employee',
            targetId: 'emp-2',
            details: { username: 'bob' }
        });

        // Verify clean state
        let check = await verifyAuditChain();
        expect(check.valid).toBe(true);

        // Tamper directly via raw MongoDB driver bypassing Mongoose hooks
        await mongoose.connection.collections.auditevents.updateOne(
            { _id: ev1._id },
            { $set: { action: 'PAYMENT_APPROVED' } }
        );

        check = await verifyAuditChain();
        expect(check.valid).toBe(false);
        expect(check.tamperedIndex).toBe(0);
        expect(check.error).toContain('Tampered event at index 0');
    });

    test('detects tampered prevHash link', async () => {
        await recordAuditEvent({
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            targetId: 'emp-1'
        });

        const ev2 = await recordAuditEvent({
            actorRole: 'employee',
            action: 'PAYMENT_APPROVED',
            targetId: 'pay-1'
        });

        await mongoose.connection.collections.auditevents.updateOne(
            { _id: ev2._id },
            { $set: { prevHash: 'f'.repeat(64) } }
        );

        const check = await verifyAuditChain();
        expect(check.valid).toBe(false);
        expect(check.tamperedIndex).toBe(1);
    });

    test('refuses updates and deletes at application level via Mongoose hooks', async () => {
        const ev = await recordAuditEvent({
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            targetType: 'Employee',
            targetId: 'emp-1',
            details: { test: true }
        });

        // updateOne
        await expect(
            AuditEvent.updateOne({ _id: ev._id }, { $set: { action: 'PAYMENT_DENIED' } })
        ).rejects.toThrow(/append-only/i);

        // updateMany
        await expect(
            AuditEvent.updateMany({}, { $set: { actorRole: 'hacker' } })
        ).rejects.toThrow(/append-only/i);

        // findOneAndUpdate
        await expect(
            AuditEvent.findOneAndUpdate({ _id: ev._id }, { $set: { action: 'PAYMENT_DENIED' } })
        ).rejects.toThrow(/append-only/i);

        // replaceOne
        await expect(
            AuditEvent.replaceOne({ _id: ev._id }, { action: 'PAYMENT_DENIED' })
        ).rejects.toThrow(/append-only/i);

        // deleteOne
        await expect(
            AuditEvent.deleteOne({ _id: ev._id })
        ).rejects.toThrow(/append-only/i);

        // deleteMany
        await expect(
            AuditEvent.deleteMany({})
        ).rejects.toThrow(/append-only/i);

        // findOneAndDelete
        await expect(
            AuditEvent.findOneAndDelete({ _id: ev._id })
        ).rejects.toThrow(/append-only/i);

        // doc.deleteOne()
        await expect(
            ev.deleteOne()
        ).rejects.toThrow(/append-only/i);

        // doc.save() on existing doc
        ev.action = 'PAYMENT_DENIED';
        await expect(
            ev.save()
        ).rejects.toThrow(/append-only/i);
    });

    test('strips passwords, tokens, and national IDs from audit details', async () => {
        const ev = await recordAuditEvent({
            actorRole: 'admin',
            action: 'EMPLOYEE_CREATED',
            targetType: 'Employee',
            targetId: 'emp-1',
            details: {
                username: 'cleanUser',
                password: 'SecretPassword123!',
                token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotStore',
                nationalId: '9001010000000',
                nested: {
                    secret: 'dontLook',
                    accountNumber: '1000000001',
                    validNote: 'Safe data'
                },
                rawId: '8001015009087'
            }
        });

        expect(ev.details.username).toBe('cleanUser');
        expect(ev.details.password).toBeUndefined();
        expect(ev.details.token).toBeUndefined();
        expect(ev.details.nationalId).toBeUndefined();
        expect(ev.details.rawId).toBeUndefined();
        expect(ev.details.nested.secret).toBeUndefined();
        expect(ev.details.nested.accountNumber).toBeUndefined();
        expect(ev.details.nested.validNote).toBe('Safe data');
    });
});
