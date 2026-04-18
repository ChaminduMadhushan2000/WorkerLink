import { apiClient } from './client';
import type { ApiResponse, JobPost } from '../types';

export interface CreateJobPostPayload {
  title: string;
  description: string;
  categoryId: string;
  district: string;
  city: string;
  addressText?: string;
  preferredStartDateFrom?: string;
  preferredStartDateTo?: string;
  materialsNote?: string;
}

export interface JobPostFilters {
  categoryId?: string;
  district?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export const jobPostsApi = {
  browse: (filters?: JobPostFilters) =>
    apiClient.get<ApiResponse<{ posts: JobPost[]; total: number }>>('/job-posts', { params: filters }),

  getById: (id: string) => apiClient.get<ApiResponse<JobPost>>(`/job-posts/${id}`),

  getMine: () => apiClient.get<ApiResponse<JobPost[]>>('/job-posts/my/posts'),

  create: (data: CreateJobPostPayload) =>
    apiClient.post<ApiResponse<JobPost>>('/job-posts', data),

  update: (id: string, data: Partial<CreateJobPostPayload>) =>
    apiClient.patch<ApiResponse<JobPost>>(`/job-posts/${id}`, data),

  close: (id: string) => apiClient.delete<ApiResponse<JobPost>>(`/job-posts/${id}/close`),
};
