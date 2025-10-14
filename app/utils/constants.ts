// Color Palette
export const COLORS = {
  primary: '#8b61c2',
  primaryDark: '#7952a8',
  secondary: '#373941',
  secondaryDark: '#2a2c33',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  white: '#ffffff',
  background: '#f8fafc',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
} as const;

// Trade Status Options
export const TRADE_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  DISPUTED: 'Disputed'
} as const;

// User Status Options
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
} as const;

// KYC Status Options
export const KYC_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
} as const;

// Dispute Status Options
export const DISPUTE_STATUS = {
  OPEN: 'open',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed'
} as const;

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

// Supported Currencies
export const CURRENCIES = {
  NGN: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  TRADES: '/api/trades',
  USERS: '/api/users',
  DISPUTES: '/api/disputes',
  NOTIFICATIONS: '/api/notifications',
  SETTINGS: '/api/settings',
  AUTH: '/api/auth',
  UPLOAD: '/api/upload'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'payslab_user_preferences',
  THEME: 'payslab_theme',
  AUTH_TOKEN: 'payslab_auth_token',
  REFRESH_TOKEN: 'payslab_refresh_token'
} as const;

// Default Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_TRADE_AMOUNT: 10,
  MAX_TRADE_AMOUNT: 1000000,
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  WALLET_ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/
} as const;

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  EXTRA_SLOW: 500
} as const;

// Breakpoints (Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd'
} as const;