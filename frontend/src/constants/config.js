import Config from 'react-native-config';

// API Configuration
export const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:3000/api';

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = Config.STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key';

// App Configuration
export const APP_NAME = 'Tia Charity';
export const APP_VERSION = '1.0.0';
export const SUPPORT_EMAIL = 'support@tia-charity.org';
export const PRIVACY_POLICY_URL = 'https://tia-charity.org/privacy';
export const TERMS_OF_SERVICE_URL = 'https://tia-charity.org/terms';

// Features
export const FEATURES = {
  BIOMETRIC_AUTH: true,
  PUSH_NOTIFICATIONS: true,
  OFFLINE_MODE: true,
  ANALYTICS: true,
  SOCIAL_SHARING: true,
  CALENDAR_INTEGRATION: true,
  MAPS_INTEGRATION: true,
  CAMERA_UPLOAD: true,
  RECURRING_DONATIONS: true,
  VOLUNTEER_TRACKING: true,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
};

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_DONATION_AMOUNT: 1,
  MAX_DONATION_AMOUNT: 100000,
  MAX_FILE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Cache
export const CACHE = {
  IMAGE_CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7 days
  API_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  USER_DATA_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours
};

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  IMAGE_UPLOAD: 60000, // 60 seconds
  VIDEO_UPLOAD: 300000, // 5 minutes
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@tia_user_token',
  USER_DATA: '@tia_user_data',
  SETTINGS: '@tia_settings',
  OFFLINE_DATA: '@tia_offline_data',
  BIOMETRIC_ENABLED: '@tia_biometric_enabled',
  ONBOARDING_COMPLETED: '@tia_onboarding_completed',
  PUSH_TOKEN: '@tia_push_token',
};

// Colors
export const COLORS = {
  primary: '#2E7D32',
  primaryDark: '#1B5E20',
  primaryLight: '#4CAF50',
  secondary: '#FF6F00',
  secondaryDark: '#E65100',
  secondaryLight: '#FFB74D',
  accent: '#00BCD4',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  success: '#4CAF50',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  border: '#E0E0E0',
  shadow: '#000000',
  transparent: 'transparent',
};

// Dimensions
export const DIMENSIONS = {
  HEADER_HEIGHT: 56,
  TAB_BAR_HEIGHT: 60,
  BUTTON_HEIGHT: 48,
  INPUT_HEIGHT: 56,
  CARD_BORDER_RADIUS: 12,
  BUTTON_BORDER_RADIUS: 8,
  INPUT_BORDER_RADIUS: 8,
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};

// Animation
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
  },
};

export default {
  API_BASE_URL,
  STRIPE_PUBLISHABLE_KEY,
  APP_NAME,
  APP_VERSION,
  SUPPORT_EMAIL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
  FEATURES,
  PAGINATION,
  VALIDATION,
  CACHE,
  TIMEOUTS,
  STORAGE_KEYS,
  COLORS,
  DIMENSIONS,
  TYPOGRAPHY,
  ANIMATION,
};