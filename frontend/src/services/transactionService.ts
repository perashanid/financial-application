import api from './api';
import { Transaction, TransactionFormData, Category } from '../types';

export const transactionService = {
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    return api.get<{ transactions: Transaction[]; total: number; page: number; pages: number }>('/transactions', params);
  },

  async getTransaction(id: string) {
    return api.get<Transaction>(`/transactions/${id}`);
  },

  async createTransaction(data: TransactionFormData) {
    return api.post<Transaction>('/transactions', data);
  },

  async updateTransaction(id: string, data: Partial<TransactionFormData>) {
    return api.put<Transaction>(`/transactions/${id}`, data);
  },

  async deleteTransaction(id: string) {
    return api.delete(`/transactions/${id}`);
  },

  async getBalance() {
    return api.get<{ balance: number; totalIncome: number; totalExpenses: number }>('/transactions/balance');
  },

  async uploadReceipt(file: File, onProgress?: (progress: number) => void) {
    return api.uploadFile<{ url: string; publicId: string }>('/transactions/upload', file, onProgress);
  },

  async getCategories() {
    return api.get<Category[]>('/categories');
  },

  async createCategory(data: { name: string; type: 'income' | 'expense'; icon?: string; color?: string }) {
    return api.post<Category>('/categories', data);
  },

  async updateCategory(id: string, data: Partial<Category>) {
    return api.put<Category>(`/categories/${id}`, data);
  },

  async deleteCategory(id: string) {
    return api.delete(`/categories/${id}`);
  },
};
