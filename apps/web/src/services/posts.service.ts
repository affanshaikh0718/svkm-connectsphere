import apiClient from '@/lib/axios';
import type { ApiResponse, CursorPaginatedResponse, Post, Comment } from '@/types';

export const postsService = {
  async getFeed(cursor?: string): Promise<CursorPaginatedResponse<Post>> {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await apiClient.get<ApiResponse<{ posts: Post[] }>>(`/feed${params}`);
    const posts = response.data?.data?.posts;

    return {
      success: response.data?.success ?? true,
      data: Array.isArray(posts) ? posts : [],
      hasMore: false,
    };
  },

  async getPost(id: string): Promise<Post> {
    const response = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data.data;
  },

  async createPost(data: { content: string; visibility?: string; mediaUrls?: string[]; type?: string; mediaFiles?: File[] }): Promise<Post> {
    if (data.mediaFiles && data.mediaFiles.length > 0) {
      const formData = new FormData();
      formData.append('content', data.content);
      formData.append('visibility', data.visibility || 'PUBLIC');
      if (data.type) formData.append('type', data.type);
      data.mediaFiles.forEach((file) => formData.append('media', file));
      const response = await apiClient.post<ApiResponse<Post>>('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    }

    const response = await apiClient.post<ApiResponse<Post>>('/posts', {
      content: data.content,
      visibility: data.visibility || 'PUBLIC',
      mediaUrls: data.mediaUrls,
      type: data.type,
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

  async getComments(postId: string, cursor?: string): Promise<any> {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await apiClient.get<any>(`/posts/${postId}/comments${params}`);
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

  async uploadMedia(file: File): Promise<{ url: string; filename: string; mimetype: string; isVideo: boolean }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ url: string; filename: string; mimetype: string; isVideo: boolean }>>(
      '/posts/media',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  async getUserPosts(userId: string, limit = 20): Promise<Post[]> {
    const response = await apiClient.get<ApiResponse<Post[]>>(`/posts/user/${userId}?limit=${limit}`);
    return response.data.data || [];
  },
};
