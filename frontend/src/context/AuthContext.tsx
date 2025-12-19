import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      const refreshToken = authService.getRefreshToken();
      
      if (token && refreshToken) {
        try {
          console.log('Restoring session...');
          // Try to get profile - if token is expired, the interceptor will refresh it
          const response = await authService.getProfile();
          if (response.success && response.data) {
            console.log('Session restored successfully');
            setUser(response.data);
          }
        } catch (error: any) {
          // If we get here, it means both access and refresh tokens failed
          // The api interceptor already handled logout if needed
          console.error('Failed to restore session:', error.message);
        }
      } else {
        console.log('No stored tokens found');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    if (response.success && response.data) {
      // Token is already set in authService.login
      setUser(response.data.user);
    }
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    if (response.success && response.data) {
      // Token is already set in authService.register
      setUser(response.data.user);
    }
  };

  const logout = () => {
    authService.removeToken();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
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
