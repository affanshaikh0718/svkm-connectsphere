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
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
