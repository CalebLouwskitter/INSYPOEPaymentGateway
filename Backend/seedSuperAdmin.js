const mongoose = require('mongoose');
const Employee = require('./Models/employeeModel');
require('dotenv').config();

// References:
// Mongoose Team. (2025) Mongoose v8.0.0: Getting Started. Available at: https://mongoosejs.com/docs/index.html (Accessed: 29 October 2025).

/**
 * Script to create a super admin account
 * This should be run once to initialize the system with a super admin
 * 
 * Usage: node seedSuperAdmin.js
 */

const createSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if super admin already exists
        const existingAdmin = await Employee.findOne({ 
            username: 'superadmin',
            role: 'admin',
            createdBy: null 
        });

        if (existingAdmin) {
            console.log('Super admin already exists!');
            console.log('Username: superadmin');
            await mongoose.connection.close();
            process.exit(0);
        }

    // Password must meet validation requirements:
    // - At least 8 characters
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character
    const strongPassword = 'SuperAdmin123!';

        // Create super admin account
        const superAdmin = new Employee({
            username: 'superadmin',
            password: strongPassword,
            role: 'admin',
            createdBy: null // null indicates this is the super admin
        });

        await superAdmin.save();

        console.log('✅ Super admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: superadmin');
    console.log('Password: SuperAdmin123!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANT: Please change this password after first login!');
        console.log('');
        console.log('Password Requirements:');
        console.log('- At least 8 characters');
        console.log('- At least one uppercase letter');
        console.log('- At least one lowercase letter');
        console.log('- At least one number');
        console.log('- At least one special character');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
        if (error.errors) {
            console.error('Validation errors:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }
        await mongoose.connection.close();
        process.exit(1);
    }
};

createSuperAdmin();
