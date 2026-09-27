import apiClient from '@/lib/axios';
import type { ApiResponse, SearchResults, PaginatedResponse, User, Job, Company, Post } from '@/types';

export const searchService = {
  async globalSearch(query: string): Promise<SearchResults> {
    const response = await apiClient.get<ApiResponse<SearchResults>>(`/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },

  async searchPeople(query: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>(
      `/search/people?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async searchJobs(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<PaginatedResponse<Job>>(
      `/search/jobs?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async searchCompanies(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Company>> {
    const response = await apiClient.get<PaginatedResponse<Company>>(
      `/search/companies?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async searchPosts(query: string, page = 1, limit = 20): Promise<PaginatedResponse<Post>> {
    const response = await apiClient.get<PaginatedResponse<Post>>(
      `/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    return response.data;
  },
};
