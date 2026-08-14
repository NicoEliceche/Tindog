import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let isConfigured = false;

export class GoogleSignInFailure extends Error {
  constructor(
    message: string,
    readonly code:
      | 'cancelled'
      | 'configuration'
      | 'development-build-required'
      | 'in-progress'
      | 'oauth-client-mismatch'
      | 'play-services'
      | 'unknown',
  ) {
    super(message);
    this.name = 'GoogleSignInFailure';
  }
}

export function getGoogleSignInConfigurationError(): string | null {
  if (!googleWebClientId) {
    return 'Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en apps/mobile/.env.';
  }

  if (Platform.OS === 'android' && !googleAndroidClientId) {
    return 'Falta EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID en apps/mobile/.env.';
  }

  if (Platform.OS === 'ios' && !googleIosClientId) {
    return 'Falta EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID en apps/mobile/.env.';
  }

  return null;
}

function configureGoogleSignIn(googleModule: GoogleSignInModule) {
  if (isConfigured) {
    return;
  }

  googleModule.GoogleSignin.configure({
    webClientId: googleWebClientId,
    iosClientId: googleIosClientId,
    offlineAccess: false,
    profileImageSize: 160,
  });

  isConfigured = true;
}

export async function signInWithGoogle(): Promise<string | null> {
  const configurationError = getGoogleSignInConfigurationError();

  if (configurationError) {
    throw new GoogleSignInFailure(configurationError, 'configuration');
  }

  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new GoogleSignInFailure(
      'Abrí la development build de Tindog. Expo Go no incluye el módulo nativo de Google Sign-In.',
      'development-build-required',
    );
  }

  let googleModule: GoogleSignInModule | null = null;

  try {
    googleModule = await import('@react-native-google-signin/google-signin');
    configureGoogleSignIn(googleModule);

    if (Platform.OS === 'android') {
      await googleModule.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await googleModule.GoogleSignin.signIn();

    if (googleModule.isCancelledResponse(response)) {
      return null;
    }

    const compatibleResponse = response as unknown as {
      data?: { idToken?: string | null } | null;
      idToken?: string | null;
    };
    const idToken = compatibleResponse.data?.idToken ?? compatibleResponse.idToken ?? null;

    if (!idToken) {
      throw new GoogleSignInFailure('Google no devolvió un ID token para validar.', 'unknown');
    }

    return idToken;
  } catch (error) {
    if (error instanceof GoogleSignInFailure) {
      throw error;
    }

    const nativeError = error as { code?: string; message?: string };

    console.warn('[auth/google/native] Google Sign-In failed', {
      code: nativeError.code ?? 'unknown',
      message: nativeError.message ?? 'No native error message',
      platform: Platform.OS,
    });

    if (nativeError.message?.includes('RNGoogleSignin')) {
      throw new GoogleSignInFailure(
        'La app instalada no contiene Google Sign-In. Reinstalá la development build de Tindog.',
        'development-build-required',
      );
    }

    if (nativeError.code === '10' || nativeError.message?.includes('DEVELOPER_ERROR')) {
      throw new GoogleSignInFailure(
        'Google rechazó la configuración de Android (código 10). Revisá el package y la huella SHA-1 del cliente OAuth.',
        'oauth-client-mismatch',
      );
    }

    if (googleModule?.isErrorWithCode(error)) {
      if (nativeError.code === 'SIGN_IN_CANCELLED') {
        return null;
      }

      if (nativeError.code === googleModule.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new GoogleSignInFailure(
          'Google Play Services no está disponible o está desactualizado.',
          'play-services',
        );
      }

      if (nativeError.code === googleModule.statusCodes.IN_PROGRESS) {
        throw new GoogleSignInFailure('Ya hay un inicio de sesión en curso.', 'in-progress');
      }
    }

    throw new GoogleSignInFailure('No pudimos iniciar sesión con Google.', 'unknown');
  }
}

export async function signOutFromGoogle(): Promise<void> {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    return;
  }

  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch {
    // The Tindog backend session is still revoked even if Google cannot sign out locally.
  }
}
