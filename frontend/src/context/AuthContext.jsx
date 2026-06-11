import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (err) {
      const msg = err.response && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, isAgent = false) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, isAgent });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (err) {
      const msg = err.response && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/google', { credential });
      setUserInfo(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (err) {
      const msg = err.response && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  const fetchProfile = async () => {
    if (!userInfo || !userInfo.token) return;
    try {
      const { data } = await api.get('/auth/profile');
      // Keep token from existing userInfo because /auth/profile does not return a token
      const updatedUser = { ...data, token: userInfo.token };
      setUserInfo(updatedUser);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        loading,
        error,
        login,
        register,
        loginWithGoogle,
        logout,
        fetchProfile,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
