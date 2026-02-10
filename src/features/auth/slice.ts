import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { authApi, type LoginRequest, type LoginResponse, type UserProfile } from './api';
import type { RootState } from '../../store';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  profile: UserProfile | null;
  tokens: AuthTokens | null;
  status: 'idle' | 'loading' | 'failed';
  error?: string;
}

const initialState: AuthState = {
  profile: null,
  tokens: null,
  status: 'idle',
};

export const login = createAsyncThunk<LoginResponse, LoginRequest>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      return await authApi.login(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.profile = null;
      state.tokens = null;
      state.status = 'idle';
      state.error = undefined;
    },
    setProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.profile = action.payload.profile;
        state.tokens = action.payload.tokens;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' ? action.payload : 'Login failed';
      });
  },
});

export const { logout, setProfile } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
