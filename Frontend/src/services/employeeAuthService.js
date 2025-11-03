import employeeAxiosInstance from '../interfaces/employeeAxiosInstance';

// References:
// Axios Team. (2025) axios - npm. Available at: https://www.npmjs.com/package/axios (Accessed: 03 November 2025).

/**
 * Employee authentication service
 * Handles login and logout operations
 */

export const employeeAuthService = {
  /**
   * Login an employee or admin
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username - Employee username
   * @param {string} credentials.password - Employee password
   * @returns {Promise<Object>} Response data
   */
  login: async (credentials) => {
    try {
      const response = await employeeAxiosInstance.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login service error:', error);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  /**
   * Logout employee
   * @returns {Promise<Object>} Response data
   */
  logout: async () => {
    try {
      const response = await employeeAxiosInstance.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout service error:', error);
      throw error.response?.data || { message: 'Logout failed' };
    }
  },
};

export default employeeAuthService;
