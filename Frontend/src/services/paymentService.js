// import our singleton for axios

import axiosInstance from '../interfaces/axiosInstance.js';

// GET all payments from the API
export const getAllPayments = () => axiosInstance.get('/payments');

// GET a specific payment
export const getPaymentById = (id) => axiosInstance.get(`/payments/${id}`);

// POST request, to create a new payment
export const createPayment = (paymentData) => axiosInstance.post('/payments', paymentData);

// PUT request, to update payment status
export const updatePaymentStatus = (id, status) => axiosInstance.put(`/payments/${id}/status`, { status });

// DELETE request, to delete a payment
export const deletePayment = (id) => axiosInstance.delete(`/payments/${id}`);

// GET payment statistics
export const getPaymentStats = () => axiosInstance.get('/payments/stats');

// Authentication services
export const register = (userData) => axiosInstance.post('/auth/register', userData);

export const login = (credentials) => axiosInstance.post('/auth/login', credentials);

export const logout = () => axiosInstance.post('/auth/logout');

