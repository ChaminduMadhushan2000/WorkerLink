export interface ApiResponse<T = null> {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  success: boolean;
  message: string;
  data: T | null;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
