const Payment = require('../Models/paymentModel');
const Employee = require('../Models/employeeModel');

// References:
// Mongoose Team. (2025) Mongoose v8.0.0: Queries. Available at: https://mongoosejs.com/docs/queries.html (Accessed: 29 October 2025).
// Express.js. (2025) Express.js - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/ (Accessed: 29 October 2025).

// Get all pending payments
// (Mongoose Team. 2025)
const getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ status: 'pending' })
            .populate('userId', 'fullName accountNumber')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        console.error('Error fetching pending payments:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching payments' 
        });
    }
};

// Approve or deny a payment
// (Mongoose Team. 2025)
const processPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { action } = req.body; // 'approve' or 'deny'

        if (!['approve', 'deny'].includes(action)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid action. Must be "approve" or "deny"' 
            });
        }

        // Check-and-update in one atomic operation. Reading the payment, checking it is
        // pending and then saving would let two employees approve and deny the same
        // payment at the same time, with the last write silently winning.
        const payment = await Payment.findOneAndUpdate(
            { _id: paymentId, status: 'pending' },
            {
                status: action === 'approve' ? 'approved' : 'denied',
                processedBy: req.user.id,
                processedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!payment) {
            const exists = await Payment.exists({ _id: paymentId });
            if (!exists) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Payment not found' 
                });
            }
            return res.status(409).json({ 
                success: false, 
                message: 'Payment has already been processed' 
            });
        }

        res.status(200).json({
            success: true,
            message: `Payment ${action}d successfully`,
            payment
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error processing payment' 
        });
    }
};

// Get payment history (approved/denied payments)
// (Mongoose Team. 2025)
const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ 
            status: { $in: ['approved', 'denied'] } 
        })
            .populate('userId', 'fullName accountNumber')
            .populate('processedBy', 'username')
            .sort({ processedAt: -1 });

        res.status(200).json({
            success: true,
            count: payments.length,
            payments
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching payment history' 
        });
    }
};

module.exports = {
    getPendingPayments,
    processPayment,
    getPaymentHistory
};
