import employeeAxiosInstance from '../interfaces/employeeAxiosInstance';
import axiosInstance from '../interfaces/axiosInstance';

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
      // Ensure CSRF token exists before making the POST request
      const getCookie = (name) => {
        const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
        return match ? decodeURIComponent(match[2]) : null;
      };
      
      let csrf = getCookie('XSRF-TOKEN');
      console.log('[employeeAuthService] CSRF cookie present:', !!csrf, 'All cookies:', document.cookie);
      
      if (!csrf) {
        console.log('[employeeAuthService] Fetching CSRF token...');
        await axiosInstance.get('/csrf-token');
        csrf = getCookie('XSRF-TOKEN');
        console.log('[employeeAuthService] CSRF cookie after fetch:', !!csrf);
      }
      
      // Let axios automatically handle the XSRF token (it's configured with xsrfCookieName and xsrfHeaderName)
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
      // Let axios automatically handle the XSRF token
      const response = await employeeAxiosInstance.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout service error:', error);
      throw error.response?.data || { message: 'Logout failed' };
    }
  },
};

export default employeeAuthService;
