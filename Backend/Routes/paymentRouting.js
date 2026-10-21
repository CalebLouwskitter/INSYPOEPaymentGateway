// calling in express to use its methods and functionality
const express = require('express');

const { verifyToken } = require('../Middleware/authMiddleware.js');
const { paymentLimiter } = require('../Middleware/rateLimitMiddleware.js');
const { 
    validateCreatePayment, 
    validatePaymentId 
} = require('../Middleware/validationMiddleware.js');
const { 
    getAllPayments, 
    getPaymentById, 
    createPayment, 
    deletePayment,
    getPaymentStats
} = require('../Controller/paymentController.js');

const router = express.Router();

// All payment routes require authentication
// Apply the verifyToken middleware to all routes in this router
router.use(verifyToken);

// Apply rate limiting to all payment routes
router.use(paymentLimiter);

// GET all payments for the authenticated user
router.get('/', getAllPayments);

// GET payment statistics
router.get('/stats', getPaymentStats);

// GET a specific payment by ID
router.get('/:id', validatePaymentId, getPaymentById);

// POST - create a new payment
router.post('/', validateCreatePayment, createPayment);

// There is deliberately no customer route for changing a payment's status.
// Approving or denying is an employee action (PUT /api/v1/employee/payments/:paymentId/process).

// DELETE - withdraw a payment that is still pending review
router.delete('/:id', validatePaymentId, deletePayment);

module.exports = router;
