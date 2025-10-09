const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// define the blueprint of a user
const userSchema = new mongoose.Schema({
    fullName: {
        type: String, 
        required: true,
        trim: true,
        minlength: 3
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 10,
        maxlength: 10
    },
    password: {
        type: String, 
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving if modified 
// Avoiding frontend validation issues by ensuring backend also enforces it
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const saltRounds = 12; // stronger cost factor
        this.password = await bcrypt.hash(this.password, saltRounds);
        return next();
    } catch (err) {
        return next(err);
    }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

// link it to the database
const User = mongoose.model('User', userSchema);

// expose it to the rest of the app
module.exports = User;
