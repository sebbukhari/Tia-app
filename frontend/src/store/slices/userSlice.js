import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  preferences: null,
  donationHistory: [],
  userEvents: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setPreferences: (state, action) => {
      state.preferences = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setDonationHistory: (state, action) => {
      state.donationHistory = action.payload;
    },
    addDonation: (state, action) => {
      state.donationHistory.unshift(action.payload);
    },
    setUserEvents: (state, action) => {
      state.userEvents = action.payload;
    },
    addUserEvent: (state, action) => {
      state.userEvents.unshift(action.payload);
    },
    removeUserEvent: (state, action) => {
      state.userEvents = state.userEvents.filter(
        event => event._id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearUser: (state) => {
      return initialState;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setPreferences,
  updatePreferences,
  setDonationHistory,
  addDonation,
  setUserEvents,
  addUserEvent,
  removeUserEvent,
  setLoading,
  setError,
  clearError,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;