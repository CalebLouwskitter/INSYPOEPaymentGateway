const express = require('express');
const { employeeLogin, employeeLogout } = require('../Controller/employeeAuthController');
const { getPendingPayments, processPayment, getPaymentHistory } = require('../Controller/employeeController');
const { getAllEmployees, createEmployee, deleteEmployee } = require('../Controller/adminController');
const { verifyEmployeeToken, verifyAdminRole, verifyEmployeeRole } = require('../Middleware/employeeAuthMiddleware');
const { loginLimiter, apiLimiter, paymentLimiter } = require('../Middleware/rateLimitMiddleware');
const { 
    validateEmployeeLogin, 
    validateCreateEmployee, 
    validateProcessPayment,
    validateDeleteEmployee 
} = require('../Middleware/employeeValidationMiddleware');

// References:
// Express.js. (2025) Express.js - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/ (Accessed: 29 October 2025).

const router = express.Router();

// Authentication routes
router.post('/auth/login', loginLimiter, validateEmployeeLogin, employeeLogin);
router.post('/auth/logout', verifyEmployeeToken, employeeLogout);

// Employee routes - accessible by both employees and admins
router.get('/payments/pending', verifyEmployeeToken, verifyEmployeeRole, apiLimiter, getPendingPayments);
router.put('/payments/:paymentId/process', verifyEmployeeToken, verifyEmployeeRole, paymentLimiter, validateProcessPayment, processPayment);
router.get('/payments/history', verifyEmployeeToken, verifyEmployeeRole, apiLimiter, getPaymentHistory);

// Admin-only routes
router.get('/admin/employees', verifyEmployeeToken, verifyAdminRole, apiLimiter, getAllEmployees);
router.post('/admin/employees', verifyEmployeeToken, verifyAdminRole, apiLimiter, validateCreateEmployee, createEmployee);
router.delete('/admin/employees/:employeeId', verifyEmployeeToken, verifyAdminRole, apiLimiter, validateDeleteEmployee, deleteEmployee);

module.exports = router;
