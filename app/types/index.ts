// types/index.ts

// Privy types
export interface PrivyUser {
  id: string;
  email?: {
    address: string;
  };
  wallet?: {
    address: string;
  };
  createdAt: Date;
  linkedAccounts: any[];
}

// PaySlab Contract types
export interface TradeData {
  sellerAddress: string;
  amount: number;
  deliveryDays: number;
  qualityStandards: string;
  requiresInspection: boolean;
}

export interface Trade {
  id: number;
  buyer: string;
  seller: string;
  totalAmount: string;
  depositAmount: string;
  shipmentAmount: string;
  deliveryAmount: string;
  status: TradeStatus;
  inspectionStatus: InspectionStatus;
  trackingNumber: string;
  qualityStandards: string;
  createdAt: Date;
  deliveryDeadline: Date;
  qualityInspectionRequired: boolean;
  inspector: string;
}

export enum TradeStatus {
  CREATED = 'CREATED',
  FUNDED = 'FUNDED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED'
}

export enum InspectionStatus {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  NOT_REQUIRED = 'NOT_REQUIRED'
}

// Paycrest types
export interface PaycrestRates {
  rate: number;
  fee: number;
  minimum: number;
  maximum: number;
  spread?: number;
}

export interface PaycrestTransaction {
  transactionId: string;
  status: string;
  ngnAmount: number;
  usdcAmount: number;
  bankDetails: {
    bank: string;
    accountNumber: string;
    accountName: string;
    reference: string;
  };
  expiresAt?: string;
  fee?: number;
}

export interface ConversionData {
  ngnAmount: number;
  userWallet: string;
  reference: string;
  userEmail: string;
  userName: string;
}

// Nium types
export interface NiumCountry {
  code: string;
  name: string;
  currency: string;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  isActive: boolean;
}

export interface NiumBeneficiary {
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  swiftCode?: string;
  countryCode: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface NiumSender {
  name: string;
  address: string;
  countryCode?: string;
  purpose?: string;
}

export interface NiumPayoutData {
  amount: number;
  sourceCurrency?: string;
  destinationCurrency: string;
  beneficiary: NiumBeneficiary;
  sender: NiumSender;
  reference: string;
  purpose?: string;
}

export interface NiumPayout {
  payoutId: string;
  status: string;
  sourceAmount: number;
  destinationAmount: number;
  fee: number;
  estimatedDelivery: string;
  trackingReference: string;
  exchangeRate?: number;
  createdAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
}

// Toast notification types
export interface ToastNotification {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

// Sidebar types
export interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  href?: string;
}

// Component Props types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

// Form types
export interface LoginFormData {
  email?: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

// User Profile types
export interface UserProfile {
  bvn: string;
  isVerified: boolean;
  totalTrades: number;
  successfulTrades: number;
  reputationScore: number;
  joinedAt: Date;
}

// Transaction types
export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'conversion' | 'trade_payment' | 'trade_received';
  amount: string;
  currency: 'NGN' | 'USDC';
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
  fee?: string;
  reference?: string;
  hash?: string;
}

// Wallet types
export interface WalletBalance {
  currency: string;
  balance: string;
  usdValue?: string;
  change?: string;
}

// Environment variables
export interface EnvConfig {
  NEXT_PUBLIC_PRIVY_APP_ID: string;
  NEXT_PUBLIC_PAYSLAB_CONTRACT_ADDRESS: string;
  NEXT_PUBLIC_FACTORY_CONTRACT_ADDRESS: string;
  NEXT_PUBLIC_USDC_CONTRACT_ADDRESS: string;
  NEXT_PUBLIC_CHAIN_ID: string;
  NEXT_PUBLIC_RPC_URL: string;
  NEXT_PUBLIC_BLOCK_EXPLORER: string;
  NEXT_PUBLIC_PAYCREST_API_KEY: string;
  NEXT_PUBLIC_NIUM_API_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
}