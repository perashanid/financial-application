import api from './api';
import { User, LoginFormData, RegisterFormData } from '../types';

export const authService = {
  async login(data: LoginFormData) {
    // Backend expects emailOrPhone instead of email
    const response = await api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', {
      emailOrPhone: data.email,
      password: data.password,
    });
    
    // Store both tokens
    if (response.success && response.data) {
      this.setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
      return {
        success: true,
        data: {
          token: response.data.accessToken,
          user: response.data.user,
        },
      };
    }
    return response;
  },

  async register(data: RegisterFormData) {
    const response = await api.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/register', data);
    
    // Store both tokens
    if (response.success && response.data) {
      this.setToken(response.data.accessToken);
      this.setRefreshToken(response.data.refreshToken);
      return {
        success: true,
        data: {
          token: response.data.accessToken,
          user: response.data.user,
        },
      };
    }
    return response;
  },

  async logout() {
    return api.post('/auth/logout');
  },

  async getProfile() {
    return api.get<User>('/users/profile');
  },

  async updateProfile(data: Partial<User>) {
    return api.put<User>('/users/profile', data);
  },

  async enable2FA() {
    return api.post<{ secret: string; qrCode: string }>('/auth/2fa/enable');
  },

  async verify2FA(code: string) {
    return api.post<{ success: boolean }>('/auth/2fa/verify', { code });
  },

  async forgotPassword(email: string) {
    return api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string) {
    return api.post('/auth/reset-password', { token, password });
  },

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
    
    if (response.success && response.data) {
      this.setToken(response.data.accessToken);
      return response.data.accessToken;
    }
    throw new Error('Failed to refresh token');
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken() {
    return localStorage.getItem('token');
  },

  setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  },

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  },

  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
};
