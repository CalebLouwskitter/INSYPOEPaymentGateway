const jwt = require('jsonwebtoken');
require('dotenv').config();

// References:
// Auth0. (2025) jsonwebtoken - npm. Available at: https://www.npmjs.com/package/jsonwebtoken (Accessed: 29 October 2025).

// Create a blacklist of tokens we have invalidated
const employeeTokenBlacklist = new Set();

// Verify employee token
// (Auth0. 2025)
const verifyEmployeeToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }
    
    if (employeeTokenBlacklist.has(token)) {
        return res.status(401).json({ message: "Token has been invalidated" });
    }

    // (Auth0. 2025)
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        
        // Verify this is an employee token
        if (decoded.type !== 'employee') {
            return res.status(403).json({ message: "Invalid token type" });
        }
        
        req.user = decoded;
        next();
    });
};

// Verify admin role
const verifyAdminRole = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            message: "Access denied. Admin privileges required." 
        });
    }
    next();
};

// Verify employee or admin role
const verifyEmployeeRole = (req, res, next) => {
    if (!['employee', 'admin'].includes(req.user.role)) {
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
