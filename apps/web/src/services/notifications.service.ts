import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, Notification } from '@/types';

export const notificationsService = {
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      `/notifications?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getMyNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    return this.getNotifications(page, limit);
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<any>('/notifications/unread-count');
    if (typeof response.data?.data?.count === 'number') {
      return response.data.data.count;
    }
    if (typeof response.data?.count === 'number') {
      return response.data.count;
    }
    return 0;
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch {
      await apiClient.patch(`/notifications/${id}/read`);
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put('/notifications/read-all');
    } catch {
      await apiClient.patch('/notifications/read-all');
    }
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
