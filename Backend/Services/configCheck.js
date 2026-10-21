// Startup checks for settings the security controls depend on.
// Returns a list of problems; server.js refuses to start if there are any.

const PLACEHOLDER = /change.?this|your[-_ ]?(super[-_ ]?)?(jwt[-_ ]?)?secret/i;

const checkSecurityConfig = (env = process.env) => {
    const problems = [];
    const secret = env.JWT_SECRET || '';

    if (!secret) {
        problems.push('JWT_SECRET is not set, so tokens cannot be signed or verified');
    } else if (env.NODE_ENV === 'production') {
        // HS256 secrets can be brute-forced offline from any captured token if they are short or guessable
        if (secret.length < 32) problems.push('JWT_SECRET must be at least 32 characters in production');
        if (PLACEHOLDER.test(secret)) problems.push('JWT_SECRET is still the placeholder from .env.example');
    }

    return problems;
};

module.exports = { checkSecurityConfig };
