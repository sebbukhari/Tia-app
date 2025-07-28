import api from './api';

class UserService {
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.patch('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePreferences(preferences) {
    try {
      const response = await api.patch('/users/preferences', { preferences });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDonationHistory(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/users/donations?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/users/events?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deactivateAccount(password) {
    try {
      const response = await api.delete('/users/account', {
        data: { password }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();