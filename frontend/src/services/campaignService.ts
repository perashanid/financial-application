import api from './api';
import { Campaign } from '../types';

export const campaignService = {
  async getCampaigns(params?: { status?: string; visibility?: string }) {
    return api.get<Campaign[]>('/campaigns', params);
  },

  async getCampaign(id: string) {
    return api.get<Campaign>(`/campaigns/${id}`);
  },

  async createCampaign(data: {
    title: string;
    description: string;
    goalAmount: number;
    visibility: 'public' | 'private';
    category?: string;
    endDate?: Date;
  }) {
    return api.post<Campaign>('/campaigns', data);
  },

  async updateCampaign(id: string, data: Partial<Campaign>) {
    return api.put<Campaign>(`/campaigns/${id}`, data);
  },

  async deleteCampaign(id: string) {
    return api.delete(`/campaigns/${id}`);
  },

  async contribute(id: string, amount: number, message?: string, isAnonymous?: boolean) {
    return api.post<Campaign>(`/campaigns/${id}/contribute`, { amount, message, isAnonymous });
  },

  async getContributors(id: string) {
    return api.get<any[]>(`/campaigns/${id}/contributors`);
  },
};
