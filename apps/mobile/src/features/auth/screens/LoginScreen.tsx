import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginWithGoogleIdToken } from '../../../core/data/services/authService';
import { theme } from '../../../core/theme/tokens';
import type { AuthResponse } from '../../../core/types/auth.types';
import { styles } from './LoginScreen.styles';

interface LoginScreenProps {
  onAuthenticated: (auth: AuthResponse) => void;
}

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

let isGoogleConfigured = false;

function configureGoogleSignIn(GoogleSignin: GoogleSignInModule['GoogleSignin']) {
  if (isGoogleConfigured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: googleWebClientId,
    iosClientId: googleIosClientId,
    offlineAccess: false,
    profileImageSize: 160,
  });

  isGoogleConfigured = true;
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isConfigured = Boolean(googleWebClientId);

  const handleGoogleLogin = async () => {
    setErrorMessage('');

    if (!isConfigured) {
      setErrorMessage('Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en apps/mobile/.env.');
      return;
    }

    setIsLoading(true);

    try {
      const {
        GoogleSignin,
        isSuccessResponse,
      } = await import('@react-native-google-signin/google-signin');

      configureGoogleSignIn(GoogleSignin);

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return;
      }

      const idToken = response.data.idToken;

      if (!idToken) {
        setErrorMessage('Google no devolvió un ID token para validar.');
        return;
      }

      const auth = await loginWithGoogleIdToken(idToken);
      onAuthenticated(auth);
    } catch (error) {
      const googleError = error as { code?: string; message?: string };

      if (googleError.code === 'ERR_MODULE_NOT_FOUND' || googleError.message?.includes('RNGoogleSignin')) {
        setErrorMessage('Google Sign-In requiere instalar la development build de Tindog.');
        return;
      }

      try {
        const { isErrorWithCode, statusCodes } = await import('@react-native-google-signin/google-signin');

        if (isErrorWithCode(error)) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            return;
          }

          if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            setErrorMessage('Google Play Services no está disponible o está desactualizado.');
            return;
          }

          if (error.code === statusCodes.IN_PROGRESS) {
            setErrorMessage('Ya hay un inicio de sesión en curso.');
            return;
          }
        }
      } catch {
        setErrorMessage('Google Sign-In requiere instalar la development build de Tindog.');
        return;
      }

      setErrorMessage('No pudimos iniciar sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top + theme.spacing.xl, theme.spacing.xxl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.brand}>
            <View style={styles.logoMark} accessibilityLabel="Tindog">
              <Text style={styles.logoText}>T</Text>
            </View>
            <Text style={styles.title}>Bienvenido a Tindog</Text>
            <Text style={styles.subtitle}>
              Inicia sesión con Google para sincronizar tus perros, chats y preferencias.
            </Text>
          </View>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continuar con Google"
            disabled={isLoading || !isConfigured}
            onPress={handleGoogleLogin}
            style={({ pressed }) => [
              styles.googleButton,
              (isLoading || !isConfigured) && { opacity: 0.48 },
              pressed && { opacity: 0.72 },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : (
              <>
                <Ionicons name="logo-google" size={22} color={theme.colors.primary} />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.helper}>
            {!isConfigured
              ? 'Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en apps/mobile/.env.'
              : 'Usamos Google solo para confirmar tu identidad. Tindog guarda su propia sesión.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
