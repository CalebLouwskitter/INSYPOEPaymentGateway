// import our singleton for axios
<<<<<<< Updated upstream
import axios from '../interfaces/axiosInstance.js'

// GET all the books from the API
export const getAllBooks = () => axios.get('/books');

// GET a specific book
export const getBookById = (id) => axios.get(`/books/${id}`); // remember, to call a variable in-line, we don't use ' (single quote)
                                                             // we use backticks ` (left of the number 1)
// POST request, to create a new book in our collection
export const createBook = (bookData) => axios.post('/books', bookData);

// PUT request, to update an existing book
export const updateBook = (id, bookData) => axios.put(`/books/${id}`, bookData);

// DELETE request, nuke a book out of existence
export const deleteBook = (id) => axios.delete(`/books/${id}`);
=======
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
>>>>>>> Stashed changes
