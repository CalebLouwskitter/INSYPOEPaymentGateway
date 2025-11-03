const mongoose = require('mongoose');
const { randomBytes } = require('node:crypto');
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

    // Determine password securely: use env if provided; otherwise generate a strong random password
    const envPassword = process.env.SUPERADMIN_PASSWORD;
    const strongPassword = (typeof envPassword === 'string' && envPassword.length >= 8)
        ? envPassword
        : `Sa_${randomBytes(12).toString('base64url')}_!`;

        // Create super admin account
        const superAdmin = new Employee({
            username: 'superadmin',
            password: strongPassword,
            role: 'admin',
            createdBy: null // null indicates this is the super admin
        });

        await superAdmin.save();

        console.log('Super admin account created successfully!');
        console.log('-------------------------------------------');
        console.log('Username: superadmin');
        // Only print the generated password; if provided via env we assume caller knows it
        if (!envPassword) {
            console.log(`Password: ${strongPassword}`);
        } else {
            console.log('Password: (provided via SUPERADMIN_PASSWORD env var)');
        }
            console.log('-------------------------------------------');
        console.log('  IMPORTANT: Please change this password after first login!');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(' Error creating super admin:', error.message);
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
