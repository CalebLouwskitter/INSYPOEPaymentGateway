const mongoose = require('mongoose');

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
    email: {
        type: String,
        required: false,
        trim: true,
        lowercase: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// link it to the database
const User = mongoose.model('User', userSchema);

// expose it to the rest of the app
module.exports = User;
