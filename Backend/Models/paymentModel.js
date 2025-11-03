const mongoose = require('mongoose');

// define the blueprint of a payment
const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'ZAR',
        uppercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'denied', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },
    processedAt: {
        type: Date,
        default: null
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'mobile_wallet']
    },
    transactionId: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    metadata: {
        type: Map,
        of: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
paymentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// link it to the database
const Payment = mongoose.model('Payment', paymentSchema);

// expose it to the rest of the app
module.exports = Payment;
