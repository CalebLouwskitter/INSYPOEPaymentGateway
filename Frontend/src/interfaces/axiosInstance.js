// call in axios to handle our api requests we want to make
import axios from 'axios';

const axiosInstance = axios.create({
    // this is the BASE URL, meaning that it must go before any API call we make with axios


    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',

    // we also tell it that we want to ask the server to respond with JSON, rather than cleartext
    headers: {
        'Content-Type': 'application/json'
    },




    // Do not send cookies by default; we use Bearer tokens instead
    withCredentials: false,
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
        // Handle 401 Unauthorized errors (token expired or invalid)
        if (error.response && error.response.status === 401) {
            // Clear the token and redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Only redirect if not already on the login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;