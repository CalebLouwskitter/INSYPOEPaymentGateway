import employeeAxiosInstance from '../interfaces/employeeAxiosInstance';

// References:
// Axios Team. (2025) axios - npm. Available at: https://www.npmjs.com/package/axios (Accessed: 03 November 2025).

/**
 * Admin service
 * Handles admin-only operations for managing employees
 */

export const adminService = {
  /**
   * Get all employees
   * @returns {Promise<Object>} Response with employee list
   */
  getAllEmployees: async () => {
    try {
      const response = await employeeAxiosInstance.get('/admin/employees');
      return response.data;
    } catch (error) {
      console.error('Get employees error:', error);
      throw error.response?.data || { message: 'Failed to fetch employees' };
    }
  },

  /**
   * Create a new employee account
   * @param {Object} employeeData - Employee data
   * @param {string} employeeData.username - Username (3-50 chars, alphanumeric + underscore)
   * @param {string} employeeData.password - Password (min 6 chars, must have uppercase, lowercase, digit)
   * @param {string} employeeData.role - Role ('admin' or 'employee')
   * @returns {Promise<Object>} Response data
   */
  createEmployee: async (employeeData) => {
    try {
      const response = await employeeAxiosInstance.post('/admin/employees', employeeData);
      return response.data;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error.response?.data || { message: 'Failed to create employee' };
    }
  },

  /**
   * Delete an employee account
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Response data
   */
  deleteEmployee: async (employeeId) => {
    try {
      const response = await employeeAxiosInstance.delete(`/admin/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Delete employee error:', error);
      throw error.response?.data || { message: 'Failed to delete employee' };
    }
  },
};

export default adminService;
