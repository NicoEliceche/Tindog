export type AuthPlatform = 'web' | 'android' | 'ios';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  /** Area aproximada que ven otros usuarios: nunca el domicilio exacto. */
  zone?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  platform: AuthPlatform;
}
