import apiClient from '@/lib/axios';
import type {
  ApiResponse,
  PaginatedResponse,
  CursorPaginatedResponse,
  User,
  Profile,
  Experience,
  Education,
  Skill,
  Project,
  Certification,
  Post,
  ProfileCompletion,
  ProfileSummary,
  ProfileAnalytics,
} from '@/types';

export const usersService = {
  async getProfile(username: string): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${username}`);
    return response.data.data;
  },

  async recordProfileView(usernameOrId: string): Promise<void> {
    try {
      await apiClient.post(`/users/${usernameOrId}/view`);
    } catch (err) {
      console.warn('[Profile View] View tracking request failed:', err);
    }
  },

  async updateProfile(
    data: Partial<Profile> & { firstName?: string; lastName?: string }
  ): Promise<Profile & { firstName?: string; lastName?: string }> {
    const response = await apiClient.patch<ApiResponse<Profile & { firstName?: string; lastName?: string }>>(
      '/users/me/profile',
      data
    );
    return (response.data as any)?.data || response.data;
  },

  async uploadProfilePicture(file: File): Promise<{ profilePictureUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ profilePictureUrl: string }>>(
      '/users/me/profile-picture',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  async uploadCoverImage(file: File): Promise<{ coverImageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ coverImageUrl: string }>>(
      '/users/me/cover-image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  },

  // Experience
  async addExperience(data: Omit<Experience, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Experience> {
    const response = await apiClient.post<ApiResponse<Experience>>('/users/me/experience', data);
    return response.data.data;
  },

  async updateExperience(id: string, data: Partial<Experience>): Promise<Experience> {
    const response = await apiClient.patch<ApiResponse<Experience>>(`/users/me/experience/${id}`, data);
    return response.data.data;
  },

  async deleteExperience(id: string): Promise<void> {
    await apiClient.delete(`/users/me/experience/${id}`);
  },

  // Education
  async addEducation(data: Omit<Education, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Education> {
    const response = await apiClient.post<ApiResponse<Education>>('/users/me/education', data);
    return response.data.data;
  },

  async updateEducation(id: string, data: Partial<Education>): Promise<Education> {
    const response = await apiClient.patch<ApiResponse<Education>>(`/users/me/education/${id}`, data);
    return response.data.data;
  },

  async deleteEducation(id: string): Promise<void> {
    await apiClient.delete(`/users/me/education/${id}`);
  },

  // Skills
  async addSkill(name: string): Promise<Skill> {
    const response = await apiClient.post<ApiResponse<Skill>>('/users/me/skills', { name });
    return response.data.data;
  },

  async deleteSkill(id: string): Promise<void> {
    await apiClient.delete(`/users/me/skills/${id}`);
  },

  async endorseSkill(userId: string, skillId: string): Promise<void> {
    await apiClient.post(`/users/${userId}/skills/${skillId}/endorse`);
  },

  // Projects
  async addProject(data: Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const response = await apiClient.post<ApiResponse<Project>>('/users/me/projects', data);
    return response.data.data;
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await apiClient.patch<ApiResponse<Project>>(`/users/me/projects/${id}`, data);
    return response.data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/users/me/projects/${id}`);
  },

  // Certifications
  async addCertification(data: Omit<Certification, 'id' | 'userId' | 'createdAt'>): Promise<Certification> {
    const response = await apiClient.post<ApiResponse<Certification>>('/users/me/certifications', data);
    return response.data.data;
  },

  async deleteCertification(id: string): Promise<void> {
    await apiClient.delete(`/users/me/certifications/${id}`);
  },

  // Feed
  async getUserPosts(username: string, cursor?: string): Promise<CursorPaginatedResponse<Post>> {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await apiClient.get<CursorPaginatedResponse<Post>>(`/users/${username}/posts${params}`);
    return response.data;
  },

  async getSavedPosts(cursor?: string): Promise<CursorPaginatedResponse<Post>> {
    const params = cursor ? `?cursor=${cursor}` : '';
    const response = await apiClient.get<CursorPaginatedResponse<Post>>(`/users/me/saved-posts${params}`);
    return response.data;
  },

  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await apiClient.get<ApiResponse<ProfileCompletion>>('/users/me/profile-completion');
    return response.data.data;
  },

  async getSuggestedUsers(limit?: number): Promise<User[]> {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<ApiResponse<User[]>>(`/users/suggested${params}`);
    return response.data.data;
  },

  async getProfileSummary(): Promise<ProfileSummary> {
    const response = await apiClient.get<ApiResponse<ProfileSummary>>('/users/me/profile-summary');
    return response.data.data;
  },

  async getAnalytics(): Promise<ProfileAnalytics> {
    const response = await apiClient.get<ApiResponse<ProfileAnalytics>>('/users/me/analytics');
    return response.data.data;
  },
};

