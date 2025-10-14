// components/LetterOfCredit/types.ts

export type ApplicationStatus = 
  | 'initial' 
  | 'kyc' 
  | 'preview' 
  | 'creating' 
  | 'funding' 
  | 'active' 
  | 'completed';

export type UserType = 'individual' | 'business';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface LetterOfCreditData {
  exportType: string;
  quantity: string;
  valueUSD: string;
  buyerCountry: string;
  buyerAddress: string;
  deliveryTerms: string;
}

export interface KYCVerificationData {
  nin?: string;
  bvn?: string;
  cacNumber?: string;
  phoneNumber?: string;
  businessType?: UserType;
}

export interface DHLShippingData {
  trackingNumber?: string;
  carrier: 'DHL' | 'FedEx' | 'UPS';
  status: string;
  estimatedDelivery?: string;
  events: Array<{
    timestamp: string;
    location: string;
    description: string;
    status: string;
  }>;
}

export interface ToastNotification {
  visible: boolean;
  message: string;
  type: ToastType;
}

export interface CostBreakdown {
  locFee: number;
  inspectionFee: number;
  kycFee: number;
  trackingFee: number;
  total: number;
}

