import apiClient from '@/lib/axios';
import type { ApiResponse, PaginatedResponse, Job, Application, Resume } from '@/types';

export interface JobFilters {
  query?: string;
  keyword?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  isRemote?: boolean;
  companyId?: string;
  page?: number;
  limit?: number;
}

export const jobsService = {
  async getJobs(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams();
    const searchQuery = filters.query || filters.keyword;
    if (searchQuery) params.append('query', searchQuery);
    if (filters.location) params.append('location', filters.location);
    if (filters.jobType) params.append('jobType', filters.jobType);
    if (filters.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
    if (filters.isRemote !== undefined) params.append('isRemote', String(filters.isRemote));
    if (filters.companyId) params.append('companyId', filters.companyId);
    params.append('page', String(filters.page ?? 1));
    params.append('limit', String(filters.limit ?? 20));

    const response = await apiClient.get<PaginatedResponse<Job>>(`/jobs?${params.toString()}`);
    return response.data;
  },

  async getJob(id: string): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data.data;
  },

  async saveJob(id: string): Promise<void> {
    await apiClient.post(`/jobs/${id}/save`);
  },

  async unsaveJob(id: string): Promise<void> {
    await apiClient.delete(`/jobs/${id}/save`);
  },

  async getSavedJobs(page = 1, limit = 20): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<PaginatedResponse<Job>>(`/jobs/saved?page=${page}&limit=${limit}`);
    return response.data;
  },

  async applyToJob(
    jobId: string,
    data: { resumeId?: string; resumeUrl?: string; coverLetter?: string }
  ): Promise<Application> {
    const response = await apiClient.post<ApiResponse<Application>>(`/jobs/${jobId}/apply`, data);
    return response.data.data;
  },

  async getMyApplications(page = 1, limit = 20): Promise<PaginatedResponse<Application>> {
    const response = await apiClient.get<PaginatedResponse<Application>>(
      `/applications/me?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  async withdrawApplication(applicationId: string): Promise<void> {
    await apiClient.patch(`/applications/${applicationId}/withdraw`);
  },

  async getResumes(): Promise<Resume[]> {
    const response = await apiClient.get<ApiResponse<Resume[]>>('/users/me/resumes');
    return response.data.data;
  },

  async uploadResume(file: File): Promise<Resume> {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await apiClient.post<ApiResponse<Resume>>('/users/me/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteResume(id: string): Promise<void> {
    await apiClient.delete(`/users/me/resumes/${id}`);
  },

  async getRecommendedJobs(limit = 10): Promise<Job[]> {
    const response = await apiClient.get<ApiResponse<Job[]>>(`/jobs/recommended?limit=${limit}`);
    return response.data.data;
  },
};
