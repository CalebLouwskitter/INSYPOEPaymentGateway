// Input validation middleware using express-validator
const { body, param, validationResult } = require('express-validator');

// References:
// Express Validator Team. (2025) express-validator - npm. Available at: https://www.npmjs.com/package/express-validator (Accessed: 07 October 2025).
// Express Validator Team. (2025) express-validator Documentation. Available at: https://express-validator.github.io/docs/ (Accessed: 07 October 2025).

// bcrypt only uses the first 72 bytes of a password; reject longer ones instead of
// silently ignoring the rest
const withinBcryptLimit = (value) => Buffer.byteLength(value, 'utf8') <= 72;

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
// (Express Validator Team, 2025)
const validateRegister = [
    body('fullName')
        .isString()
        .withMessage('Full name must be text')
        .bail()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Full name must be between 3 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name can only contain letters and spaces'),
    body('accountNumber')
        .isString()
        .withMessage('Account number must be text')
        .bail()
        .trim()
        .isLength({ min: 10, max: 10 })
        .withMessage('Account number must be exactly 10 digits')
        .isNumeric()
        .withMessage('Account number must contain only numbers'),
    body('nationalId')
        .isString()
        .withMessage('National ID must be text')
        .bail()
        .trim()
        .isLength({ min: 13, max: 13 })
        .withMessage('National ID must be exactly 13 digits')
        .isNumeric()
        .withMessage('National ID must contain only numbers'),
    body('password')
        .isString()
        .withMessage('Password must be text')
        .bail()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .custom(withinBcryptLimit)
        .withMessage('Password must be at most 72 bytes long'),
    handleValidationErrors
];

// Validation rules for user login
// (Express Validator Team, 2025)
// Every field must be a plain string: an object such as { "$ne": null } is rejected here
// rather than relying on later String() coercion.
const validateLogin = [
    body('fullName')
        .isString()
        .withMessage('Full name must be text')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Full name is required'),
    body('accountNumber')
        .isString()
        .withMessage('Account number must be text')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Account number is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('Account number must be exactly 10 digits')
        .isNumeric()
        .withMessage('Account number must contain only numbers'),
    body('nationalId')
        .isString()
        .withMessage('National ID must be text')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('National ID is required')
        .isLength({ min: 13, max: 13 })
        .withMessage('National ID must be exactly 13 digits')
        .isNumeric()
        .withMessage('National ID must contain only numbers'),
    body('password')
        .isString()
        .withMessage('Password must be text')
        .bail()
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Validation rules for creating a payment
// (Express Validator Team, 2025)
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

// Validation rules for payment ID parameter
// (Express Validator Team, 2025)
const validatePaymentId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid payment ID'),
    handleValidationErrors
];

// export the validation middlewares
// (Express Validator Team, 2025)
module.exports = {
    validateRegister,
    validateLogin,
    validateCreatePayment,
    validatePaymentId,
    handleValidationErrors
};
