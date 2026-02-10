import { apiFetch } from '../../shared/api/client';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface LoginRequest {
  email: string;
  password: string;
}

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

export interface LoginResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  profile: UserProfile;
}

export const authApi = {
  login(payload: LoginRequest) {
    return apiFetch<LoginResponse>('auth/login', {
      method: 'POST',
      body: payload,
    });
  },
};
