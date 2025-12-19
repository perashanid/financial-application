import api from './api';
import { DashboardSummary, MonthlyTrend, CategoryBreakdown } from '../types';

export const analyticsService = {
  async getDashboard() {
    return api.get<DashboardSummary>('/analytics/dashboard');
  },

  async getTrends(months?: number) {
    return api.get<MonthlyTrend[]>('/analytics/trends', { months });
  },

  async getCategoryBreakdown(type?: 'income' | 'expense', startDate?: string, endDate?: string) {
    return api.get<CategoryBreakdown[]>('/analytics/categories', { type, startDate, endDate });
  },

  async getPredictions() {
    return api.get<any>('/analytics/predictions');
  },

  async getSavingsRate() {
    return api.get<{ rate: number; trend: string }>('/analytics/savings-rate');
  },
};
