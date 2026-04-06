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

export interface ServiceResult<T = null> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface SafeUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterResult {
  user: SafeUser;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}
