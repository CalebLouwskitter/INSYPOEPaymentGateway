// References:
// Jestjs.io. (2025) Jest - Getting Started. Available at: https://jestjs.io/docs/getting-started (Accessed: 07 October 2025).
// Visionmedia. (2025) supertest - npm. Available at: https://www.npmjs.com/package/supertest (Accessed: 07 October 2025).
// OWASP. (2025) OWASP Top Ten. Available at: https://owasp.org/www-project-top-ten/ (Accessed: 05 November 2025).

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../Models/userModel');
const Employee = require('../Models/employeeModel');
const Payment = require('../Models/paymentModel');

// Test database setup
beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/insy7314_test';
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }
});

afterAll(async () => {
    // Clean up and close database connection
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Payment.deleteMany({});
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Payment.deleteMany({});
});

describe('API Security Tests', () => {
    
    // ============================================
    // 1. AUTHENTICATION SECURITY TESTS
    // ============================================
    describe('1. Authentication Security', () => {
        
        test('should reject requests without authentication token', async () => {
            const response = await request(app)
                .get('/api/v1/payments')
                .expect(401);
            
            expect(response.body.message).toBe('No token provided');
        });

        test('should reject requests with invalid token format', async () => {
            const response = await request(app)
                .get('/api/v1/payments')
                .set('Authorization', 'InvalidTokenFormat')
                .expect(401);
            
            expect(response.body.message).toBe('No token provided');
        });

        test('should reject requests with expired/invalid JWT token', async () => {
            const response = await request(app)
                .get('/api/v1/payments')
                .set('Authorization', 'Bearer invalid.jwt.token')
                .expect(403);
            
            expect(response.body.message).toBe('Invalid or expired token');
        });

        test('should reject login with invalid credentials', async () => {
            // Try to login without registering first
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    fullName: 'John Doe',
                    accountNumber: '1234567890',
                    nationalId: '1234567890123',
                    password: 'wrongpassword'
                })
                .expect(401);
            
            expect(response.body.message).toContain('Invalid');
        });

        test('should successfully authenticate with valid credentials', async () => {
            // Register a user first
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'John Doe',
                    accountNumber: '1234567890',
                    nationalId: '1234567890123',
                    password: 'SecurePass123!'
                });
            
            // Login with correct credentials
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    fullName: 'John Doe',
                    accountNumber: '1234567890',
                    nationalId: '1234567890123',
                    password: 'SecurePass123!'
                })
                .expect(200);
            
            expect(response.body.token).toBeDefined();
            expect(response.body.message).toContain('success');
        });

        test('should invalidate token after logout', async () => {
            // Register and login
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Jane Doe',
                    accountNumber: '0987654321',
                    nationalId: '9876543210987',
                    password: 'SecurePass123!'
                });
            
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    fullName: 'Jane Doe',
                    accountNumber: '0987654321',
                    nationalId: '9876543210987',
                    password: 'SecurePass123!'
                });
            
            const token = loginRes.body.token;
            
            // Logout
            await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            
            // Try to use the token after logout
            const response = await request(app)
                .get('/api/v1/payments')
                .set('Authorization', `Bearer ${token}`)
                .expect(401);
            
            expect(response.body.message).toContain('invalidated');
        });
    });

    // ============================================
    // 2. AUTHORIZATION SECURITY TESTS (RBAC)
    // ============================================
    describe('2. Authorization & Role-Based Access Control', () => {
        
        let userToken;
        let employeeToken;
        let adminToken;

        beforeEach(async () => {
            // Create regular user
            const userRes = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Regular User',
                    accountNumber: '1111111111',
                    nationalId: '1111111111111',
                    password: 'UserPass123!'
                });
            userToken = userRes.body.token;

            // Create employee
            const employee = new Employee({
                username: 'employee1',
                password: 'EmployeePass123!',
                role: 'employee'
            });
            employee.markModified('password');
            await employee.save();

            const empRes = await request(app)
                .post('/api/v1/employee/auth/login')
                .send({
                    username: 'employee1',
                    password: 'EmployeePass123!'
                });
            employeeToken = empRes.body.token;

            // Create admin
            const admin = new Employee({
                username: 'admin1',
                password: 'AdminPass123!',
                role: 'admin'
            });
            admin.markModified('password');
            await admin.save();

            const adminRes = await request(app)
                .post('/api/v1/employee/auth/login')
                .send({
                    username: 'admin1',
                    password: 'AdminPass123!'
                });
            adminToken = adminRes.body.token;
        });

        test('should prevent regular users from accessing employee endpoints', async () => {
            const response = await request(app)
                .get('/api/v1/employee/payments/pending')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
            
            expect(response.body.message).toContain('Invalid token type');
        });

        test('should allow employees to access employee endpoints', async () => {
            const response = await request(app)
                .get('/api/v1/employee/payments/pending')
                .set('Authorization', `Bearer ${employeeToken}`)
                .expect(200);
        });

        test('should prevent employees from accessing admin-only endpoints', async () => {
            const response = await request(app)
                .get('/api/v1/employee/admin/employees')
                .set('Authorization', `Bearer ${employeeToken}`)
                .expect(403);
            
            expect(response.body.message).toContain('Admin privileges required');
        });

        test('should allow admins to access admin-only endpoints', async () => {
            const response = await request(app)
                .get('/api/v1/employee/admin/employees')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
        });
    });

    // ============================================
    // 3. INPUT VALIDATION TESTS
    // ============================================
    describe('3. Input Validation Security', () => {
        
        test('should reject registration with missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User'
                    // Missing accountNumber, nationalId, password
                })
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });

        test('should reject registration with invalid account number format', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User',
                    accountNumber: '12345', // Too short
                    nationalId: '1234567890123',
                    password: 'SecurePass123!'
                })
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });

        test('should reject registration with invalid national ID format', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User',
                    accountNumber: '1234567890',
                    nationalId: '12345', // Too short
                    password: 'SecurePass123!'
                })
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });

        test('should reject registration with weak password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User',
                    accountNumber: '1234567890',
                    nationalId: '1234567890123',
                    password: 'weak' // Too weak
                })
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });

        test('should reject payment creation with negative amount', async () => {
            // Register and login
            const loginRes = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User',
                    accountNumber: '2222222222',
                    nationalId: '2222222222222',
                    password: 'SecurePass123!'
                });
            
            const response = await request(app)
                .post('/api/v1/payments')
                .set('Authorization', `Bearer ${loginRes.body.token}`)
                .send({
                    amount: -100, // Invalid negative amount
                    currency: 'USD',
                    paymentMethod: 'credit_card'
                })
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });

        test('should reject payment with invalid payment method', async () => {
            // Register and login
            const loginRes = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User',
                    accountNumber: '3333333333',
                    nationalId: '3333333333333',
                    password: 'SecurePass123!'
                });
            
            const response = await request(app)
                .post('/api/v1/payments')
                .set('Authorization', `Bearer ${loginRes.body.token}`)
                .send({
                    amount: 100,
                    currency: 'USD',
                    paymentMethod: 'invalid_method' // Invalid method
                })
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });

        test('should reject payment with invalid MongoDB ObjectID', async () => {
            // Register and login
            const loginRes = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Test User',
                    accountNumber: '4444444444',
                    nationalId: '4444444444444',
                    password: 'SecurePass123!'
                });
            
            const response = await request(app)
                .get('/api/v1/payments/invalid-id-format')
                .set('Authorization', `Bearer ${loginRes.body.token}`)
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });
    });

    // ============================================
    // 4. INJECTION ATTACK PREVENTION TESTS
    // ============================================
    describe('4. Injection Attack Prevention', () => {
        
        test('should prevent NoSQL injection in login', async () => {
            // Attempt NoSQL injection
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    fullName: { $ne: null }, // NoSQL injection attempt
                    accountNumber: '1234567890',
                    nationalId: '1234567890123',
                    password: { $ne: null }
                })
                .expect(400);
            
            // Should be rejected by validation
            expect(response.body).toBeDefined();
        });

        test('should sanitize XSS attempts in input fields', async () => {
            const xssPayload = '<script>alert("XSS")</script>';
            
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: xssPayload,
                    accountNumber: '5555555555',
                    nationalId: '5555555555555',
                    password: 'SecurePass123!'
                });
            
            // Even if registration succeeds, the stored data should be sanitized
            if (response.status === 200 || response.status === 201) {
                const user = await User.findOne({ accountNumber: '5555555555' });
                // The fullName should not contain script tags
                expect(user.fullName).not.toContain('<script>');
            }
        });

        test('should prevent SQL-like injection patterns in employee username', async () => {
            const response = await request(app)
                .post('/api/v1/employee/auth/login')
                .send({
                    username: "admin' OR '1'='1", // SQL injection pattern
                    password: 'password'
                })
                .expect(400);
            
            // Should be rejected by validation (username pattern check)
            expect(response.body).toBeDefined();
        });
    });

    // ============================================
    // 5. RATE LIMITING TESTS
    // ============================================
    describe('5. Rate Limiting Security', () => {
        
        test('should enforce rate limiting on login attempts', async () => {
            const loginData = {
                fullName: 'Test User',
                accountNumber: '6666666666',
                nationalId: '6666666666666',
                password: 'wrongpassword'
            };

            // Make multiple rapid requests (more than the limit of 5)
            const requests = [];
            for (let i = 0; i < 7; i++) {
                requests.push(
                    request(app)
                        .post('/api/v1/auth/login')
                        .send(loginData)
                );
            }

            const responses = await Promise.all(requests);
            
            // At least one should be rate limited (429)
            const rateLimited = responses.some(res => res.status === 429);
            expect(rateLimited).toBe(true);
        }, 15000);

        test('should enforce rate limiting on registration attempts', async () => {
            const requests = [];
            
            // Make multiple rapid registration requests (more than the limit of 3)
            for (let i = 0; i < 5; i++) {
                requests.push(
                    request(app)
                        .post('/api/v1/auth/register')
                        .send({
                            fullName: `User ${i}`,
                            accountNumber: `${7000000000 + i}`,
                            nationalId: `${7000000000000 + i}`,
                            password: 'SecurePass123!'
                        })
                );
            }

            const responses = await Promise.all(requests);
            
            // At least one should be rate limited
            const rateLimited = responses.some(res => res.status === 429);
            expect(rateLimited).toBe(true);
        }, 15000);
    });

    // ============================================
    // 6. SECURITY HEADERS TESTS
    // ============================================
    describe('6. Security Headers', () => {
        
        test('should include security headers in responses', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            // Check for essential security headers set by helmet
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBeDefined();
            expect(response.headers['x-xss-protection']).toBeDefined();
        });

        test('should set proper CORS headers', async () => {
            const response = await request(app)
                .options('/api/v1/auth/login')
                .set('Origin', 'http://localhost:3000')
                .expect(204);
            
            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.headers['access-control-allow-methods']).toBeDefined();
        });

        test('should include rate limit headers', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    fullName: 'Test',
                    accountNumber: '8888888888',
                    nationalId: '8888888888888',
                    password: 'test'
                });
            
            // Check for rate limit headers
            expect(response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit']).toBeDefined();
        });
    });

    // ============================================
    // 7. SESSION MANAGEMENT TESTS
    // ============================================
    describe('7. Session Management Security', () => {
        
        test('should not allow reuse of token after logout', async () => {
            // Register user
            const registerRes = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Session Test User',
                    accountNumber: '9999999999',
                    nationalId: '9999999999999',
                    password: 'SecurePass123!'
                });
            
            const token = registerRes.body.token;
            
            // Verify token works
            await request(app)
                .get('/api/v1/payments')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            
            // Logout
            await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            
            // Token should not work anymore
            await request(app)
                .get('/api/v1/payments')
                .set('Authorization', `Bearer ${token}`)
                .expect(401);
        });

        test('should properly separate employee and user token types', async () => {
            // Create employee
            const employee = new Employee({
                username: 'test_employee',
                password: 'EmployeePass123!',
                role: 'employee'
            });
            employee.markModified('password');
            await employee.save();

            const empRes = await request(app)
                .post('/api/v1/employee/auth/login')
                .send({
                    username: 'test_employee',
                    password: 'EmployeePass123!'
                });
            
            const employeeToken = empRes.body.token;

            // Employee token should not work on user endpoints
            const response = await request(app)
                .get('/api/v1/payments')
                .set('Authorization', `Bearer ${employeeToken}`)
                .expect(403);
            
            expect(response.body.message).toContain('Invalid or expired token');
        });
    });

    // ============================================
    // 8. ERROR HANDLING SECURITY TESTS
    // ============================================
    describe('8. Secure Error Handling', () => {
        
        test('should not expose sensitive error details in responses', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    fullName: 'Nonexistent User',
                    accountNumber: '0000000000',
                    nationalId: '0000000000000',
                    password: 'wrongpassword'
                });
            
            // Should return generic error message, not specific details
            expect(response.body.message).not.toContain('stack');
            expect(response.body.message).not.toContain('mongoose');
            expect(response.body.message).not.toContain('database');
        });

        test('should handle malformed JSON gracefully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .set('Content-Type', 'application/json')
                .send('{ invalid json }');
            
            // Should return error without exposing internal details (500 is acceptable for malformed JSON)
            expect([400, 500]).toContain(response.status);
            expect(response.body).not.toHaveProperty('stack');
        });

        test('should return 404 for non-existent routes without exposing system info', async () => {
            const response = await request(app)
                .get('/api/v1/nonexistent/route')
                .expect(404);
            
            expect(response.body.error).toBe('Route not found');
            expect(response.body).not.toHaveProperty('stack');
        });
    });

    // ============================================
    // 9. PAYMENT-SPECIFIC SECURITY TESTS
    // ============================================
    describe('9. Payment API Security', () => {
        
        let userToken;

        beforeEach(async () => {
            const registerRes = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Payment Test User',
                    accountNumber: '1010101010',
                    nationalId: '1010101010101',
                    password: 'SecurePass123!'
                });
            userToken = registerRes.body.token;
        });

        test('should only allow users to view their own payments', async () => {
            // Create a payment for user 1
            const paymentRes = await request(app)
                .post('/api/v1/payments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    amount: 100,
                    currency: 'USD',
                    paymentMethod: 'credit_card',
                    description: 'Test payment'
                })
                .expect(201);

            // Create another user
            const user2Res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    fullName: 'Another User',
                    accountNumber: '2020202020',
                    nationalId: '2020202020202',
                    password: 'SecurePass123!'
                });
            
            const user2Token = user2Res.body.token;

            // User 2 should not see User 1's payments in their list
            const response = await request(app)
                .get('/api/v1/payments')
                .set('Authorization', `Bearer ${user2Token}`)
                .expect(200);
            
            expect(response.body.payments).toBeDefined();
            expect(response.body.payments.length).toBe(0);
        });

        test('should validate payment amount boundaries', async () => {
            // Test with zero amount
            const response = await request(app)
                .post('/api/v1/payments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    amount: 0,
                    currency: 'USD',
                    paymentMethod: 'credit_card'
                })
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });

        test('should enforce authorized payment status transitions', async () => {
            // Create a payment
            const paymentRes = await request(app)
                .post('/api/v1/payments')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    amount: 100,
                    currency: 'USD',
                    paymentMethod: 'credit_card'
                });
            
            const paymentId = paymentRes.body.payment._id;

            // Try to update with invalid status
            const response = await request(app)
                .put(`/api/v1/payments/${paymentId}/status`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    status: 'invalid_status'
                })
                .expect(400);
            
            expect(response.body.errors).toBeDefined();
        });
    });

    // ============================================
    // 10. API DOCUMENTATION & HEALTH CHECK TESTS
    // ============================================
    describe('10. API Documentation & Monitoring', () => {
        
        test('should have health check endpoint for monitoring', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);
            
            expect(response.body.status).toBe('healthy');
            expect(response.body.timestamp).toBeDefined();
        });

        test('should have API version endpoint', async () => {
            const response = await request(app)
                .get('/api/v1')
                .expect(200);
            
            expect(response.body.message).toBeDefined();
            expect(response.body.version).toBeDefined();
        });

        test('should properly version API endpoints', async () => {
            // All endpoints should be under /api/v1
            const response = await request(app)
                .get('/api/v1/auth/nonexistent')
                .expect(404);
            
            expect(response.body.error).toBe('Route not found');
        });
    });
});
