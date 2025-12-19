import api from './api';
import { Loan, LoanFormData } from '../types';

export const loanService = {
  async getLoans() {
    return api.get<Loan[]>('/loans');
  },

  async getLoan(id: string) {
    return api.get<Loan>(`/loans/${id}`);
  },

  async createLoan(data: LoanFormData) {
    return api.post<Loan>('/loans', data);
  },

  async updateLoan(id: string, data: Partial<LoanFormData>) {
    return api.put<Loan>(`/loans/${id}`, data);
  },

  async deleteLoan(id: string) {
    return api.delete(`/loans/${id}`);
  },

  async makePayment(id: string, amount: number) {
    return api.post<Loan>(`/loans/${id}/payment`, { amount });
  },

  async getPaymentSchedule(id: string) {
    return api.get<any>(`/loans/${id}/schedule`);
  },

  async calculateInterest(principal: number, rate: number, time: number, type: 'simple' | 'compound') {
    return api.get<{ interest: number; total: number }>('/loans/calculate', {
      principal,
      rate,
      time,
      type,
    });
  },
};
