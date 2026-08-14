export type AuthPlatform = 'web' | 'android' | 'ios';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  platform: AuthPlatform;
}
