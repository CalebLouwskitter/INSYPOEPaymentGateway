const Payment = require('../Models/paymentModel.js');
const crypto = require('crypto');

// helper function to generate a unique transaction ID
const generateTransactionId = () => {
    return `TXN-${Date.now()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
};

// GET all payments for the authenticated user
const getAllPayments = async (req, res) => {
    try {
        const userId = req.user.userId;
        const payments = await Payment.find({ userId: userId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error retrieving payments", 
            error: error.message 
        });
    }
};

// GET a specific payment by ID
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const payment = await Payment.findOne({ _id: id, userId: userId });

        if (!payment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Get payment by ID error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error retrieving payment", 
            error: error.message 
        });
    }
};

// POST - create a new payment
const createPayment = async (req, res) => {
    try {
        const { amount, currency, paymentMethod, description, metadata } = req.body;
        const userId = req.user.userId;

        // validate required fields
        if (!amount || !paymentMethod) {
            return res.status(400).json({ 
                success: false,
                message: "Amount and payment method are required" 
            });
        }

        // validate amount
        if (amount <= 0) {
            return res.status(400).json({ 
                success: false,
                message: "Amount must be greater than zero" 
            });
        }

        // generate unique transaction ID
        const transactionId = generateTransactionId();

        // create the payment
        const newPayment = await Payment.create({
            userId: userId,
            amount: amount,
            currency: currency || 'USD',
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            description: description || '',
            metadata: metadata || {},
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: newPayment
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error creating payment", 
            error: error.message 
        });
    }
};

// PUT - update payment status
const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;

        // validate status
        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid status. Must be one of: " + validStatuses.join(', ')
            });
        }

        // find and update the payment
        const payment = await Payment.findOneAndUpdate(
            { _id: id, userId: userId },
            { status: status, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!payment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment status updated successfully",
            data: payment
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error updating payment status", 
            error: error.message 
        });
    }
};

// DELETE - delete a payment
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const payment = await Payment.findOneAndDelete({ _id: id, userId: userId });

        if (!payment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment deleted successfully",
            data: payment
        });
    } catch (error) {
        console.error('Delete payment error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error deleting payment", 
            error: error.message 
        });
    }
};

// GET payment statistics for the user
const getPaymentStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const stats = await Payment.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        const totalPayments = await Payment.countDocuments({ userId: userId });

        res.status(200).json({
            success: true,
            data: {
                totalPayments: totalPayments,
                statusBreakdown: stats
            }
        });
    } catch (error) {
        console.error('Get payment stats error:', error);
        res.status(500).json({ 
            success: false,
            message: "Error retrieving payment statistics", 
            error: error.message 
        });
    }
};

module.exports = { 
    getAllPayments, 
    getPaymentById, 
    createPayment, 
    updatePaymentStatus, 
    deletePayment,
    getPaymentStats
};
