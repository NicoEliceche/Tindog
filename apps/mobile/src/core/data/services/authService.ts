import type { AuthResponse } from '../../types/auth.types';

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export async function loginWithGoogleIdToken(idToken: string): Promise<AuthResponse> {
  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const response = await fetch(`${apiUrl}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      idToken,
      platform: 'mobile',
    }),
  });

  if (!response.ok) {
    throw new Error(`Google login failed with ${response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
}
