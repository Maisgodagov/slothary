import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  streakDays: number;
  completedLessons: number;
  level: string;
  xpPoints: number;
}

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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ profile: UserProfile; tokens: AuthTokens }>) {
      state.profile = action.payload.profile;
      state.tokens = action.payload.tokens;
      state.status = 'idle';
      state.error = undefined;
    },
    logout(state) {
      state.profile = null;
      state.tokens = null;
      state.status = 'idle';
      state.error = undefined;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;
