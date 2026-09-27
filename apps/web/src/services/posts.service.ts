import apiClient from '@/lib/axios';
import type { ApiResponse, CursorPaginatedResponse, Post, Comment } from '@/types';

export const postsService = {
  async getFeed(cursor?: string): Promise<CursorPaginatedResponse<Post>> {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await apiClient.get<CursorPaginatedResponse<Post>>(`/posts/feed${params}`);
    return response.data;
  },

  async getPost(id: string): Promise<Post> {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data.data;
  },

  async createPost(data: { content: string; visibility: string; mediaFiles?: File[] }): Promise<Post> {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('visibility', data.visibility);
    if (data.mediaFiles) {
      data.mediaFiles.forEach((file) => formData.append('media', file));
    }
    const response = await apiClient.post<ApiResponse<Post>>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updatePost(id: string, data: { content?: string; visibility?: string }): Promise<Post> {
    const response = await apiClient.patch<ApiResponse<Post>>(`/posts/${id}`, data);
    return response.data.data;
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },

  async likePost(id: string): Promise<{ likeCount: number }> {
    const response = await apiClient.post<ApiResponse<{ likeCount: number }>>(`/posts/${id}/like`);
    return response.data.data;
  },

  async unlikePost(id: string): Promise<{ likeCount: number }> {
    const response = await apiClient.delete<ApiResponse<{ likeCount: number }>>(`/posts/${id}/like`);
    return response.data.data;
  },

  async savePost(id: string): Promise<void> {
    await apiClient.post(`/posts/${id}/save`);
  },

  async unsavePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}/save`);
  },

  async sharePost(id: string, content?: string): Promise<Post> {
    const response = await apiClient.post<ApiResponse<Post>>(`/posts/${id}/share`, { content });
    return response.data.data;
  },

  async getComments(postId: string, cursor?: string): Promise<CursorPaginatedResponse<Comment>> {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await apiClient.get<CursorPaginatedResponse<Comment>>(`/posts/${postId}/comments${params}`);
    return response.data;
  },

  async createComment(postId: string, content: string, parentCommentId?: string): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<Comment>>(`/posts/${postId}/comments`, {
      content,
      parentCommentId,
    });
    return response.data.data;
  },

  async addComment(postId: string, data: { content: string; parentCommentId?: string }): Promise<Comment> {
    return this.createComment(postId, data.content, data.parentCommentId);
  },

  async likeComment(postId: string, commentId: string): Promise<void> {
    await apiClient.post(`/posts/${postId}/comments/${commentId}/like`);
  },

  async unlikeComment(postId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}/comments/${commentId}/like`);
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },

  async reportPost(id: string, reason: string): Promise<void> {
    await apiClient.post(`/posts/${id}/report`, { reason });
  },
};
