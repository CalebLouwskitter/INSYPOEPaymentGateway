const jwt = require('jsonwebtoken');
const Employee = require('../Models/employeeModel');
require('dotenv').config();

// References:
// Auth0. (2025) jsonwebtoken - npm. Available at: https://www.npmjs.com/package/jsonwebtoken (Accessed: 29 October 2025).

// Create a blacklist of tokens we have invalidated
const employeeTokenBlacklist = new Set();

// Verify employee token
// (Auth0. 2025)
const verifyEmployeeToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    
    if (employeeTokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token has been invalidated" });
    }

    // (Auth0. 2025)
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Verify this is an employee token
    if (decoded?.type !== 'employee') {
        return res.status(403).json({ message: "Invalid token type" });
    }

    // The role in the token is a snapshot from login time and the token lives for 8 hours.
    // Load the account so a deleted employee is locked out and a demoted admin loses
    // admin rights straight away, instead of when the token expires.
    try {
        const employee = await Employee.findById(decoded.id).select('role username');
        if (!employee) {
            return res.status(401).json({ message: "Account is no longer active" });
        }
        req.user = { ...decoded, role: employee.role, username: employee.username };
        next();
    } catch (err) {
        next(err);
    }
};

// Verify admin role
const verifyAdminRole = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ 
            message: "Access denied. Admin privileges required." 
        });
    }
    next();
};

// Verify employee or admin role
const verifyEmployeeRole = (req, res, next) => {
    if (!['employee', 'admin'].includes(req.user?.role)) {
        return res.status(403).json({ 
            message: "Access denied. Employee privileges required." 
        });
    }
    next();
};

const invalidateEmployeeToken = (token) => {
    employeeTokenBlacklist.add(token);
};

module.exports = { 
    verifyEmployeeToken, 
    verifyAdminRole, 
    verifyEmployeeRole,
    invalidateEmployeeToken 
};
