// Startup checks for settings the security controls depend on.
// Returns a list of problems; server.js refuses to start if there are any.

const fs = require('fs');

const PLACEHOLDER = /change.?this|your[-_ ]?(super[-_ ]?)?(jwt[-_ ]?)?secret/i;

const checkSecurityConfig = (env = process.env, options = {}) => {
    const problems = [];
    const warn = options.warn || console.warn;
    const secret = env.JWT_SECRET || '';

    if (!secret) {
        problems.push('JWT_SECRET is not set, so tokens cannot be signed or verified');
    } else if (env.NODE_ENV === 'production') {
        // HS256 secrets can be brute-forced offline from any captured token if they are short or guessable
        if (secret.length < 32) problems.push('JWT_SECRET must be at least 32 characters in production');
        if (PLACEHOLDER.test(secret)) problems.push('JWT_SECRET is still the placeholder from .env.example');
    }

    if (env.MONGODB_TLS_CA_FILE) {
        if (!fs.existsSync(env.MONGODB_TLS_CA_FILE)) {
            problems.push(`MONGODB_TLS_CA_FILE is set to "${env.MONGODB_TLS_CA_FILE}" but the file does not exist`);
        }
    }

    if (env.MONGODB_URI) {
        let uri;
        try {
            uri = new URL(env.MONGODB_URI);
        } catch {
            problems.push('MONGODB_URI is not a valid URI');
            return problems;
        }

        const hasCredentials = Boolean(uri.username && uri.password);
        const isSrv = uri.protocol === 'mongodb+srv:';
        const tlsParam = uri.searchParams.get('tls');
        const sslParam = uri.searchParams.get('ssl');
        const hasTls = isSrv
            ? tlsParam !== 'false' && sslParam !== 'false'
            : tlsParam === 'true' || sslParam === 'true' || Boolean(env.MONGODB_TLS_CA_FILE);

        if (env.NODE_ENV === 'production') {
            if (!hasCredentials) {
                problems.push('MONGODB_URI must include authentication credentials in production');
            }
            if (!hasTls) {
                problems.push('MONGODB_URI must enable TLS (e.g. ?tls=true or mongodb+srv://) in production');
            }
        } else if (env.NODE_ENV === 'development') {
            if (!hasCredentials) {
                warn('[CONFIG] Warning: MONGODB_URI has no credentials; enable authentication for production');
            }
            if (!hasTls) {
                warn('[CONFIG] Warning: MONGODB_URI does not use TLS; enable TLS for production');
            }
        }
    }

    return problems;
};

module.exports = { checkSecurityConfig };
