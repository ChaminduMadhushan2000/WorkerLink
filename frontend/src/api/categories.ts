import { apiClient } from './client';
import type { ApiResponse, Category } from '../types';

export const categoriesApi = {
  getAll: () => apiClient.get<ApiResponse<Category[]>>('/master-data/categories'),
};
