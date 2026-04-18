import { apiClient } from './client';
import type { ApiResponse, Proposal } from '../types';

export interface CreateProposalPayload {
  priceFormat: 'lump_sum' | 'daily_rate';
  proposalPriceLkrCents: number;
  estimatedDays?: number;
  note?: string;
  siteVisitRequested?: boolean;
}

export const proposalsApi = {
  submit: (jobPostId: string, data: CreateProposalPayload) =>
    apiClient.post<ApiResponse<Proposal>>(`/proposals/job-posts/${jobPostId}`, data),

  getForJobPost: (jobPostId: string) =>
    apiClient.get<ApiResponse<Proposal[]>>(`/proposals/job-posts/${jobPostId}`),

  getMine: () => apiClient.get<ApiResponse<Proposal[]>>('/proposals/mine'),

  updateStatus: (proposalId: string, status: 'shortlisted' | 'rejected') =>
    apiClient.patch<ApiResponse<Proposal>>(`/proposals/${proposalId}/status`, { status }),
};
