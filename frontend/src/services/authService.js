import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, data } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, data } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, we still want to clear local storage
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_TOKEN,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.SETTINGS,
      ]);
    }
  }

  async refreshToken(token) {
    try {
      const response = await api.post('/auth/refresh-token', { token });
      const { token: newToken, data } = response.data;
      
      // Store new token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await api.patch('/auth/reset-password', { token, password });
      const { token: newToken, data } = response.data;
      
      // Store new token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      const response = await api.patch(`/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async resendVerification() {
    try {
      const response = await api.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getMe() {
    try {
      const response = await api.get('/auth/me');
      const { data } = response.data;
      
      // Update stored user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await api.patch('/auth/update-password', {
        currentPassword,
        newPassword,
      });
      const { token, data } = response.data;
      
      // Store new token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getStoredToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  async getStoredUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  async isAuthenticated() {
    try {
      const token = await this.getStoredToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();