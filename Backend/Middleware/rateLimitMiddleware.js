// Rate limiting middleware to prevent brute force attacks
const rateLimit = require('express-rate-limit');

// References:
// Npm. (2025) express-rate-limit - npm. Available at: https://www.npmjs.com/package/express-rate-limit (Accessed: 07 October 2025).

// Create a rate limiter for login attempts
// (Npm. 2025)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create a rate limiter for registration
// (Npm. 2025)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 registration requests per hour
    message: {
        success: false,
        message: 'Too many registration attempts from this IP, please try again after an hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Create a general API rate limiter
// (Npm. 2025)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Create a stricter rate limiter for payment operations
// (Npm. 2025)
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 payment requests per windowMs
    message: {
        success: false,
        message: 'Too many payment requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    registerLimiter,
    apiLimiter,
    paymentLimiter
};
