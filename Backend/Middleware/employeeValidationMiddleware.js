const { body, param, validationResult } = require('express-validator');

// References:
// Express Validator Team. (2025) express-validator - npm. Available at: https://www.npmjs.com/package/express-validator (Accessed: 29 October 2025).

// Handle validation errors
// (Express Validator Team. 2025)
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }
    next();
};

// Validation rules for employee login
// (Express Validator Team. 2025)
const validateEmployeeLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
];

// Validation rules for creating employee
// (Express Validator Team. 2025)
const validateCreateEmployee = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
        .optional()
        .isIn(['admin', 'employee'])
        .withMessage('Role must be either "admin" or "employee"'),
    handleValidationErrors
];

// Validation rules for processing payment
// (Express Validator Team. 2025)
const validateProcessPayment = [
    param('paymentId')
        .isMongoId()
        .withMessage('Invalid payment ID'),
    body('action')
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['approve', 'deny'])
        .withMessage('Action must be either "approve" or "deny"'),
    handleValidationErrors
];

// Validation rules for deleting employee
// (Express Validator Team. 2025)
const validateDeleteEmployee = [
    param('employeeId')
        .isMongoId()
        .withMessage('Invalid employee ID'),
    handleValidationErrors
];

module.exports = {
    validateEmployeeLogin,
    validateCreateEmployee,
    validateProcessPayment,
    validateDeleteEmployee
};
