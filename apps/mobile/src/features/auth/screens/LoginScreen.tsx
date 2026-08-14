import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GoogleAuthApiFailure,
  loginWithGoogleIdToken,
} from '../../../core/data/services/authService';
import { theme } from '../../../core/theme/tokens';
import type { AuthResponse } from '../../../core/types/auth.types';
import { AuroraBackground } from '../../../shared/components/AuroraBackground';
import { styles } from './LoginScreen.styles';
import {
  getGoogleSignInConfigurationError,
  GoogleSignInFailure,
  signInWithGoogle,
} from '../services/googleSignInService';

interface LoginScreenProps {
  onAuthenticated: (auth: AuthResponse) => void;
}

const logoSource = require('../../../../assets/tindog_patita_logo.png');
const googleIconSource = require('../../../../assets/google_g_icon.png');

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

interface AuthButtonProps {
  label: string;
  iconSource: number;
  minHeight: number;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}

function AuthButton({ label, iconSource, minHeight, loading = false, disabled = false, onPress }: AuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.authButton,
        { minHeight },
        (disabled || loading) && styles.authButtonDisabled,
        pressed && !disabled && !loading && styles.authButtonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimary} />
      ) : (
        <>
          <Image source={iconSource} resizeMode="contain" style={styles.googleIcon} accessibilityIgnoresInvertColors />
          <Text style={styles.authButtonText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function LoginScreen({ onAuthenticated }: LoginScreenProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const googleConfigurationError = getGoogleSignInConfigurationError();

  const isShort = height < 720;
  const isLandscape = width > height;
  const sidePadding = theme.spacing.lg;

  const logoSize = clamp(
    Math.round((isLandscape ? height : Math.min(width, height)) * (isShort ? 0.38 : 0.42)),
    isLandscape ? 122 : 148,
    isLandscape ? 160 : 196,
  );
  const logoBandHeight = Math.max(32, Math.round(logoSize * 0.18));
  const titleSize = isShort ? 24 : 28;
  const subtitleSize = isShort ? 13 : 14;
  const kickerSize = isShort ? 12 : 13;
  const cardPadding = isShort ? theme.spacing.md : theme.spacing.lg;
  const sectionGap = isShort ? theme.spacing.sm : theme.spacing.md;
  const buttonMinHeight = isShort ? 50 : 54;
  const topPadding = Math.max(insets.top + (isShort ? 10 : 14), 16);
  const bottomPadding = Math.max(insets.bottom + (isShort ? 10 : 14), 16);
  const subtitleMaxWidth = Math.min((isLandscape ? width * 0.44 : width) - sidePadding * 2, 360);

  const handleGoogleLogin = async () => {
    setErrorMessage('');

    if (googleConfigurationError) {
      setErrorMessage(googleConfigurationError);
      return;
    }

    setIsLoading(true);

    try {
      const idToken = await signInWithGoogle();

      if (!idToken) {
        return;
      }

      const auth = await loginWithGoogleIdToken(idToken);
      onAuthenticated(auth);
    } catch (error) {
      setErrorMessage(
        error instanceof GoogleSignInFailure
          ? error.message
          : error instanceof GoogleAuthApiFailure
            ? error.message
          : 'No pudimos iniciar sesión con Google.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AuroraBackground theme={theme} />

      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.safeArea, { paddingTop: topPadding, paddingBottom: bottomPadding }]}
      >
        <View style={[styles.layout, isLandscape && styles.layoutLandscape]}>
        <View style={[styles.hero, isLandscape && styles.heroLandscape, { gap: sectionGap }]}>
          <View
            style={[
              styles.logoFrame,
              {
                width: logoSize,
                height: logoSize,
                borderRadius: Math.round(logoSize * 0.22),
              },
            ]}
          >
            <Image source={logoSource} resizeMode="contain" style={styles.logoImage} accessibilityLabel="Logo de Tindog" />
            <View
              style={[
                styles.logoWordmarkBand,
                {
                  height: logoBandHeight,
                  borderBottomRightRadius: Math.round(logoBandHeight / 2),
                },
              ]}
            >
              <Text style={[styles.logoWordmark, { fontSize: isShort ? 14 : 15 }]}>TINDOG</Text>
            </View>
          </View>

          <Text style={[styles.kicker, { fontSize: kickerSize }]}>Conectá, cruzá y encontrá su pareja ideal</Text>
          <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 4 }]}>¡Bienvenido a Tindog!</Text>
          <Text style={[styles.subtitle, { fontSize: subtitleSize, lineHeight: Math.round(subtitleSize * 1.45), maxWidth: subtitleMaxWidth }]}>
            Conecta patitas, una tarjeta a la vez.
          </Text>
        </View>

        <View style={[styles.authColumn, isLandscape && styles.authColumnLandscape]}>
        <View style={[styles.authCard, { padding: cardPadding, gap: sectionGap }]}>
          <Text style={[styles.sectionLabel, { fontSize: isShort ? 14 : 16 }]}>Acceso rápido</Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <AuthButton
            label="Continuar con Google"
            iconSource={googleIconSource}
            minHeight={buttonMinHeight}
            loading={isLoading}
            disabled={isLoading || Boolean(googleConfigurationError)}
            onPress={handleGoogleLogin}
          />

          <View style={styles.newUserLine}>
            <Text style={styles.newUserText}>Tu cuenta se crea automáticamente al continuar.</Text>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>O INICIÁ SESIÓN CON</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.futureOptions} accessibilityLabel="Opciones de acceso disponibles próximamente">
            <Text style={styles.futureOption}>Email</Text>
            <Text style={styles.futureOption}>Teléfono</Text>
          </View>
        </View>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}
