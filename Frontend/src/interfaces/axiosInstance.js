// call in axios to handle our api requests we want to make
import axios from 'axios';

const axiosInstance = axios.create({
    // this is the BASE URL, meaning that it must go before any API call we make with axios


    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',

    // we also tell it that we want to ask the server to respond with JSON, rather than cleartext
    headers: {
        'Content-Type': 'application/json'
    },




    // Enable sending cookies and credentials
    withCredentials: true,
    // Configure CSRF token handling - axios will automatically read the cookie and send the header
    xsrfCookieName: 'XSRF-TOKEN', // Cookie name to read from
    xsrfHeaderName: 'X-CSRF-Token', // Header name to send to backend
    // timeout after 10 seconds
    timeout: 10000,
});

// Request interceptor to add the auth token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        // If token exists, add it to the Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Debug: Log CSRF token info for non-GET requests
        if (config.method !== 'get') {
            console.log('[AXIOS] Request:', {
                method: config.method,
                url: config.url,
                hasAuthToken: !!token,
                csrfToken: config.headers['X-CSRF-Token'] || config.headers['x-csrf-token'] || 'none',
                cookies: document.cookie
            });
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle common errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('[AXIOS] Response error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url,
            method: error.config?.method
        });
        
        // Handle 401 Unauthorized errors (token expired or invalid)
        if (error.response?.status === 401) {
            // Clear the token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not already on the login page
            if (typeof window !== 'undefined' && window.location?.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        // Handle 403 CSRF errors
        if (error.response?.status === 403) {
            console.error('[AXIOS] CSRF Error - Refetching token');
            // Try to refetch CSRF token
            axiosInstance.get('/csrf-token').catch(console.error);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;