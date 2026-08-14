// src/core/data/services/authService.ts
import { client } from '../client/AxiosClient';
import axios from 'axios';
import { LoginResponse } from '@features/auth/types/auth.types';
import type { AuthPlatform, AuthUser, GoogleAuthConfigResponse } from '@core/types/auth.types';

const AUTH_TOKEN_STORAGE_KEY = 'tindog_auth_token';

function getApiBaseUrl(): string | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
  return apiUrl || null;
}

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getStoredAuthToken(): string | null {
  clearStoredAuthToken();
  return null;
}

export function clearStoredAuthToken(): void {
  if (!canUseBrowserStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
}

type MeResponse = {
  user: AuthUser | null;
  platform: AuthPlatform;
};

export class GoogleAuthRequestFailure extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'GoogleAuthRequestFailure';
  }
}

function webGoogleAuthFailureMessage(status?: number): string {
  if (status === 401) return 'El servidor rechazó la credencial de Google (API 401).';
  if (status === 409) return 'Ese email ya está vinculado a otra identidad de Google (API 409).';
  if (status === 429) return 'Hubo demasiados intentos. Esperá un minuto y volvé a probar (API 429).';
  if (status === 503) return 'El servicio de seguridad del login no está disponible (API 503).';
  if (status) return `El servidor no pudo completar el acceso con Google (API ${status}).`;
  return 'No pudimos conectar con el servidor de autenticación.';
}

async function validateStoredAuthToken(
  token?: string | null,
): Promise<{ user: AuthUser | null; platform: AuthPlatform; unauthorized: boolean }> {
  const apiUrl = getApiBaseUrl();

  const response = await fetch(`${apiUrl ?? ''}/api/auth/me`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (response.status === 401) {
    return { user: null, platform: 'web', unauthorized: true };
  }

  if (!response.ok) {
    throw new Error(`Session validation failed with status ${response.status}`);
  }

  const data = (await response.json()) as MeResponse;
  return { user: data.user, platform: data.platform, unauthorized: false };
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
  let data: LoginResponse;

  try {
    const response = await client.post<LoginResponse>('/api/auth/google', {
      idToken,
      platform: 'web',
    });
    data = response.data;
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    console.warn('[auth/google/web] Login request failed', { status: status ?? 'network' });
    throw new GoogleAuthRequestFailure(webGoogleAuthFailureMessage(status), status);
  }

  clearStoredAuthToken();

  return data;
}

export async function restoreAuthSession(): Promise<LoginResponse | null> {
  const token = getStoredAuthToken();

  try {
    const { user, platform, unauthorized } = await validateStoredAuthToken(token);

    if (!user) {
      if (unauthorized) {
        clearStoredAuthToken();
      }

      return null;
    }

    return {
      token: token ?? '',
      user,
      platform,
    };
  } catch {
    return null;
  }
}

export async function logoutCurrentAuthSession(): Promise<void> {
  const token = getStoredAuthToken();

  const apiUrl = getApiBaseUrl();

  await fetch(`${apiUrl ?? ''}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      cache: 'no-store',
    }).catch(() => undefined);

  clearStoredAuthToken();
}
