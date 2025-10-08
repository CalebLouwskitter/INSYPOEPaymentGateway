// cors - configuration options for an express API
// csurf - how it helps for CSRF attacks, and how to configure it for a node.js API
// helmet - how it helps when it comes to header protections and clickjacking
// rate limiting, brute force prevention, and what libraries can be used to implement this for a node.js API

const helmet = require('helmet');
const cors = require('cors');

// References:
// Helmetjs Team. (2025) helmet - npm. Available at: https://www.npmjs.com/package/helmet (Accessed: 07 January 2025).
// Helmetjs Team. (2025) Helmet.js Documentation. Available at: https://helmetjs.github.io/ (Accessed: 07 January 2025).
// Express.js Team. (2025) cors - npm. Available at: https://www.npmjs.com/package/cors (Accessed: 07 January 2025).
// Mozilla Developer Network. (2025) Cross-Origin Resource Sharing (CORS) - HTTP | MDN. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS (Accessed: 07 January 2025).

const corsOptions = {
    // origin allows us to set where we will permit requests from
    // In development, allow localhost with different ports
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || 'https://localhost:3000'
        : ['http://localhost:3000', 'https://localhost:3000', 'http://localhost:12345', 'https://localhost:5000'],
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
    app.use(helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                // allow scripts from the website itself
                'default-src': ["'self'"],
                // allow scripts from self and inline scripts (needed for React)
                'script-src': ["'self'", "'unsafe-inline'"],
                // allow styles from self and inline styles (needed for React)
                'style-src': ["'self'", "'unsafe-inline'"],
                // allow images from self and data URIs
                'img-src': ["'self'", "data:", "https:"],
                // prevent our website from being embedded on another website
                'frame-ancestors': ["'none'"],
            }
        },
        // stop our API from telling people that it is an Express API
        hidePoweredBy: true,
        // prevent our website from being put into an iframe
        frameguard: {
            action: 'deny'
        },
        // prevent IE from executing downloads in site's context
        ieNoOpen: true,
        // don't allow browsers to sniff MIME type
        noSniff: true,
        // enable XSS filter
        xssFilter: true
    }));
    
    // Mozilla Developer Network. (2025)
    // Apply CORS with the configured options
    app.use(cors(corsOptions));
    
    // Handle preflight requests
    app.options('*', cors(corsOptions));
};


module.exports = { securityMiddlewares };

