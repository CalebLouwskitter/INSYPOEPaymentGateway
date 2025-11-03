const Employee = require('../Models/employeeModel');

// References:
// Mongoose Team. (2025) Mongoose v8.0.0: Queries. Available at: https://mongoosejs.com/docs/queries.html (Accessed: 29 October 2025).
// Express.js. (2025) Express.js - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/ (Accessed: 29 October 2025).

// Get all employee accounts (excluding passwords)
// (Mongoose Team. 2025)
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .select('-password')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: employees.length,
            employees
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching employees' 
        });
    }
};

// Create a new employee account
// (Mongoose Team. 2025)
const createEmployee = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // If attempting to create an admin, only super admin may do so
        if (role === 'admin') {
            const requester = await Employee.findById(req.user.id).select('role createdBy');
            if (!requester || requester.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Only admins can create accounts'
                });
            }
            // Super admin is the only admin with createdBy === null
            if (requester.createdBy !== null) {
                return res.status(403).json({
                    success: false,
                    message: 'Only super admin can create admin accounts'
                });
            }
        }

        // Check if employee already exists
        const existingEmployee = await Employee.findOne({ username });
        if (existingEmployee) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Create new employee
        const employee = new Employee({
            username,
            password,
            role: role || 'employee',
            createdBy: req.user.id
        });

        await employee.save();

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            employee: {
                id: employee._id,
                username: employee.username,
                role: employee.role,
                createdAt: employee.createdAt
            }
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error creating employee' 
        });
    }
};

// Delete an employee account
// (Mongoose Team. 2025)
const deleteEmployee = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Prevent deleting yourself
        if (employeeId === req.user.id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete your own account' 
            });
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                message: 'Employee not found' 
            });
        }

        // Determine if requester is super admin (admin with createdBy === null)
        const requester = await Employee.findById(req.user.id).select('role createdBy');

        // Never allow deletion of super admin account
        if (employee.role === 'admin' && employee.createdBy === null) {
            return res.status(403).json({ 
                success: false, 
                message: 'Cannot delete super admin account' 
            });
        }

        // If target is an admin (not super), only super admin may delete
        if (employee.role === 'admin') {
            if (!requester || requester.role !== 'admin' || requester.createdBy !== null) {
                return res.status(403).json({
                    success: false,
                    message: 'Only super admin can delete admin accounts'
                });
            }
        }

        await Employee.findByIdAndDelete(employeeId);

        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error deleting employee' 
        });
    }
};

module.exports = {
    getAllEmployees,
    createEmployee,
    deleteEmployee
};
