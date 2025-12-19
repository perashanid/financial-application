import api from './api';
import { Notification } from '../types';

export const notificationService = {
  async getNotifications(params?: { read?: boolean; limit?: number }) {
    return api.get<Notification[]>('/notifications', params);
  },

  async markAsRead(id: string) {
    return api.put<Notification>(`/notifications/${id}/read`);
  },

  async markAllAsRead() {
    return api.put<{ modifiedCount: number }>('/notifications/read-all');
  },

  async deleteNotification(id: string) {
    return api.delete(`/notifications/${id}`);
  },
};
