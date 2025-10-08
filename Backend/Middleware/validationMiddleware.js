// Input validation middleware using express-validator
const { body, param, validationResult } = require('express-validator');

// References:
// Express Validator Team. (2025) express-validator - npm. Available at: https://www.npmjs.com/package/express-validator (Accessed: 07 October 2025).
// Express Validator Team. (2025) express-validator Documentation. Available at: https://express-validator.github.io/docs/ (Accessed: 07 October 2025).

// Middleware to check validation results
// Express Validator Team. (2025)
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            message: 'Validation error',
            errors: errors.array() 
        });
    }
    next();
};

// Validation rules for user registration
// Express Validator Team. (2025)
const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Must be a valid email address')
        .normalizeEmail(),
    handleValidationErrors
];

// Validation rules for user login
// Express Validator Team. (2025)
const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Validation rules for creating a payment
// Express Validator Team. (2025)
const validateCreatePayment = [
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be a positive number'),
    body('currency')
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage('Currency must be a 3-letter code')
        .isAlpha()
        .withMessage('Currency must contain only letters')
        .toUpperCase(),
    body('paymentMethod')
        .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
        .withMessage('Invalid payment method'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    handleValidationErrors
];

// Validation rules for updating payment status
// Express Validator Team. (2025)
const validateUpdatePaymentStatus = [
    param('id')
        .isMongoId()
        .withMessage('Invalid payment ID'),
    body('status')
        .isIn(['pending', 'completed', 'failed', 'refunded'])
        .withMessage('Invalid status'),
    handleValidationErrors
];

// Validation rules for payment ID parameter
const validatePaymentId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid payment ID'),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateCreatePayment,
    validateUpdatePaymentStatus,
    validatePaymentId,
    handleValidationErrors
};
