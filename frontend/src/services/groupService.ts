import api from './api';
import { Group, Bill } from '../types';

export const groupService = {
  async getGroups() {
    return api.get<Group[]>('/groups');
  },

  async getGroup(id: string) {
    return api.get<Group>(`/groups/${id}`);
  },

  async createGroup(data: { name: string; description?: string; memberIds: string[] }) {
    return api.post<Group>('/groups', data);
  },

  async updateGroup(id: string, data: { name?: string; description?: string }) {
    return api.put<Group>(`/groups/${id}`, data);
  },

  async deleteGroup(id: string) {
    return api.delete(`/groups/${id}`);
  },

  async addMember(groupId: string, userId: string) {
    return api.post<Group>(`/groups/${groupId}/members`, { userId });
  },

  async removeMember(groupId: string, userId: string) {
    return api.delete(`/groups/${groupId}/members/${userId}`);
  },

  async addBill(groupId: string, bill: { description: string; totalAmount: number; paidBy: string; splits: any[] }) {
    return api.post<Group>(`/groups/${groupId}/bills`, bill);
  },

  async getBills(groupId: string) {
    return api.get<Bill[]>(`/groups/${groupId}/bills`);
  },

  async settlePayment(groupId: string, data: { from: string; to: string; amount: number }) {
    return api.post<Group>(`/groups/${groupId}/settle`, data);
  },

  async getBalance(groupId: string) {
    return api.get<any>(`/groups/${groupId}/balance`);
  },
};
