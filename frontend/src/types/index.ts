export interface ApiResponse<T = null> {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  success: boolean;
  message: string;
  data: T | null;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'contractor' | 'admin';
  status: 'active' | 'paused';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

export interface ContractorProfile {
  id: string;
  ownerUserId: string;
  companyName: string;
  bio: string | null;
  contactPhone: string;
  contactEmail: string;
  serviceAreas: string[];
  categories: Category[];
  availabilityStatus: 'available' | 'limited' | 'unavailable';
  workforceSizeMin: number | null;
  workforceSizeMax: number | null;
  portfolioImages: string[];
  isVerified: boolean;
}

export interface JobPost {
  id: string;
  customerId: string;
  categoryId: string;
  category?: Category;
  title: string;
  description: string;
  district: string;
  city: string;
  addressText: string | null;
  preferredStartDateFrom: string | null;
  preferredStartDateTo: string | null;
  photos: string[];
  status: JobPostStatus;
  materialsNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export type JobPostStatus =
  | 'draft'
  | 'open'
  | 'negotiation'
  | 'price_locked'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Proposal {
  id: string;
  jobPostId: string;
  contractorId: string;
  contractor?: ContractorProfile;
  priceFormat: 'lump_sum' | 'daily_rate';
  proposalPriceLkrCents: number;
  estimatedDays: number | null;
  note: string | null;
  siteVisitRequested: boolean;
  status: 'pending' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';
  createdAt: string;
}

export interface Message {
  id: string;
  jobPostId: string;
  senderId: string;
  recipientId: string;
  sender?: User;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface AuthTokens {
  accessToken: string;
  user: User;
}