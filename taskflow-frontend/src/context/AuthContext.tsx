import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  // Listen for the unauthorized event from the axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      toast.error('Session expired. Please log in again.');
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (newToken: string, refreshToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
