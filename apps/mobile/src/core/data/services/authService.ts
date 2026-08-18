import type { AuthResponse } from '../../types/auth.types';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  storeAuthToken,
} from './authTokenStorage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

function getAuthPlatform(): AuthResponse['platform'] {
  if (Platform.OS === 'android' || Platform.OS === 'ios' || Platform.OS === 'web') {
    return Platform.OS;
  }

  return 'web';
}

type MeResponse = {
  user: AuthResponse['user'] | null;
  platform: AuthResponse['platform'];
};

export class GoogleAuthApiFailure extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly serverMessage?: string,
  ) {
    super(message);
    this.name = 'GoogleAuthApiFailure';
  }
}

function googleAuthFailureMessage(status: number, serverMessage?: string): string {
  if (status === 401) {
    return 'Google entregó la cuenta, pero el servidor rechazó la credencial (API 401).';
  }

  if (status === 409) {
    return 'Ese email ya está vinculado a otra identidad de Google (API 409).';
  }

  if (status === 429) {
    return 'Hubo demasiados intentos. Esperá un minuto y volvé a probar (API 429).';
  }

  if (status === 503) {
    return 'El servicio de seguridad del login no está disponible (API 503).';
  }

  if (serverMessage?.includes('client IDs are not configured')) {
    return 'El servidor no tiene configurados los clientes OAuth de Google (API 500).';
  }

  return `El servidor no pudo completar el acceso con Google (API ${status}).`;
}

async function validateStoredAuthToken(
  token: string,
): Promise<{ user: AuthResponse['user'] | null; platform: AuthResponse['platform']; unauthorized: boolean }> {
  if (!apiUrl) {
    return { user: null, platform: 'web', unauthorized: false };
  }

  const response = await fetch(`${apiUrl}/api/auth/me`, {
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

export async function loginWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const platform = getAuthPlatform();
  const response = await fetch(`${apiUrl}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken,
      platform,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    console.warn('[auth/google/api] Login request rejected', {
      status: response.status,
      serverMessage: body?.error ?? 'No response body',
      platform,
    });
    throw new GoogleAuthApiFailure(
      googleAuthFailureMessage(response.status, body?.error),
      response.status,
      body?.error,
    );
  }

  const auth = (await response.json()) as AuthResponse;

  if (auth.platform !== platform) {
    console.warn('[auth/google/api] Invalid session platform', {
      expectedPlatform: platform,
      receivedPlatform: auth.platform ?? 'missing',
    });
    throw new GoogleAuthApiFailure(
      'El servidor todavía usa una versión anterior y no identificó la sesión como Android/iOS.',
      response.status,
      'Invalid or missing session platform',
    );
  }

  await storeAuthToken(auth.token);
  return auth;
}

export async function restoreAuthSession(): Promise<AuthResponse | null> {
  const token = await getStoredAuthToken();

  if (!token && Platform.OS !== 'web') {
    return null;
  }

  try {
    const { user, platform, unauthorized } = await validateStoredAuthToken(token ?? '');

    if (!user || platform !== getAuthPlatform()) {
      if (unauthorized) {
        await clearStoredAuthToken();
      }

      if (platform !== getAuthPlatform()) {
        await clearStoredAuthToken();
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
  const token = await getStoredAuthToken();

  if (!token && Platform.OS !== 'web') {
    await clearStoredAuthToken();
    return;
  }

  if (apiUrl) {
    await fetch(`${apiUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      cache: 'no-store',
    }).catch(() => undefined);
  }

  await clearStoredAuthToken();
}

/**
 * Sesion local para los accesos que todavia no pasan por el backend: email
 * con contrasena, codigo por email y telefono. Es la misma logica que usa la
 * web, replicada aca para que las dos plataformas se comporten igual.
 *
 * Se guarda en SecureStore, como el token: son datos de sesion.
 */
const LOCAL_SESSION_KEY = 'tindog.auth.local.v1';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function openLocalSession(user: { name: string; email: string }): Promise<AuthResponse> {
  const session: AuthResponse = {
    token: '',
    user: { id: `local-${Date.now()}`, name: user.name, email: user.email },
    platform: getAuthPlatform(),
  };
  await SecureStore.setItemAsync(LOCAL_SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function restoreLocalSession(): Promise<AuthResponse | null> {
  try {
    const raw = await SecureStore.getItemAsync(LOCAL_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

export async function clearLocalSession(): Promise<void> {
  await SecureStore.deleteItemAsync(LOCAL_SESSION_KEY).catch(() => undefined);
}

export async function loginWithEmailPassword(email: string, password: string): Promise<AuthResponse> {
  if (!EMAIL_PATTERN.test(email)) throw new Error('Ingresá un email válido.');
  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.');
  return openLocalSession({ name: email.split('@')[0], email });
}

/** Envia el codigo de un solo uso. Sin backend, se muestra en pantalla. */
export async function requestEmailCode(email: string): Promise<string> {
  if (!EMAIL_PATTERN.test(email)) throw new Error('Ingresá un email válido.');
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function verifyEmailCode(email: string, code: string, expected: string): Promise<AuthResponse> {
  if (code.trim() !== expected) throw new Error('El código no coincide. Revisalo e intentá de nuevo.');
  return openLocalSession({ name: email.split('@')[0], email });
}
