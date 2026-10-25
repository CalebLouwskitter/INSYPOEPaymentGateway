const {
    AuditEvent,
    AUDIT_ACTIONS,
    sanitizeAuditDetails,
    canonicalStringify,
    getCanonicalPayload,
    computeEventHash
} = require('../Models/auditEventModel');

/**
 * Appends a new audit event to the append-only log with hash chaining.
 *
 * @param {Object} data
 * @param {string|mongoose.Types.ObjectId} [data.actorId]
 * @param {string} [data.actorRole]
 * @param {string} data.action
 * @param {string} [data.targetType]
 * @param {string} [data.targetId]
 * @param {string} [data.requestId]
 * @param {string} [data.ip]
 * @param {string} [data.userAgent]
 * @param {Date} [data.at]
 * @param {Object} [data.details]
 * @returns {Promise<AuditEvent>}
 */
async function recordAuditEvent(data) {
    const {
        actorId = null,
        actorRole = null,
        action,
        targetType = null,
        targetId = null,
        requestId = null,
        ip = null,
        userAgent = null,
        at = new Date(),
        details = {}
    } = data;

    const atDate = at instanceof Date ? at : new Date(at);
    const sanitizedDetails = sanitizeAuditDetails(details);

    // Retrieve previous event in chain to link prevHash
    const lastEvent = await AuditEvent.findOne().sort({ at: -1, _id: -1 });
    const prevHash = lastEvent ? lastEvent.hash : null;

    const payloadForHash = {
        action,
        actorId,
        actorRole,
        at: atDate,
        details: sanitizedDetails,
        ip,
        requestId,
        targetId,
        targetType,
        userAgent
    };

    const hash = computeEventHash(prevHash, payloadForHash);

    const event = new AuditEvent({
        actorId,
        actorRole,
        action,
        targetType,
        targetId: targetId ? String(targetId) : null,
        requestId,
        ip,
        userAgent,
        at: atDate,
        details: sanitizedDetails,
        prevHash,
        hash
    });

    await event.save();
    return event;
}

/**
 * Validates the entire hash chain of the audit log.
 * Detects missing events, altered payloads, or broken prevHash links.
 *
 * @returns {Promise<{ valid: boolean, count: number, error?: string, tamperedIndex?: number, eventId?: any }>}
 */
async function verifyAuditChain() {
    const events = await AuditEvent.find().sort({ at: 1, _id: 1 });
    if (!events || events.length === 0) {
        return { valid: true, count: 0 };
    }

    let previousHash = null;

    for (let i = 0; i < events.length; i++) {
        const event = events[i];

        // 1. Verify prevHash link
        if (i === 0) {
            if (event.prevHash !== null && event.prevHash !== '' && event.prevHash !== '0'.repeat(64)) {
                return {
                    valid: false,
                    error: `Genesis event has invalid prevHash: ${event.prevHash}`,
                    tamperedIndex: 0,
                    eventId: event._id
                };
            }
        } else {
            if (event.prevHash !== previousHash) {
                return {
                    valid: false,
                    error: `Chain broken at index ${i}: expected prevHash ${previousHash}, got ${event.prevHash}`,
                    tamperedIndex: i,
                    eventId: event._id
                };
            }
        }

        // 2. Verify hash calculation against canonical payload
        const expectedHash = computeEventHash(event.prevHash, event);
        if (event.hash !== expectedHash) {
            return {
                valid: false,
                error: `Tampered event at index ${i}: stored hash ${event.hash} does not match expected hash ${expectedHash}`,
                tamperedIndex: i,
                eventId: event._id
            };
        }

        previousHash = event.hash;
    }

    return { valid: true, count: events.length };
}

module.exports = {
    recordAuditEvent,
    verifyAuditChain,
    AuditEvent,
    AUDIT_ACTIONS,
    sanitizeAuditDetails,
    canonicalStringify,
    getCanonicalPayload,
    computeEventHash
};
