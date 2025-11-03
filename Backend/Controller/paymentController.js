const Payment = require('../Models/paymentModel.js');
const crypto = require('node:crypto');

// helper function to generate a unique transaction ID
const generateTransactionId = () => {
    return `TXN-${Date.now()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
};

const resolveDemoSeedEnabled = () => {
    const explicit = process.env.DEMO_PAYMENTS_ENABLED;
    if (explicit === 'true') return true;
    if (explicit === 'false') return false;
    return process.env.NODE_ENV !== 'production';
};

const DEMO_PAYMENTS_ENABLED = resolveDemoSeedEnabled();
const DEMO_MIN_PAYMENTS = Number.parseInt(process.env.DEMO_MIN_PAYMENTS || '15', 10);

const demoPaymentBlueprints = Object.freeze([
    { description: 'Monthly Rent', amount: 1250.0, currency: 'USD', paymentMethod: 'bank_transfer', status: 'completed', metadata: { category: 'Housing', merchant: 'Sunset Apartments', reference: 'RENT-2025-04' } },
    { description: 'Electricity Bill', amount: 142.67, currency: 'USD', paymentMethod: 'debit_card', status: 'pending', metadata: { category: 'Utilities', merchant: 'GridPower Co.', reference: 'ELEC-8831' } },
    { description: 'Fiber Internet', amount: 89.99, currency: 'USD', paymentMethod: 'credit_card', status: 'completed', metadata: { category: 'Utilities', merchant: 'Velocity Fiber', reference: 'NET-5512' } },
    { description: 'Life Insurance Premium', amount: 215.45, currency: 'USD', paymentMethod: 'bank_transfer', status: 'completed', metadata: { category: 'Insurance', merchant: 'Harbor Insurance', reference: 'LIFE-0021' } },
    { description: 'Gym Membership', amount: 59.95, currency: 'USD', paymentMethod: 'credit_card', status: 'pending', metadata: { category: 'Health', merchant: 'Pulse Fitness', reference: 'GYM-APR' } },
    { description: 'Tuition Installment', amount: 624.0, currency: 'USD', paymentMethod: 'bank_transfer', status: 'completed', metadata: { category: 'Education', merchant: 'Northbridge University', reference: 'TUITION-3' } },
    { description: 'Car Lease Payment', amount: 412.5, currency: 'USD', paymentMethod: 'debit_card', status: 'completed', metadata: { category: 'Transport', merchant: 'FlexLease Motors', reference: 'LEASE-942' } },
    { description: 'Grocery Delivery', amount: 136.22, currency: 'USD', paymentMethod: 'paypal', status: 'completed', metadata: { category: 'Groceries', merchant: 'UrbanFresh', reference: 'GROC-1099' } },
    { description: 'Streaming Services Bundle', amount: 39.98, currency: 'USD', paymentMethod: 'credit_card', status: 'pending', metadata: { category: 'Entertainment', merchant: 'StreamSphere', reference: 'STREAM-APR' } },
    { description: 'Medical Specialist Visit', amount: 287.45, currency: 'USD', paymentMethod: 'credit_card', status: 'failed', metadata: { category: 'Health', merchant: 'Wellness Medical', reference: 'MED-7783' } },
    { description: 'Flight Reservation', amount: 842.15, currency: 'USD', paymentMethod: 'paypal', status: 'completed', metadata: { category: 'Travel', merchant: 'Jetway Airlines', reference: 'FLIGHT-BA239' } },
    { description: 'Quarterly Tax Payment', amount: 1498.0, currency: 'USD', paymentMethod: 'bank_transfer', status: 'completed', metadata: { category: 'Government', merchant: 'City Revenue Office', reference: 'TAX-Q2-2025' } },
    { description: 'Security Monitoring', amount: 45.0, currency: 'USD', paymentMethod: 'credit_card', status: 'pending', metadata: { category: 'Home', merchant: 'Sentinel Security', reference: 'SEC-4401' } },
    { description: 'Charity Donation', amount: 120.0, currency: 'USD', paymentMethod: 'paypal', status: 'completed', metadata: { category: 'Charity', merchant: 'Global Aid Trust', reference: 'DON-2025-04' } },
    { description: 'Cloud Software Subscription', amount: 68.5, currency: 'USD', paymentMethod: 'mobile_wallet', status: 'refunded', metadata: { category: 'Software', merchant: 'NimbusCloud', reference: 'SAAS-PLAN-PRO' } }
]);

const buildDemoPayments = (userId, existingCount, targetCount) => {
    const docs = [];
    const toCreate = Math.max(targetCount - existingCount, 0);

    for (let i = 0; i < toCreate; i += 1) {
        const template = demoPaymentBlueprints[i % demoPaymentBlueprints.length];
        const ageHours = (existingCount + i + 1) * 6;
        const createdAt = new Date(Date.now() - ageHours * 60 * 60 * 1000);

        docs.push({
            userId,
            amount: Number(template.amount),
            currency: String(template.currency).toUpperCase(),
            paymentMethod: template.paymentMethod,
            status: template.status,
            transactionId: generateTransactionId(),
            description: template.description,
            metadata: { ...template.metadata },
            createdAt,
            updatedAt: createdAt
        });
    }

    return docs;
};

const ensureDemoPaymentsForUser = async (userId) => {
    if (!DEMO_PAYMENTS_ENABLED) return;

    const existingCount = await Payment.countDocuments({ userId });
    if (existingCount >= DEMO_MIN_PAYMENTS) {
        return;
    }

    const demoDocs = buildDemoPayments(userId, existingCount, DEMO_MIN_PAYMENTS);
    if (!demoDocs.length) {
        return;
    }

    try {
        await Payment.insertMany(demoDocs, { ordered: false });
    } catch (err) {
        // Ignore duplicate key errors and continue; log others for visibility.
        if (err.code !== 11000) {
            console.error('Demo payment seeding error:', err);
        }
    }
};

// GET all payments for the authenticated user
const getAllPayments = async (req, res) => {
    try {
        const userId = req.user.userId;
        await ensureDemoPaymentsForUser(userId);
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

        // Validate and sanitize the ID using mongoose methods
        const payment = await Payment.findOne()
            .where('_id').equals(id)
            .where('userId').equals(userId);

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

        // create the payment with sanitized data
        const newPayment = new Payment({
            userId: userId,
            amount: Number(amount),
            currency: currency ? String(currency).toUpperCase() : 'USD',
            paymentMethod: String(paymentMethod),
            transactionId: transactionId,
            description: description ? String(description) : '',
            metadata: metadata || {},
            status: 'pending'
        });
        await newPayment.save();

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

        // find and update the payment using secure query methods
        const payment = await Payment.findOne()
            .where('_id').equals(id)
            .where('userId').equals(userId);

        if (!payment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }

        // Update the payment securely
        payment.status = status;
        payment.updatedAt = Date.now();
        await payment.save();

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

        // Use secure query methods to find and delete
        const payment = await Payment.findOne()
            .where('_id').equals(id)
            .where('userId').equals(userId);

        if (!payment) {
            return res.status(404).json({ 
                success: false,
                message: "Payment not found" 
            });
        }

        await payment.deleteOne();

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
