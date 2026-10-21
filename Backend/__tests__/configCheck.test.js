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
});
