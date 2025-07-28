import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import donationService from '../../services/donationService';
import { showMessage } from 'react-native-flash-message';

// Async thunks
export const createDonation = createAsyncThunk(
  'donation/create',
  async (donationData, { rejectWithValue }) => {
    try {
      const response = await donationService.createDonation(donationData);
      showMessage({
        message: 'Donation Successful',
        description: 'Thank you for your generous donation!',
        type: 'success',
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Donation failed';
      showMessage({
        message: 'Donation Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

export const fetchUserDonations = createAsyncThunk(
  'donation/fetchUserDonations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await donationService.getUserDonations(params);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch donations';
      return rejectWithValue(message);
    }
  }
);

export const fetchPublicStats = createAsyncThunk(
  'donation/fetchPublicStats',
  async (period = 'all', { rejectWithValue }) => {
    try {
      const response = await donationService.getPublicStats(period);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch statistics';
      return rejectWithValue(message);
    }
  }
);

export const cancelDonation = createAsyncThunk(
  'donation/cancel',
  async (donationId, { rejectWithValue }) => {
    try {
      const response = await donationService.cancelDonation(donationId);
      showMessage({
        message: 'Donation Cancelled',
        description: 'Your recurring donation has been cancelled',
        type: 'info',
      });
      return { donationId, ...response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel donation';
      showMessage({
        message: 'Cancellation Failed',
        description: message,
        type: 'danger',
      });
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  donations: [],
  stats: {
    totalAmount: 0,
    totalDonations: 0,
    avgAmount: 0,
    maxAmount: 0,
    minAmount: 0,
  },
  publicStats: {
    stats: {},
    categoryStats: [],
    recentDonations: [],
  },
  currentDonation: null,
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

const donationSlice = createSlice({
  name: 'donation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDonations: (state) => {
      state.donations = [];
      state.pagination = initialState.pagination;
    },
    setCurrentDonation: (state, action) => {
      state.currentDonation = action.payload;
    },
    clearCurrentDonation: (state) => {
      state.currentDonation = null;
    },
    updateDonationStatus: (state, action) => {
      const { donationId, status } = action.payload;
      const donation = state.donations.find(d => d._id === donationId);
      if (donation) {
        donation.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create donation
      .addCase(createDonation.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createDonation.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentDonation = action.payload.donation;
        state.donations.unshift(action.payload.donation);
        // Update stats
        if (action.payload.donation.status === 'completed') {
          state.stats.totalAmount += action.payload.donation.amount;
          state.stats.totalDonations += 1;
        }
      })
      .addCase(createDonation.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Fetch user donations
      .addCase(fetchUserDonations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserDonations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.donations = action.payload.donations;
        state.stats = action.payload.stats;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserDonations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch public stats
      .addCase(fetchPublicStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPublicStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicStats = action.payload;
      })
      .addCase(fetchPublicStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Cancel donation
      .addCase(cancelDonation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(cancelDonation.fulfilled, (state, action) => {
        state.isLoading = false;
        const donation = state.donations.find(d => d._id === action.payload.donationId);
        if (donation) {
          donation.status = 'cancelled';
          donation.recurringSchedule.isActive = false;
        }
      })
      .addCase(cancelDonation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearDonations,
  setCurrentDonation,
  clearCurrentDonation,
  updateDonationStatus,
} = donationSlice.actions;

export default donationSlice.reducer;