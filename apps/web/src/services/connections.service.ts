import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, Connection, ConnectionStatus, User } from '@/types';

export const connectionsService = {
  async sendConnectionRequest(userId: string): Promise<Connection> {
    const response = await apiClient.post<ApiResponse<Connection>>('/connections/request', { userId });
    return response.data.data;
  },

  async acceptConnectionRequest(connectionId: string): Promise<Connection> {
    const response = await apiClient.put<ApiResponse<Connection>>(`/connections/${connectionId}/accept`);
    return response.data.data;
  },

  async declineConnectionRequest(connectionId: string): Promise<void> {
    await apiClient.put(`/connections/${connectionId}/reject`);
  },

  async rejectConnectionRequest(connectionId: string): Promise<void> {
    await apiClient.put(`/connections/${connectionId}/reject`);
  },

  async removeConnection(connectionId: string): Promise<void> {
    await apiClient.delete(`/connections/${connectionId}`);
  },

  async withdrawConnectionRequest(connectionId: string): Promise<void> {
    await apiClient.delete(`/connections/${connectionId}`);
  },

  async getConnectionStatus(userId: string): Promise<{ status: ConnectionStatus; connectionId?: string }> {
    const response = await apiClient.get<ApiResponse<{ status: ConnectionStatus; connectionId?: string }>>(
      `/connections/status/${userId}`
    );
    return response.data.data;
  },

  async getPendingRequests(page = 1, limit = 20): Promise<any> {
    const response = await apiClient.get<any>(
      `/connections/pending?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getMyConnections(page = 1, limit = 20): Promise<any> {
    const response = await apiClient.get<any>(
      `/connections?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async getSuggestedConnections(limit = 10): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>(`/connections/suggestions?limit=${limit}`);
    return response.data.data;
  },

  async getSuggestions(limit = 10): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>(`/connections/suggestions?limit=${limit}`);
    return response.data;
  },

  async getMutualConnections(userId: string): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>(`/connections/mutual/${userId}`);
    return response.data.data;
  },

  async followUser(userId: string): Promise<void> {
    await apiClient.post(`/connections/follow/${userId}`);
  },

  async unfollowUser(userId: string): Promise<void> {
    await apiClient.delete(`/connections/follow/${userId}`);
  },

  async blockUser(userId: string): Promise<void> {
    await apiClient.post(`/connections/block/${userId}`);
  },

  async unblockUser(userId: string): Promise<void> {
    await apiClient.delete(`/connections/block/${userId}`);
  },
};
