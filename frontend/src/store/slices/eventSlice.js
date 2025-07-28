import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventService from '../../services/eventService';
import { showMessage } from 'react-native-flash-message';

// Async thunks
export const fetchEvents = createAsyncThunk(
  'event/fetchEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await eventService.getAllEvents(params);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch events';
      return rejectWithValue(message);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'event/fetchEventById',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventService.getEventById(eventId);
      return response.data.event;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch event';
      return rejectWithValue(message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'event/create',
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventService.createEvent(eventData);
      showMessage({
        message: 'Event Created',
        description: 'Your event has been created successfully',
        type: 'success',
      });
      return response.data.event;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create event';
      showMessage({
        message: 'Event Creation Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'event/update',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventService.updateEvent(eventId, eventData);
      showMessage({
        message: 'Event Updated',
        description: 'Your event has been updated successfully',
        type: 'success',
      });
      return response.data.event;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update event';
      showMessage({
        message: 'Event Update Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

export const registerForEvent = createAsyncThunk(
  'event/register',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventService.registerForEvent(eventId);
      showMessage({
        message: 'Registration Successful',
        description: 'You have been registered for this event',
        type: 'success',
      });
      return { eventId, event: response.data.event };
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

export const registerAsVolunteer = createAsyncThunk(
  'event/registerVolunteer',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventService.registerAsVolunteer(eventId);
      showMessage({
        message: 'Volunteer Registration Successful',
        description: 'You have been registered as a volunteer for this event',
        type: 'success',
      });
      return { eventId, event: response.data.event };
    } catch (error) {
      const message = error.response?.data?.message || 'Volunteer registration failed';
      showMessage({
        message: 'Volunteer Registration Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

export const unregisterFromEvent = createAsyncThunk(
  'event/unregister',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventService.unregisterFromEvent(eventId);
      showMessage({
        message: 'Unregistered Successfully',
        description: 'You have been unregistered from this event',
        type: 'info',
      });
      return { eventId, event: response.data.event };
    } catch (error) {
      const message = error.response?.data?.message || 'Unregistration failed';
      showMessage({
        message: 'Unregistration Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  events: [],
  currentEvent: null,
  userEvents: [],
  filters: {
    category: null,
    type: null,
    dateRange: null,
    location: null,
  },
  searchQuery: '',
  isLoading: false,
  isCreating: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEvents: (state) => {
      state.events = [];
      state.pagination = initialState.pagination;
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearSearchQuery: (state) => {
      state.searchQuery = '';
    },
    updateEventInList: (state, action) => {
      const updatedEvent = action.payload;
      const index = state.events.findIndex(event => event._id === updatedEvent._id);
      if (index !== -1) {
        state.events[index] = updatedEvent;
      }
    },
    removeEventFromList: (state, action) => {
      const eventId = action.payload;
      state.events = state.events.filter(event => event._id !== eventId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.events;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isCreating = false;
        state.events.unshift(action.payload);
        state.currentEvent = action.payload;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedEvent = action.payload;
        const index = state.events.findIndex(event => event._id === updatedEvent._id);
        if (index !== -1) {
          state.events[index] = updatedEvent;
        }
        state.currentEvent = updatedEvent;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register for event
      .addCase(registerForEvent.fulfilled, (state, action) => {
        const { eventId, event } = action.payload;
        const index = state.events.findIndex(e => e._id === eventId);
        if (index !== -1) {
          state.events[index] = event;
        }
        if (state.currentEvent?._id === eventId) {
          state.currentEvent = event;
        }
      })
      // Register as volunteer
      .addCase(registerAsVolunteer.fulfilled, (state, action) => {
        const { eventId, event } = action.payload;
        const index = state.events.findIndex(e => e._id === eventId);
        if (index !== -1) {
          state.events[index] = event;
        }
        if (state.currentEvent?._id === eventId) {
          state.currentEvent = event;
        }
      })
      // Unregister from event
      .addCase(unregisterFromEvent.fulfilled, (state, action) => {
        const { eventId, event } = action.payload;
        const index = state.events.findIndex(e => e._id === eventId);
        if (index !== -1) {
          state.events[index] = event;
        }
        if (state.currentEvent?._id === eventId) {
          state.currentEvent = event;
        }
      });
  },
});

export const {
  clearError,
  clearEvents,
  setCurrentEvent,
  clearCurrentEvent,
  setFilters,
  clearFilters,
  setSearchQuery,
  clearSearchQuery,
  updateEventInList,
  removeEventFromList,
} = eventSlice.actions;

export default eventSlice.reducer;