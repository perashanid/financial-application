import api from './api';
import { Contact, ContactFormData, ApiResponse } from '../types';

export const contactService = {
  async createContact(data: ContactFormData): Promise<ApiResponse<Contact>> {
    const response = await api.post('/contacts', data);
    return response.data;
  },

  async getContacts(params?: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    tags?: string[];
  }): Promise<ApiResponse<{ contacts: Contact[]; pagination: any }>> {
    const response = await api.get('/contacts', { params });
    return response.data;
  },

  async getContactById(id: string): Promise<ApiResponse<Contact>> {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },

  async updateContact(id: string, data: Partial<ContactFormData>): Promise<ApiResponse<Contact>> {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  async deleteContact(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },

  async getContactTransactions(id: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`/contacts/${id}/transactions`);
    return response.data;
  },

  async getFrequentContacts(limit?: number): Promise<ApiResponse<Contact[]>> {
    const response = await api.get('/contacts/frequent', { params: { limit } });
    return response.data;
  },
};
