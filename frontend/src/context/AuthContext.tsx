import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

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
  signup: (userData: SignupData) => Promise<{ success: boolean; message?: string; needsManualLogin?: boolean } | void>;
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

  const signup = async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    setIsLoading(true);
    try {
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw new Error('Missing required fields');
      }

      // Only include the fields that match the backend's UserCreate schema
      const signupData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName
      };
      
      console.log('Attempting signup with data:', signupData);
      await apiService.signup(signupData);
      
      try {
        // After successful signup, log the user in
        await login(userData.email, userData.password);
        
        // Get the updated user data after login
        const userResponse = await apiService.getCurrentUser();
        setUser(userResponse as User);
      } catch (loginError) {
        if (loginError instanceof Error) {
          console.error('Login after signup failed:', loginError);
          // If login fails but signup succeeded, we'll still return success
          // but indicate that manual login is needed
          return {
            success: true,
            message: 'Account created successfully. Please log in manually.',
            needsManualLogin: true
          };
        }
        throw loginError;
      }
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during signup');
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