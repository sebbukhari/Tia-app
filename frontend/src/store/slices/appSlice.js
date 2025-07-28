import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // App state
  isOnboardingCompleted: false,
  isDarkMode: false,
  language: 'en',
  notificationSettings: {
    push: true,
    email: true,
    sms: false,
  },
  
  // Network state
  isConnected: true,
  isOfflineMode: false,
  
  // UI state
  activeTab: 'home',
  isDrawerOpen: false,
  isSearchVisible: false,
  
  // Permissions
  permissions: {
    camera: null,
    location: null,
    notifications: null,
    contacts: null,
  },
  
  // Feature flags
  features: {
    biometricAuth: false,
    pushNotifications: false,
    offlineMode: false,
    analytics: true,
    socialSharing: true,
    calendarIntegration: false,
    mapsIntegration: false,
  },
  
  // Cache
  lastDataUpdate: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
  
  // Error tracking
  errors: [],
  crashReports: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Onboarding
    setOnboardingCompleted: (state, action) => {
      state.isOnboardingCompleted = action.payload;
    },
    
    // Theme
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    
    // Language
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    
    // Notifications
    updateNotificationSettings: (state, action) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload };
    },
    
    // Network
    setNetworkStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    
    setOfflineMode: (state, action) => {
      state.isOfflineMode = action.payload;
    },
    
    // UI
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    setDrawerOpen: (state, action) => {
      state.isDrawerOpen = action.payload;
    },
    
    toggleDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    
    setSearchVisible: (state, action) => {
      state.isSearchVisible = action.payload;
    },
    
    toggleSearch: (state) => {
      state.isSearchVisible = !state.isSearchVisible;
    },
    
    // Permissions
    updatePermissions: (state, action) => {
      state.permissions = { ...state.permissions, ...action.payload };
    },
    
    setPermission: (state, action) => {
      const { permission, status } = action.payload;
      state.permissions[permission] = status;
    },
    
    // Features
    updateFeatures: (state, action) => {
      state.features = { ...state.features, ...action.payload };
    },
    
    setFeature: (state, action) => {
      const { feature, enabled } = action.payload;
      state.features[feature] = enabled;
    },
    
    // Cache
    setLastDataUpdate: (state) => {
      state.lastDataUpdate = new Date().toISOString();
    },
    
    setCacheExpiry: (state, action) => {
      state.cacheExpiry = action.payload;
    },
    
    // Error tracking
    addError: (state, action) => {
      const error = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.errors.unshift(error);
      // Keep only last 50 errors
      if (state.errors.length > 50) {
        state.errors = state.errors.slice(0, 50);
      }
    },
    
    removeError: (state, action) => {
      state.errors = state.errors.filter(error => error.id !== action.payload);
    },
    
    clearErrors: (state) => {
      state.errors = [];
    },
    
    addCrashReport: (state, action) => {
      const report = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.crashReports.unshift(report);
      // Keep only last 10 crash reports
      if (state.crashReports.length > 10) {
        state.crashReports = state.crashReports.slice(0, 10);
      }
    },
    
    clearCrashReports: (state) => {
      state.crashReports = [];
    },
    
    // Reset app state
    resetAppState: (state) => {
      return {
        ...initialState,
        isOnboardingCompleted: state.isOnboardingCompleted,
        isDarkMode: state.isDarkMode,
        language: state.language,
        permissions: state.permissions,
        features: state.features,
      };
    },
  },
});

export const {
  setOnboardingCompleted,
  setDarkMode,
  setLanguage,
  updateNotificationSettings,
  setNetworkStatus,
  setOfflineMode,
  setActiveTab,
  setDrawerOpen,
  toggleDrawer,
  setSearchVisible,
  toggleSearch,
  updatePermissions,
  setPermission,
  updateFeatures,
  setFeature,
  setLastDataUpdate,
  setCacheExpiry,
  addError,
  removeError,
  clearErrors,
  addCrashReport,
  clearCrashReports,
  resetAppState,
} = appSlice.actions;

export default appSlice.reducer;