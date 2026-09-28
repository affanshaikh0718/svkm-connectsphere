import apiClient from '@/lib/axios';
import type { ApiResponse, CursorPaginatedResponse, Conversation, Message } from '@/types';

export const messagingService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<any>('/messages/conversations');
    const raw = response.data;
    return Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
  },

  async getMyConversations(): Promise<{ data: Conversation[] }> {
    const data = await this.getConversations();
    return { data };
  },

  async getOrCreateConversation(userId: string): Promise<Conversation> {
    const response = await apiClient.post<any>('/messages/conversations', { userId });
    const raw = response.data;
    return raw?.data || raw;
  },

  async getOrCreateDirectConversation(userId: string): Promise<Conversation> {
    return this.getOrCreateConversation(userId);
  },

  async getMessages(conversationId: string, cursor?: string): Promise<CursorPaginatedResponse<Message>> {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await apiClient.get<any>(
      `/messages/conversations/${conversationId}/messages${params}`
    );
    const raw = response.data;
    const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (raw?.data?.data || []));
    return {
      success: true,
      data: list,
      nextCursor: undefined,
      hasMore: false,
    };
  },

  async sendMessage(conversationId: string, content: string, mediaFile?: File): Promise<Message> {
    if (mediaFile) {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('media', mediaFile);
      const response = await apiClient.post<any>(
        `/messages/conversations/${conversationId}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const raw = response.data;
      return raw?.data || raw;
    }
    const response = await apiClient.post<any>(
      `/messages/conversations/${conversationId}/messages`,
      { content }
    );
    const raw = response.data;
    return raw?.data || raw;
  },

  async markConversationRead(conversationId: string): Promise<void> {
    try {
      await apiClient.post(`/messages/conversations/${conversationId}/read`);
    } catch {
      // Ignore
    }
  },

  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    await apiClient.delete(`/messages/conversations/${conversationId}/messages/${messageId}`);
  },

  async getTotalUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<any>('/messages/unread-count');
      const raw = response.data;
      return raw?.data?.count ?? raw?.count ?? 0;
    } catch {
      return 0;
    }
  },
};
