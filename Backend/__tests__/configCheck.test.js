const { checkSecurityConfig } = require('../Services/configCheck');

describe('startup security configuration check', () => {
    test('refuses to run without a JWT secret', () => {
        expect(checkSecurityConfig({ NODE_ENV: 'development' })).toHaveLength(1);
    });

    test('refuses the .env.example placeholder in production', () => {
        const problems = checkSecurityConfig({
            NODE_ENV: 'production',
            JWT_SECRET: 'your_jwt_secret_key_change_this_in_production',
        });
        expect(problems.join(' ')).toMatch(/placeholder/);
    });

    test('refuses a short secret in production', () => {
        expect(checkSecurityConfig({ NODE_ENV: 'production', JWT_SECRET: 'hunter2' }).join(' ')).toMatch(/32 characters/);
    });

    test('accepts a long random secret in production', () => {
        expect(checkSecurityConfig({ NODE_ENV: 'production', JWT_SECRET: 'f'.repeat(16) + '0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d' })).toEqual([]);
    });

    describe('MongoDB connection and TLS configuration', () => {
        const validJwtSecret = 'f'.repeat(16) + '0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d';

        test('refuses unauthenticated MONGODB_URI in production', () => {
            const problems = checkSecurityConfig({
                NODE_ENV: 'production',
                JWT_SECRET: validJwtSecret,
                MONGODB_URI: 'mongodb://mongodb:27017/insy7314?tls=true',
            });
            expect(problems.join(' ')).toMatch(/credentials/i);
        });

        test('refuses non-TLS MONGODB_URI in production', () => {
            const problems = checkSecurityConfig({
                NODE_ENV: 'production',
                JWT_SECRET: validJwtSecret,
                MONGODB_URI: 'mongodb://insy7314_app:secret@mongodb:27017/insy7314',
            });
            expect(problems.join(' ')).toMatch(/tls/i);
        });

        test('refuses MONGODB_URI with neither credentials nor TLS in production', () => {
            const problems = checkSecurityConfig({
                NODE_ENV: 'production',
                JWT_SECRET: validJwtSecret,
                MONGODB_URI: 'mongodb://mongodb:27017/insy7314',
            });
            expect(problems).toHaveLength(2);
            expect(problems.join(' ')).toMatch(/credentials/i);
            expect(problems.join(' ')).toMatch(/tls/i);
        });

        test('refuses malformed MONGODB_URI', () => {
            const problems = checkSecurityConfig({
                NODE_ENV: 'production',
                JWT_SECRET: validJwtSecret,
                MONGODB_URI: 'not-a-valid-uri',
            });
            expect(problems.join(' ')).toMatch(/not a valid URI/i);
        });

        test('accepts authenticated and TLS MONGODB_URI in production', () => {
            const problems = checkSecurityConfig({
                NODE_ENV: 'production',
                JWT_SECRET: validJwtSecret,
                MONGODB_URI: 'mongodb://insy7314_app:secret@mongodb:27017/insy7314?authSource=insy7314&tls=true',
            });
            expect(problems).toEqual([]);
        });

        test('accepts mongodb+srv URI with credentials in production', () => {
            const problems = checkSecurityConfig({
                NODE_ENV: 'production',
                JWT_SECRET: validJwtSecret,
                MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/insy7314',
            });
            expect(problems).toEqual([]);
        });

        test('refuses non-existent MONGODB_TLS_CA_FILE', () => {
            const problems = checkSecurityConfig({
                NODE_ENV: 'production',
                JWT_SECRET: validJwtSecret,
                MONGODB_URI: 'mongodb://insy7314_app:secret@mongodb:27017/insy7314?authSource=insy7314&tls=true',
                MONGODB_TLS_CA_FILE: '/path/to/missing-ca-file-12345.pem',
            });
            expect(problems.join(' ')).toMatch(/file does not exist/i);
        });

        test('accepts existing MONGODB_TLS_CA_FILE', () => {
            const problems = checkSecurityConfig({
                NODE_ENV: 'production',
                JWT_SECRET: validJwtSecret,
                MONGODB_URI: 'mongodb://insy7314_app:secret@mongodb:27017/insy7314?authSource=insy7314',
                MONGODB_TLS_CA_FILE: __filename,
            });
            expect(problems).toEqual([]);
        });

        test('warns but does not refuse unauthenticated or non-TLS MONGODB_URI in development', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            const problems = checkSecurityConfig({
                NODE_ENV: 'development',
                JWT_SECRET: 'dev_secret',
                MONGODB_URI: 'mongodb://localhost:27017/insy7314',
            });
            expect(problems).toEqual([]);
            expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/credentials/i));
            expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/tls/i));
            warnSpy.mockRestore();
        });
    });
});
