import api from './api';

class DonationService {
  async createDonation(donationData) {
    try {
      const response = await api.post('/donations', donationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserDonations(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/donations?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getDonationById(donationId) {
    try {
      const response = await api.get(`/donations/${donationId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async cancelDonation(donationId) {
    try {
      const response = await api.patch(`/donations/${donationId}/cancel`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPublicStats(period = 'all') {
    try {
      const response = await api.get(`/donations/stats?period=${period}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Payment-related methods
  async createPaymentIntent(amount, currency = 'USD', metadata = {}) {
    try {
      const response = await api.post('/payments/create-payment-intent', {
        amount,
        currency,
        metadata,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const response = await api.post('/payments/confirm-payment', {
        paymentIntentId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentMethods() {
    try {
      const response = await api.get('/payments/payment-methods');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async addPaymentMethod(paymentMethodId) {
    try {
      const response = await api.post('/payments/payment-methods', {
        paymentMethodId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async removePaymentMethod(paymentMethodId) {
    try {
      const response = await api.delete(`/payments/payment-methods/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new DonationService();