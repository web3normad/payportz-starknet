export interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  trades: number;
  rating: number;
  joined: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  walletAddress?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  documents?: UserDocument[];
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  totalVolume?: number;
  successfulTrades?: number;
  completionRate?: number;
}

export interface UserDocument {
  id: string;
  type: 'passport' | 'drivers_license' | 'national_id' | 'utility_bill' | 'bank_statement';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  newsletter: boolean;
  language: string;
  timezone: string;
  currency: string;
}

export interface UserFilter {
  status?: User['status'][];
  verified?: boolean;
  kycStatus?: User['kycStatus'][];
  joinedAfter?: Date;
  joinedBefore?: Date;
  minTrades?: number;
  minRating?: number;
  search?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  walletAddress?: string;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  status?: User['status'];
  verified?: boolean;
  kycStatus?: User['kycStatus'];
}