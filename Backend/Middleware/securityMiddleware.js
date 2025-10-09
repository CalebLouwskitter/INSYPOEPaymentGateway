// cors - configuration options for an express API
// csurf - how it helps for CSRF attacks, and how to configure it for a node.js API
// helmet - how it helps when it comes to header protections and clickjacking
// rate limiting, brute force prevention, and what libraries can be used to implement this for a node.js API

const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// References:
// Helmetjs Team. (2025) helmet - npm. Available at: https://www.npmjs.com/package/helmet (Accessed: 07 January 2025).
// Helmetjs Team. (2025) Helmet.js Documentation. Available at: https://helmetjs.github.io/ (Accessed: 07 January 2025).
// Express.js Team. (2025) cors - npm. Available at: https://www.npmjs.com/package/cors (Accessed: 07 January 2025).
// Mozilla Developer Network. (2025) Cross-Origin Resource Sharing (CORS) - HTTP | MDN. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS (Accessed: 07 January 2025).

const parseOrigins = (raw) => (raw || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
    // origin allows us to set where we will permit requests from
    // In development, allow localhost with different ports
    origin: (origin, cb) => {
        const allowList = process.env.NODE_ENV === 'production'
            ? parseOrigins(process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'https://localhost:3000')
            : ['http://localhost:3000', 'https://localhost:3000', 'http://localhost:12345', 'https://localhost:5000'];
        if (!origin) return cb(null, true); // allow same-origin/non-browser tools
        if (allowList.includes(origin)) return cb(null, true);
        cb(new Error('CORS origin not allowed'));
    },
    // controlling what types of HTTP requests we will permit
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // allow the flow of credentials between our backend API and our frontend web portal
    credentials: true,
    // allow these headers
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    // expose these headers to the client
    exposedHeaders: ['Authorization'],
    // cache preflight requests for 24 hours
    maxAge: 86400
};

// Helmetjs Team. (2025)
const securityMiddlewares = (app) => {
    // Trust reverse proxy for TLS info (e.g., x-forwarded-proto)
    app.set('trust proxy', 1);

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

    // Apply sanitizers and request hardening
    app.use(hpp());
    app.use(mongoSanitize());
    app.use(xss());

    // Limit body size
    app.use(require('express').json({ limit: '200kb' }));
    app.use(require('express').urlencoded({ extended: true, limit: '200kb' }));

    // Apply CORS with the configured options
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
};


module.exports = { securityMiddlewares };

