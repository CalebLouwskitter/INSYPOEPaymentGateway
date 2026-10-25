const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const Employee = require('../Models/employeeModel');
const { recordAuditEvent } = require('../Services/auditService');
require('dotenv').config();

// References:
// Auth0. (2025) jsonwebtoken - npm. Available at: https://www.npmjs.com/package/jsonwebtoken (Accessed: 29 October 2025).
// Express.js. (2025) Express.js - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/ (Accessed: 29 October 2025).

// Used when the username does not exist, so a failed lookup costs as much as a wrong password
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 12);

// Employee login
// (Auth0. 2025)
const employeeLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Defensive checks in addition to route validation to avoid NoSQL injection from crafted payloads
        if (typeof username !== 'string' || typeof password !== 'string') {
            await recordAuditEvent({
                actorId: null,
                actorRole: null,
                action: 'STAFF_LOGIN_FAILED',
                targetType: 'StaffAuth',
                targetId: null,
                requestId: req.id,
                ip: req.ip,
                userAgent: req.get ? req.get('user-agent') : req.headers?.['user-agent'],
                details: { reason: 'Malformed credentials payload' }
            });
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        // Enforce expected username shape server-side as an allow-list guard
        if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
            await recordAuditEvent({
                actorId: null,
                actorRole: null,
                action: 'STAFF_LOGIN_FAILED',
                targetType: 'StaffAuth',
                targetId: null,
                requestId: req.id,
                ip: req.ip,
                userAgent: req.get ? req.get('user-agent') : req.headers?.['user-agent'],
                details: { username: String(username).slice(0, 50), reason: 'Invalid username format' }
            });
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Find employee by username
        const employee = await Employee.findOne()
            .where('username').equals(username);
        if (!employee) {
            await bcrypt.compare(password, DUMMY_HASH);
            await recordAuditEvent({
                actorId: null,
                actorRole: null,
                action: 'STAFF_LOGIN_FAILED',
                targetType: 'StaffAuth',
                targetId: null,
                requestId: req.id,
                ip: req.ip,
                userAgent: req.get ? req.get('user-agent') : req.headers?.['user-agent'],
                details: { username: String(username), reason: 'User not found' }
            });
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Verify password
        const isPasswordValid = await employee.comparePassword(password);
        if (!isPasswordValid) {
            await recordAuditEvent({
                actorId: employee._id,
                actorRole: employee.role,
                action: 'STAFF_LOGIN_FAILED',
                targetType: 'StaffAuth',
                targetId: employee._id.toString(),
                requestId: req.id,
                ip: req.ip,
                userAgent: req.get ? req.get('user-agent') : req.headers?.['user-agent'],
                details: { username: employee.username, reason: 'Invalid password' }
            });
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token with employee role
        // (Auth0. 2025)
        const token = jwt.sign(
            { 
                id: employee._id, 
                username: employee.username,
                role: employee.role,
                type: 'employee'
            },
            process.env.JWT_SECRET,
            { algorithm: 'HS256', expiresIn: '8h' }
        );

        await recordAuditEvent({
            actorId: employee._id,
            actorRole: employee.role,
            action: 'STAFF_LOGIN_SUCCEEDED',
            targetType: 'StaffAuth',
            targetId: employee._id.toString(),
            requestId: req.id,
            ip: req.ip,
            userAgent: req.get ? req.get('user-agent') : req.headers?.['user-agent'],
            details: { username: employee.username, role: employee.role }
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            employee: {
                id: employee._id,
                username: employee.username,
                role: employee.role
            }
        });
    } catch (error) {
        console.error('Employee login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

// Employee logout
const employeeLogout = async (req, res) => {
    try {
        // Token invalidation is handled by the client removing the token
        // and by the employeeAuthMiddleware blacklist
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        
        if (token) {
            const { invalidateEmployeeToken } = require('../Middleware/employeeAuthMiddleware');
            invalidateEmployeeToken(token);
        }

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Employee logout error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during logout' 
        });
    }
};

module.exports = {
    employeeLogin,
    employeeLogout
};
