import apiClient from '@/lib/axios';
import type { ApiResponse, CursorPaginatedResponse, Conversation, Message } from '@/types';

export const messagingService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<ApiResponse<Conversation[]>>('/messages/conversations');
    return response.data.data;
  },

  async getMyConversations(): Promise<{ data: Conversation[] }> {
    const data = await this.getConversations();
    return { data };
  },

  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>('/messages/conversations', { userId });
    return response.data.data;
  },

  async getOrCreateDirectConversation(userId: string): Promise<Conversation> {
    return this.getOrCreateConversation(userId);
  },

  async getMessages(conversationId: string, cursor?: string): Promise<CursorPaginatedResponse<Message>> {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await apiClient.get<CursorPaginatedResponse<Message>>(
      `/messages/conversations/${conversationId}/messages${params}`
    );
    return response.data;
  },

  async sendMessage(conversationId: string, content: string, mediaFile?: File): Promise<Message> {
    if (mediaFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('media', mediaFile);
      const response = await apiClient.post<ApiResponse<Message>>(
        `/messages/conversations/${conversationId}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.data;
    }
    const response = await apiClient.post<ApiResponse<Message>>(
      `/messages/conversations/${conversationId}/messages`,
      { content }
    );
    return response.data.data;
  },

  async markConversationRead(conversationId: string): Promise<void> {
    await apiClient.post(`/messages/conversations/${conversationId}/read`);
  },

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await apiClient.delete(`/messages/conversations/${conversationId}/messages/${messageId}`);
  },

  async getTotalUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/messages/unread-count');
    return response.data.data.count;
  },
};
