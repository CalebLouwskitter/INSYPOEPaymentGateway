import employeeAxiosInstance from '../interfaces/employeeAxiosInstance';

// References:
// Axios Team. (2025) axios - npm. Available at: https://www.npmjs.com/package/axios (Accessed: 03 November 2025).

/**
 * Employee payment service
 * Handles payment-related operations for employees
 */

export const employeePaymentService = {
  /**
   * Get all pending payments
   * @returns {Promise<Object>} Response with pending payments
   */
  getPendingPayments: async () => {
    try {
      const response = await employeeAxiosInstance.get('/payments/pending');
      return response.data;
    } catch (error) {
      console.error('Get pending payments error:', error);
      throw error.response?.data || { message: 'Failed to fetch pending payments' };
    }
  },

  /**
   * Process a payment (approve or deny)
   * @param {string} paymentId - Payment ID
   * @param {string} action - 'approve' or 'deny'
   * @returns {Promise<Object>} Response data
   */
  processPayment: async (paymentId, action) => {
    try {
      const response = await employeeAxiosInstance.put(
        `/payments/${paymentId}/process`,
        { action }
      );
      return response.data;
    } catch (error) {
      console.error('Process payment error:', error);
      throw error.response?.data || { message: 'Failed to process payment' };
    }
  },

  /**
   * Get payment history (approved/denied payments)
   * @returns {Promise<Object>} Response with payment history
   */
  getPaymentHistory: async () => {
    try {
      const response = await employeeAxiosInstance.get('/payments/history');
      return response.data;
    } catch (error) {
      console.error('Get payment history error:', error);
      throw error.response?.data || { message: 'Failed to fetch payment history' };
    }
  },
};

export default employeePaymentService;
