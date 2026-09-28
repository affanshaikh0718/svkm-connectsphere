import apiClient from '@/lib/axios';
import type { ApiResponse, Company, Job, PaginatedResponse } from '@/types';

export const companiesService = {
  async getCompany(slug: string): Promise<Company> {
    const response = await apiClient.get<ApiResponse<Company>>(`/companies/${slug}`);
    return response.data.data;
  },

  async getCompanyJobs(slug: string, page = 1, limit = 20): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<PaginatedResponse<Job>>(
      `/companies/${slug}/jobs?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async followCompany(id: string): Promise<void> {
    await apiClient.post(`/companies/${id}/follow`);
  },

  async unfollowCompany(id: string): Promise<void> {
    await apiClient.delete(`/companies/${id}/follow`);
  },

  async getSuggestedCompanies(limit = 5): Promise<Company[]> {
    const response = await apiClient.get<ApiResponse<Company[]>>(`/companies/suggested?limit=${limit}`);
    return response.data.data;
  },

  async requestMembership(companyIdOrSlug: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/companies/${companyIdOrSlug}/request`);
    return response.data.data;
  },

  async joinCompany(companyIdOrSlug: string): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/companies/${companyIdOrSlug}/join`);
    return response.data.data;
  },
};
