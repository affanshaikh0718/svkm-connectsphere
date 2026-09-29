import apiClient from '@/lib/axios';
import type { AuthResponse, LoginCredentials, RegisterData, ApiResponse, User } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials | { identifier: string; password: string }): Promise<AuthResponse> {
    const payload = {
      identifier: 'identifier' in credentials && credentials.identifier 
        ? credentials.identifier 
        : (credentials as LoginCredentials).emailOrUsername || '',
      password: credentials.password,
    };
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  },

  async register(data: Omit<RegisterData, 'confirmPassword' | 'acceptTerms'>): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    return response.data.data;
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/verify-email', { token });
    return response.data.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    return response.data.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/reset-password', { token, newPassword });
    return response.data.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  async checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
    const response = await apiClient.get<ApiResponse<{ available: boolean }>>(`/auth/check-username?username=${username}`);
    return response.data.data;
  },

  async changePassword(
    param1: { oldPassword?: string; currentPassword?: string; newPassword: string } | string,
    param2?: string
  ): Promise<{ message: string }> {
    let oldPassword = '';
    let newPassword = '';
    if (typeof param1 === 'object') {
      oldPassword = param1.oldPassword || param1.currentPassword || '';
      newPassword = param1.newPassword;
    } else {
      oldPassword = param1;
      newPassword = param2 || '';
    }
    const response = await apiClient.put<ApiResponse<{ message: string }>>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data.data;
  },
};
