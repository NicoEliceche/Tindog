// src/core/data/services/authService.ts
import { client } from '../client/AxiosClient';
import { LoginResponse } from '@features/auth/types/auth.types';
import type { GoogleAuthConfigResponse } from '@core/types/auth.types';

export async function login(email: string, pass: string): Promise<LoginResponse> {
  // Simulación de login. En real: await client.post('/auth/login', { email, pass });
  return new Promise((resolve) => setTimeout(() => {
    resolve({
      token: 'fake-jwt-token',
      user: {
        id: 'u-current',
        name: 'Nico',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100',
      }
    });
  }, 1000));
}

export async function registerDevice(publicKey: string): Promise<void> {
  // await client.post('/devices/register', { public_key: publicKey });
  return new Promise((resolve) => setTimeout(resolve, 500));
}

export async function fetchGoogleAuthConfig(): Promise<GoogleAuthConfigResponse> {
  const { data } = await client.get<GoogleAuthConfigResponse>('/api/auth/google');
  return data;
}

export async function loginWithGoogleIdToken(idToken: string): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/api/auth/google', {
    idToken,
    platform: 'web',
  });
  return data;
}
