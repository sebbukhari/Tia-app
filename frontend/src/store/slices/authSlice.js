import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { showMessage } from 'react-native-flash-message';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      showMessage({
        message: 'Login Successful',
        description: 'Welcome back!',
        type: 'success',
      });
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      showMessage({
        message: 'Login Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      showMessage({
        message: 'Registration Successful',
        description: 'Please check your email to verify your account',
        type: 'success',
      });
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      showMessage({
        message: 'Registration Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      showMessage({
        message: 'Logged Out',
        description: 'You have been successfully logged out',
        type: 'info',
      });
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const response = await authService.refreshToken(auth.token);
      return response;
    } catch (error) {
      return rejectWithValue('Token refresh failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      await authService.forgotPassword(email);
      showMessage({
        message: 'Password Reset Email Sent',
        description: 'Please check your email for reset instructions',
        type: 'success',
      });
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      showMessage({
        message: 'Password Reset Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  emailVerified: false,
  biometricEnabled: false,
  loginAttempts: 0,
  lastLoginTime: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      return initialState;
    },
    updateUserData: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setEmailVerified: (state, action) => {
      state.emailVerified = action.payload;
      if (state.user) {
        state.user.isEmailVerified = action.payload;
      }
    },
    setBiometricEnabled: (state, action) => {
      state.biometricEnabled = action.payload;
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
    },
    setLastLoginTime: (state) => {
      state.lastLoginTime = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.token;
        state.emailVerified = action.payload.data.user.isEmailVerified;
        state.loginAttempts = 0;
        state.lastLoginTime = new Date().toISOString();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.loginAttempts += 1;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data.user;
        state.token = action.payload.token;
        state.emailVerified = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        return initialState;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        // Force logout even if API call fails
        return initialState;
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.data.user;
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token refresh failed, logout user
        return initialState;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearAuth,
  updateUserData,
  setEmailVerified,
  setBiometricEnabled,
  incrementLoginAttempts,
  resetLoginAttempts,
  setLastLoginTime,
} = authSlice.actions;

export default authSlice.reducer;