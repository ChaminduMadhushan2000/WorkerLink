import { apiClient } from './client';
import type { ApiResponse, ContractorProfile } from '../types';

export interface CreateProfilePayload {
  companyName: string;
  bio?: string;
  contactPhone: string;
  contactEmail: string;
  serviceAreas?: string[];
  categoryIds?: string[];
  availabilityStatus?: 'available' | 'limited' | 'unavailable';
  workforceSizeMin?: number;
  workforceSizeMax?: number;
}

export const contractorApi = {
  getMyProfile: () => apiClient.get<ApiResponse<ContractorProfile>>('/contractors/profile/me'),

  createProfile: (data: CreateProfilePayload) =>
    apiClient.post<ApiResponse<ContractorProfile>>('/contractors/profile', data),

  updateProfile: (data: Partial<CreateProfilePayload>) =>
    apiClient.patch<ApiResponse<ContractorProfile>>('/contractors/profile/me', data),

  getById: (id: string) => apiClient.get<ApiResponse<ContractorProfile>>(`/contractors/${id}`),
};
