import { apiClient } from './client';
import type { ApiResponse, Message } from '../types';

export const messagesApi = {
  getForJobPost: (jobPostId: string) =>
    apiClient.get<ApiResponse<Message[]>>(`/messages/job-posts/${jobPostId}`),
};
