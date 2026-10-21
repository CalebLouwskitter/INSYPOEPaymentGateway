// cors - configuration options for an express API
// csurf - how it helps for CSRF attacks, and how to configure it for a node.js API
// helmet - how it helps when it comes to header protections and clickjacking
// rate limiting, brute force prevention, and what libraries can be used to implement this for a node.js API

const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// References:
// Helmetjs Team. (2025) helmet - npm. Available at: https://www.npmjs.com/package/helmet (Accessed: 07 January 2025).
// Helmetjs Team. (2025) Helmet.js Documentation. Available at: https://helmetjs.github.io/ (Accessed: 07 January 2025).
// Express.js Team. (2025) cors - npm. Available at: https://www.npmjs.com/package/cors (Accessed: 07 January 2025).
// Mozilla Developer Network. (2025) Cross-Origin Resource Sharing (CORS) - HTTP | MDN. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS (Accessed: 07 January 2025).
// Express.js. (2025) Express.js - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/ (Accessed: 07 October 2025).

// Helper to parse comma-separated origins from environment variable
const parseOrigins = (raw) => (raw || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

  // CORS configuration options
const corsOptions = {
    // origin allows us to set where we will permit requests from
    // In development, allow localhost with different ports
    origin: (origin, cb) => {
        const allowList = process.env.NODE_ENV === 'production'
            ? parseOrigins(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'https://localhost:3000')
            : ['http://localhost:3000', 'https://localhost:3000', 'http://localhost:12345', 'https://localhost:5000'];
        if (!origin) return cb(null, true); // allow same-origin/non-browser tools
        // For any other origin send no CORS headers; the browser then refuses to expose
        // the response. (Passing an Error here turned every such preflight into a 500.)
        cb(null, allowList.includes(origin));
    },
    // controlling what types of HTTP requests we will permit
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // allow the flow of credentials between our backend API and our frontend web portal
    credentials: true,
    // allow these headers
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-XSRF-Token', 'x-csrf-token', 'x-xsrf-token'],
    // expose these headers to the client
    exposedHeaders: ['Authorization'],
    // cache preflight requests for 24 hours
    maxAge: 86400
};


// this is a function to apply security-related middlewares to an express app
// (Helmetjs Team. 2025)
// Which proxies may set X-Forwarded-For / X-Forwarded-Proto. Off unless TRUST_PROXY is set:
// a number of hops (e.g. 1 behind a single Nginx) or a list such as "loopback, 10.0.0.0/8".
// Trusting one hop unconditionally meant that, with the API exposed directly, any client could
// send its own X-Forwarded-For and get a fresh rate-limit bucket on every request.
const parseTrustProxy = (raw) => {
    if (!raw || raw === 'false') return false;
    return /^\d+$/.test(raw) ? Number(raw) : raw;
};

const securityMiddlewares = (app) => {
    app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));
    // Apply Helmet for various header protections
    // (Helmetjs Team. 2025)
    app.use(helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                // allow scripts from the website itself
                'default-src': ["'self'"],
                // keep inline minimal (React dev may need it)
                'script-src': ["'self'", "'unsafe-inline'"],
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", "data:", "https:"],
                'frame-ancestors': ["'none'"],
                'connect-src': ["'self'"],
            }
        },
        referrerPolicy: { policy: 'no-referrer' },
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'same-origin' },
        frameguard: { action: 'deny' },
        hidePoweredBy: true,
        ieNoOpen: true,
        noSniff: true,
        // HSTS enabled by default in helmet; ensure TLS termination in front
    }));

    // Parse bodies first (with a size limit), then sanitise them. The sanitisers only
    // see what has already been parsed: when they ran before express.json(), req.body was
    // still undefined and operator keys like $ne or $where in JSON bodies went straight through.
    app.use(require('express').json({ limit: '200kb' }));
    app.use(require('express').urlencoded({ extended: true, limit: '200kb' }));

    app.use(hpp());
    // strip keys starting with $ or containing . from body, query, params and headers
    app.use(mongoSanitize());
    // XSS is handled on output (React escapes everything it renders, plus the CSP above)
    // rather than by rewriting input, so xss-clean is no longer used.

    // Apply CORS with the configured options
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
};


module.exports = { securityMiddlewares };

