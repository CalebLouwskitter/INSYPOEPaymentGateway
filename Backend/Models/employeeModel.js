const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// References:
// Mongoose Team. (2025) Mongoose v8.0.0: Schemas. Available at: https://mongoosejs.com/docs/guide.html (Accessed: 29 October 2025).
// Npm. (2025) bcryptjs - npm. Available at: https://www.npmjs.com/package/bcryptjs (Accessed: 29 October 2025).

// Define the blueprint of an employee
const employeeSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['admin', 'employee'],
        default: 'employee',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    }
});

// Hash password before saving if modified
// (Npm. 2025)
employeeSchema.pre('save', async function (next) {
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
// (Npm. 2025)
employeeSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

// Link it to the database
const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
