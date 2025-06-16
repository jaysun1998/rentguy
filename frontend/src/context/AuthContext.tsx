import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService, ApiError } from '../services/api';

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<{ success: boolean; message?: string; needsManualLogin?: boolean } | { id: string; email: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      apiService.setToken(token);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      
      // Set the token in the API service
      apiService.setToken(response.access_token);
      
      // Get user info
      const userResponse = await apiService.getCurrentUser() as User;
      
      // Store user in localStorage and state
      localStorage.setItem('user', JSON.stringify(userResponse));
      setUser(userResponse);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    try {
      // Validate user data before sending
      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
      }
      
      const response = await apiService.signup(userData);
      // Handle successful signup
      setUser(response);
      return response;
    } catch (error) {
      console.error('AuthContext signup error:', error);
      // More specific error handling based on error type/status
      if (error instanceof ApiError && error.status === 500) {
        throw new Error('Server error. Please try again later or contact support.');
      } else {
        throw error; // Pass other errors up
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    apiService.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      signup, 
      logout 
    }}>
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