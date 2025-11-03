import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../interfaces/axiosInstance';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initialize from localStorage if present
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Call backend to login and set token/user
  const login = async (credentials) => {
    const resp = await axiosInstance.post('/auth/login', credentials);
    // Expecting { token, user } from backend
    if (resp?.data) {
      const { token: t, user: u } = resp.data;
      setToken(t || null);
      setUser(u || null);
    }
    return resp;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const register = async (payload) => {
    const resp = await axiosInstance.post('/auth/register', payload);
    return resp;
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register,
    setUser,
  }), [user, token, isAuthenticated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};