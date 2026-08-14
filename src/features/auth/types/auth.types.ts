// src/features/auth/types/auth.types.ts
import type { AuthPlatform } from '@core/types/auth.types';

export interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthState['user'];
  platform: AuthPlatform;
}
