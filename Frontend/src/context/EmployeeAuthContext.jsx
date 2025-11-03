import React, { createContext, useContext, useEffect, useState } from 'react';
import employeeAxiosInstance from '../interfaces/employeeAxiosInstance';

// References:
// React Team. (2025) Context - React. Available at: https://react.dev/reference/react/createContext (Accessed: 03 November 2025).

const EmployeeAuthContext = createContext();

export function EmployeeAuthProvider({ children }) {
  // Initialize from localStorage if present
  const [employeeUser, setEmployeeUser] = useState(() => {
    try {
      const raw = localStorage.getItem('employeeUser');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Failed to parse employee user from localStorage:', e);
      return null;
    }
  });

  const [employeeToken, setEmployeeToken] = useState(() => 
    localStorage.getItem('employeeToken')
  );

  const isEmployeeAuthenticated = Boolean(employeeToken && employeeUser);
  const isAdmin = employeeUser?.role === 'admin';
  const isEmployee = employeeUser?.role === 'employee';

  // Sync token to localStorage
  useEffect(() => {
    if (employeeToken) {
      localStorage.setItem('employeeToken', employeeToken);
    } else {
      localStorage.removeItem('employeeToken');
    }
  }, [employeeToken]);

  // Sync user to localStorage
  useEffect(() => {
    if (employeeUser) {
      localStorage.setItem('employeeUser', JSON.stringify(employeeUser));
    } else {
      localStorage.removeItem('employeeUser');
    }
  }, [employeeUser]);

  // Employee login function
  const employeeLogin = async (credentials) => {
    try {
      const response = await employeeAxiosInstance.post('/auth/login', credentials);
      
      if (response?.data?.success) {
        const { token, employee } = response.data;
        setEmployeeToken(token);
        setEmployeeUser(employee);
        return { success: true, employee };
      }
      
      return { success: false, message: response?.data?.message || 'Login failed' };
    } catch (error) {
      console.error('Employee login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  // Employee logout function
  const employeeLogout = async () => {
    try {
      // Call backend to invalidate token
      await employeeAxiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API call success
      setEmployeeToken(null);
      setEmployeeUser(null);
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employeeUser');
    }
  };

  const value = {
    employeeUser,
    employeeToken,
    isEmployeeAuthenticated,
    isAdmin,
    isEmployee,
    employeeLogin,
    employeeLogout,
  };

  return (
    <EmployeeAuthContext.Provider value={value}>
      {children}
    </EmployeeAuthContext.Provider>
  );
}

// Custom hook to use employee auth context
export function useEmployeeAuth() {
  const context = useContext(EmployeeAuthContext);
  if (!context) {
    throw new Error('useEmployeeAuth must be used within an EmployeeAuthProvider');
  }
  return context;
}

export default EmployeeAuthContext;
