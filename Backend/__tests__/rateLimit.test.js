// Brute-force protection. Kept in its own file so the login limiter starts empty.

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGODB_URI);
    }
});

afterAll(async () => {
    await mongoose.connection.close();
});

test.failing('spoofing X-Forwarded-For does not reset the login rate limit', async () => {
    const statuses = [];
    for (let i = 0; i < 7; i++) {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .set('X-Forwarded-For', `203.0.113.${i + 1}`)
            .send({ fullName: 'Brute Force', accountNumber: '5000000001', nationalId: '5000000000001', password: `guess-${i}` });
        statuses.push(res.status);
    }
    expect(statuses.slice(0, 5).every((s) => s === 401)).toBe(true);
    expect(statuses.slice(5)).toEqual([429, 429]);
});
