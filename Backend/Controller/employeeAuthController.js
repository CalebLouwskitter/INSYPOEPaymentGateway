const jwt = require('jsonwebtoken');
const Employee = require('../Models/employeeModel');
require('dotenv').config();

// References:
// Auth0. (2025) jsonwebtoken - npm. Available at: https://www.npmjs.com/package/jsonwebtoken (Accessed: 29 October 2025).
// Express.js. (2025) Express.js - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/ (Accessed: 29 October 2025).

// Employee login
// (Auth0. 2025)
const employeeLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find employee by username
        const employee = await Employee.findOne({ username });
        if (!employee) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Verify password
        const isPasswordValid = await employee.comparePassword(password);
        if (!isPasswordValid) {
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
            { expiresIn: '8h' }
        );

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
