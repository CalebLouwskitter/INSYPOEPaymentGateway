const mongoose = require('mongoose');
const Employee = require('./Models/employeeModel');
require('dotenv').config();

/**
 * Script to remove the old admin account
 * Safe-guards:
 *  - Refuses to run in production (NODE_ENV === 'production')
 *  - Requires explicit --confirm flag
 * Usage: node removeOldAdmin.js --confirm
 */

if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run destructive script in production');
    process.exit(1);
}

if (!process.argv.includes('--confirm')) {
    console.error('This is a destructive operation. Re-run with --confirm to proceed.');
    console.error('    Usage: node removeOldAdmin.js --confirm');
    process.exit(1);
}

const removeOldAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find and delete the old admin with username 'superadmin'
        const result = await Employee.deleteOne({ 
            username: 'superadmin'
        });

        if (result.deletedCount > 0) {
            console.log('Old admin account deleted successfully!');
            console.log(`Deleted ${result.deletedCount} account(s)`);
        } else {
            console.log('No admin account found with username "superadmin"');
        }

        // Show all remaining employees
        const remainingEmployees = await Employee.find({}, 'username role createdAt');
        console.log('\nRemaining employees:');
        if (remainingEmployees.length > 0) {
            remainingEmployees.forEach(emp => {
                console.log(`- ${emp.username} (${emp.role})`);
            });
        } else {
            console.log('No employees found');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error removing admin:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

removeOldAdmin();
