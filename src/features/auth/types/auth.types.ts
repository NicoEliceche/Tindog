// src/features/auth/types/auth.types.ts
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
}
