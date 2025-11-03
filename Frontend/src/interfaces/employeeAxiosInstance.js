import axios from 'axios';

// References:
// Axios Team. (2025) axios - npm. Available at: https://www.npmjs.com/package/axios (Accessed: 03 November 2025).

// Derive employee API base from REACT_APP_API_URL and append /employee
const rawBase = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');
// If someone accidentally sets an https localhost base in dev, prefer http to avoid TLS errors
const normalizedBase = rawBase.replace(/^https:\/\/localhost/i, 'http://localhost');
const employeeBaseURL = `${normalizedBase}/employee`;

// Create axios instance for employee API calls
const employeeAxiosInstance = axios.create({
  baseURL: employeeBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for CORS if server sets cookies
});

// Request interceptor to add auth token
employeeAxiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('employeeToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
employeeAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employeeUser');
      window.location.href = '/employee/login';
    }
    return Promise.reject(error);
  }
);

export default employeeAxiosInstance;
