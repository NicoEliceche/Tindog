import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginWithGoogleIdToken } from '../../../core/data/services/authService';
import { theme } from '../../../core/theme/tokens';
import type { AuthResponse } from '../../../core/types/auth.types';
import { styles } from './LoginScreen.styles';

WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  onAuthenticated: (auth: AuthResponse) => void;
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const googleConfig = useMemo(
    () => ({
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
    }),
    [],
  );

  const [request, response, promptAsync] = Google.useAuthRequest(googleConfig);

  const isConfigured = Boolean(
    googleConfig.androidClientId || googleConfig.iosClientId || googleConfig.webClientId,
  );

  useEffect(() => {
    const authenticate = async () => {
      if (response?.type !== 'success') {
        return;
      }

      const idToken = response.authentication?.idToken ?? response.params?.id_token;

      if (!idToken) {
        setErrorMessage('Google no devolvió un ID token para validar.');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const auth = await loginWithGoogleIdToken(idToken);
        onAuthenticated(auth);
      } catch {
        setErrorMessage('No pudimos iniciar sesión con Google.');
      } finally {
        setIsLoading(false);
      }
    };

    authenticate();
  }, [onAuthenticated, response]);

  const handleGoogleLogin = async () => {
    setErrorMessage('');

    try {
      await promptAsync();
    } catch {
      setErrorMessage('No se pudo abrir Google.');
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
            disabled={!request || isLoading || !isConfigured}
            onPress={handleGoogleLogin}
            style={({ pressed }) => [
              styles.googleButton,
              (!request || isLoading || !isConfigured) && { opacity: 0.48 },
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
              ? 'Faltan los EXPO_PUBLIC_GOOGLE_*_CLIENT_ID en apps/mobile/.env.'
              : 'Usamos Google solo para confirmar tu identidad. Tindog guarda su propia sesión.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
