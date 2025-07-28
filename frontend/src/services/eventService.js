import api from './api';

class EventService {
  async getAllEvents(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/events?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEventById(eventId) {
    try {
      const response = await api.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createEvent(eventData) {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateEvent(eventId, eventData) {
    try {
      const response = await api.patch(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      const response = await api.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async registerForEvent(eventId) {
    try {
      const response = await api.post(`/events/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async registerAsVolunteer(eventId) {
    try {
      const response = await api.post(`/events/${eventId}/volunteer`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async unregisterFromEvent(eventId) {
    try {
      const response = await api.delete(`/events/${eventId}/unregister`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async searchEvents(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters,
      };
      return await this.getAllEvents(params);
    } catch (error) {
      throw error;
    }
  }

  async getNearbyEvents(latitude, longitude, maxDistance = 50000) {
    try {
      const params = {
        latitude,
        longitude,
        maxDistance,
      };
      return await this.getAllEvents(params);
    } catch (error) {
      throw error;
    }
  }

  async getEventsByCategory(category) {
    try {
      const params = { category };
      return await this.getAllEvents(params);
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingEvents() {
    try {
      const params = {
        startDate: new Date().toISOString(),
      };
      return await this.getAllEvents(params);
    } catch (error) {
      throw error;
    }
  }
}

export default new EventService();