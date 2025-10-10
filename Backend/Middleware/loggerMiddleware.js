// Lightweight structured logging & request correlation middleware
// Provides per-request ID, start/end logs, optional (sanitized) body logging.
// Controlled by environment flags so you can turn verbosity on/off without code changes.

 // (Node.js, 2025)
const { randomUUID } = require('crypto');

// Fields that should be masked if present in request bodies
 // (Node.js, 2025)
const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'auth', 'secret'];

// Recursively sanitize an object/array/value by masking sensitive fields
 // (Node.js, 2025)
function sanitize(value) {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (SENSITIVE_KEYS.includes(k.toLowerCase())) {
        out[k] = '***';
      } else {
        out[k] = sanitize(v);
      }
    }
    return out;
  }
  return value;
}

/**
 * loggerMiddleware(options)
 * @param {Object} options
 * @param {boolean} options.logBodies - whether to log (sanitized) JSON request bodies
 */
function loggerMiddleware(options = {}) {
  const { logBodies = false } = options;

  return function (req, res, next) {
    // Attach a unique ID to each request for correlation
    req.id = randomUUID();
    res.setHeader('X-Request-ID', req.id);

    const startHr = process.hrtime.bigint();

    // Determine if body should be logged (after JSON parsing middleware)
    // (Node.js, 2025)
    let bodyForLog;
    if (logBodies && req.body && req.is && req.is('application/json')) {
      // Only log up to 2KB of body to avoid noise
      const sanitized = sanitize(req.body);
      const json = JSON.stringify(sanitized);
      bodyForLog = json.length > 2048 ? json.slice(0, 2048) + '…(truncated)' : json;
    }
    // Log the incoming request
    const userTag = req.user ? (req.user.id || req.user._id || req.user.username || 'user') : 'anon';
    console.log(`[REQ] id=${req.id} method=${req.method} url=${req.originalUrl} user=${userTag} ip=${req.ip}${bodyForLog ? ' body=' + bodyForLog : ''}`);
    // Log when the response is finished
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startHr) / 1e6;
      const status = res.statusCode;
      const length = res.getHeader('content-length') || 0;
      console.log(`[RES] id=${req.id} status=${status} method=${req.method} url=${req.originalUrl} duration=${durationMs.toFixed(1)}ms length=${length}`);
    });

    next();
  };
}

module.exports = { loggerMiddleware };
