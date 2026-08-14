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

/**
 * Sesión local para los métodos que todavía no tienen backend (email y
 * teléfono). El backend real sólo expone Google hoy, así que estos flujos
 * validan el formato de entrada y abren sesión contra el mismo mock que ya
 * usa el resto de la app.
 *
 * Cuando exista el endpoint, se reemplaza el cuerpo por la llamada HTTP: la
 * firma y el consumidor no cambian.
 */
const LOCAL_SESSION_KEY = 'tindog.auth.local.v1';

export interface LocalSessionUser { name: string; email: string; }

export function readLocalSession(): LocalSessionUser | null {
  if (!canUseBrowserStorage()) return null;
  const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as LocalSessionUser; } catch { return null; }
}

export function clearLocalSession(): void {
  if (canUseBrowserStorage()) window.localStorage.removeItem(LOCAL_SESSION_KEY);
}

function openLocalSession(user: LocalSessionUser): LocalSessionUser {
  if (canUseBrowserStorage()) window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  return user;
}

export async function loginWithEmailPassword(email: string, password: string): Promise<LocalSessionUser> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Ingresá un email válido.');
  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
  return openLocalSession({ name: email.split('@')[0], email });
}

/** Envía el código de un solo uso. Sin backend, se muestra en pantalla. */
export async function requestEmailCode(email: string): Promise<string> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Ingresá un email válido.');
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function verifyEmailCode(email: string, code: string, expected: string): Promise<LocalSessionUser> {
  if (code.trim() !== expected) throw new Error('El código no coincide. Revisalo e intentá de nuevo.');
  return openLocalSession({ name: email.split('@')[0], email });
}
