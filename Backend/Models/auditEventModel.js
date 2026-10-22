const mongoose = require('mongoose');
const crypto = require('node:crypto');

// References:
// Mongoose Team. (2025) Mongoose v8.0.0: Schemas. Available at: https://mongoosejs.com/docs/guide.html (Accessed: 29 October 2025).
// Express.js. (2025) Express.js - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/ (Accessed: 29 October 2025).

const AUDIT_ACTIONS = [
    'PAYMENT_APPROVED',
    'PAYMENT_DENIED',
    'EMPLOYEE_CREATED',
    'EMPLOYEE_DELETED',
    'STAFF_LOGIN_SUCCEEDED',
    'STAFF_LOGIN_FAILED'
];

const SENSITIVE_KEY_PATTERN = /password|token|secret|authorization|auth|jwt|bearertoken|nationalid|national_id|accountnumber|cardnumber|cvv|cardcvv|bankaccountnumber/i;
const SENSITIVE_VALUE_REGEXES = [
    /^\d{13}$/, // South African 13-digit national ID
    /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/ // JWT token shape
];

/**
 * Strips any sensitive credentials, tokens or personal identifiers from audit details.
 */
function sanitizeAuditDetails(obj) {
    if (obj == null) return {};
    if (typeof obj !== 'object' || Array.isArray(obj)) {
        return {};
    }
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
        if (SENSITIVE_KEY_PATTERN.test(k)) {
            continue;
        }
        if (typeof v === 'string') {
            const trimmed = v.trim();
            if (SENSITIVE_VALUE_REGEXES.some((rx) => rx.test(trimmed))) {
                continue;
            }
            clean[k] = v;
        } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
            clean[k] = sanitizeAuditDetails(v);
        } else if (Array.isArray(v)) {
            clean[k] = v.filter((item) => typeof item !== 'string' || !SENSITIVE_VALUE_REGEXES.some((rx) => rx.test(item.trim())));
        } else {
            clean[k] = v;
        }
    }
    return clean;
}

/**
 * Deterministically serialize a value into canonical JSON (RFC 8785 style key sorting).
 */
function canonicalStringify(val) {
    if (val === null || typeof val !== 'object') {
        return JSON.stringify(val);
    }
    if (val instanceof Date) {
        return JSON.stringify(val.toISOString());
    }
    if (Array.isArray(val)) {
        return '[' + val.map(canonicalStringify).join(',') + ']';
    }
    const keys = Object.keys(val).filter((k) => val[k] !== undefined).sort();
    return '{' + keys.map((k) => `${JSON.stringify(k)}:${canonicalStringify(val[k])}`).join(',') + '}';
}

/**
 * Extracts normalized canonical event fields for hashing.
 */
function getCanonicalPayload(event) {
    const atDate = event.at instanceof Date ? event.at : new Date(event.at);
    return {
        action: event.action,
        actorId: event.actorId ? String(event.actorId) : null,
        actorRole: event.actorRole || null,
        at: atDate.toISOString(),
        details: sanitizeAuditDetails(event.details || {}),
        ip: event.ip || null,
        requestId: event.requestId || null,
        targetId: event.targetId ? String(event.targetId) : null,
        targetType: event.targetType || null,
        userAgent: event.userAgent || null
    };
}

/**
 * Computes sha256(prevHash + canonical JSON of the event).
 */
function computeEventHash(prevHash, event) {
    const payload = canonicalStringify(getCanonicalPayload(event));
    const prefix = prevHash || '';
    return crypto.createHash('sha256').update(prefix + payload).digest('hex');
}

const auditEventSchema = new mongoose.Schema({
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    actorRole: {
        type: String,
        default: null,
        trim: true
    },
    action: {
        type: String,
        required: true,
        enum: AUDIT_ACTIONS
    },
    targetType: {
        type: String,
        default: null,
        trim: true
    },
    targetId: {
        type: String,
        default: null,
        trim: true
    },
    requestId: {
        type: String,
        default: null,
        trim: true
    },
    ip: {
        type: String,
        default: null,
        trim: true
    },
    userAgent: {
        type: String,
        default: null,
        trim: true
    },
    at: {
        type: Date,
        default: Date.now,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({})
    },
    prevHash: {
        type: String,
        default: null
    },
    hash: {
        type: String,
        required: true
    }
});

const rejectMutation = function (next) {
    const err = new Error('AuditEvent is append-only and cannot be modified or deleted');
    if (typeof next === 'function') {
        return next(err);
    }
    throw err;
};

// Document-level hooks
auditEventSchema.pre('save', async function (next) {
    if (!this.isNew) {
        const err = new Error('AuditEvent is append-only and cannot be modified');
        if (typeof next === 'function') return next(err);
        throw err;
    }
    if (this.details) {
        this.details = sanitizeAuditDetails(this.details);
    }
    if (!this.at) {
        this.at = new Date();
    }
    if (this.prevHash === undefined || this.prevHash === null) {
        const lastEvent = await this.constructor.findOne().sort({ at: -1, _id: -1 });
        this.prevHash = lastEvent ? lastEvent.hash : null;
    }
    if (!this.hash) {
        this.hash = computeEventHash(this.prevHash, this);
    }
    if (typeof next === 'function') return next();
});

auditEventSchema.pre('deleteOne', { document: true, query: false }, rejectMutation);

// Query-level hooks
const queryMutationHooks = [
    'updateOne',
    'updateMany',
    'findOneAndUpdate',
    'replaceOne',
    'findOneAndReplace',
    'deleteOne',
    'deleteMany',
    'findOneAndDelete'
];

queryMutationHooks.forEach((hookName) => {
    auditEventSchema.pre(hookName, rejectMutation);
});

const AuditEvent = mongoose.model('AuditEvent', auditEventSchema);

module.exports = {
    AuditEvent,
    AUDIT_ACTIONS,
    sanitizeAuditDetails,
    canonicalStringify,
    getCanonicalPayload,
    computeEventHash
};
