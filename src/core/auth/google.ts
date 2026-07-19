import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client();

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  name: string;
  picture?: string;
}

export function getGoogleClientIds(): string[] {
  return [
    process.env.GOOGLE_WEB_CLIENT_ID,
    process.env.GOOGLE_ANDROID_CLIENT_ID,
    process.env.GOOGLE_IOS_CLIENT_ID,
  ].filter((clientId): clientId is string => Boolean(clientId));
}

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleUser> {
  const audience = getGoogleClientIds();

  if (audience.length === 0) {
    throw new Error('Google OAuth client IDs are not configured');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new Error('Google token is missing required identity claims');
  }

  if (!payload.email_verified) {
    throw new Error('Google account email is not verified');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    picture: payload.picture,
  };
}
