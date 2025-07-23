import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService, ApiError } from '../services/api';

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<{ success: boolean; message?: string; needsManualLogin?: boolean } | { id: string; email: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
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
      try {
        setUser(JSON.parse(storedUser));
        apiService.setToken(token);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // The login method in apiService handles the token storage
      await apiService.login(email, password);
      
      // Now get the user info using the stored token
      const userResponse = await apiService.getCurrentUser();
      
      if (!userResponse) {
        throw new Error('Failed to load user data');
      }
      
      // Store user in localStorage and state
      localStorage.setItem('user', JSON.stringify(userResponse));
      setUser(userResponse);
    } catch (error) {
      console.error('Login error:', error);
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
      
      console.log('Attempting to sign up with data:', JSON.stringify(userData, null, 2));
      
      const response = await apiService.signup(userData);
      
      console.log('Signup successful, response:', response);
      
      // Handle successful signup
      const userDataResponse = {
        id: response.id,
        email: response.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        company: userData.company || '',
        country: userData.country || ''
      };
      
      console.log('Setting user data:', userDataResponse);
      setUser(userDataResponse);
      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : 'No stack trace';
      
      console.error('AuthContext signup error:', {
        error,
        errorMessage,
        errorStack,
        userData: {
          email: userData.email,
          hasFirstName: !!userData.firstName,
          hasLastName: !!userData.lastName,
          hasCompany: !!userData.company,
          hasCountry: !!userData.country
        }
      });
      
      // Rethrow with a more user-friendly message
      if (error instanceof ApiError) {
        console.error('API Error details:', error.details);
        throw new Error(error.message || 'Failed to create account. Please try again.');
      }
      
      throw new Error('Failed to create account. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    apiService.removeToken();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await apiService.forgotPassword(email);
    } catch (error) {
      console.error('AuthContext forgotPassword error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      signup, 
      logout,
      forgotPassword 
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