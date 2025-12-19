import api from './api';
import { SavingsGoal, SavingsGoalFormData, AutoSaveRule } from '../types';

export const savingsService = {
  async getGoals() {
    return api.get<SavingsGoal[]>('/savings/goals');
  },

  async getGoal(id: string) {
    return api.get<SavingsGoal>(`/savings/goals/${id}`);
  },

  async createGoal(data: SavingsGoalFormData) {
    return api.post<SavingsGoal>('/savings/goals', data);
  },

  async updateGoal(id: string, data: Partial<SavingsGoalFormData>) {
    return api.put<SavingsGoal>(`/savings/goals/${id}`, data);
  },

  async deleteGoal(id: string) {
    return api.delete(`/savings/goals/${id}`);
  },

  async contribute(goalId: string, amount: number) {
    return api.post<SavingsGoal>('/savings/contribute', { goalId, amount });
  },

  async createAutoSaveRule(goalId: string, rule: AutoSaveRule) {
    return api.post<AutoSaveRule>('/savings/rules', { goalId, ...rule });
  },

  async getAutoSaveRules() {
    return api.get<AutoSaveRule[]>('/savings/rules');
  },

  async updateAutoSaveRule(id: string, rule: Partial<AutoSaveRule>) {
    return api.put<AutoSaveRule>(`/savings/rules/${id}`, rule);
  },

  async deleteAutoSaveRule(id: string) {
    return api.delete(`/savings/rules/${id}`);
  },
};
