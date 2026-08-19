import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  GoogleAuthApiFailure,
  loginWithEmailPassword,
  loginWithGoogleIdToken,
  requestEmailCode,
  verifyEmailCode,
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

const logoSource = require('../../../../assets/tindog_patita_logo_black.png');
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

/** Metodos alternativos a Google, en el orden en que se ofrecen. */
type Method = 'none' | 'password' | 'code' | 'phone';

function MethodButton({ icon, label, onPress }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.methodButton, pressed && styles.authButtonPressed]}>
      <Ionicons name={icon} size={18} color={theme.colors.primary} />
      <Text style={styles.methodText}>{label}</Text>
    </Pressable>
  );
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
  // Metodos alternativos a Google, en el mismo orden que en la web.
  const [method, setMethod] = useState<Method>('none');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);

  const resetMethod = () => {
    setMethod('none');
    setErrorMessage('');
    setSentCode('');
    setCode('');
    setPassword('');
  };

  const submitPassword = async () => {
    setErrorMessage('');
    setBusy(true);
    try {
      onAuthenticated(await loginWithEmailPassword(email.trim(), password));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos iniciar sesión.');
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async () => {
    setErrorMessage('');
    setBusy(true);
    try {
      if (!sentCode) setSentCode(await requestEmailCode(email.trim()));
      else onAuthenticated(await verifyEmailCode(email.trim(), code, sentCode));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No pudimos continuar.');
    } finally {
      setBusy(false);
    }
  };
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
          {/* El logo va suelto, sin marco ni fondo. El 5% de acercamiento
              recorta el borde en punta de abajo a la derecha que traia la
              imagen y que se notaba contra el fondo. */}
          {/* Sin recorte redondo: la patita llega al borde del archivo y un
              circulo le comia los bordes. La imagen ya trae su fondo negro. */}
          <Image
            source={logoSource}
            resizeMode="contain"
            accessibilityLabel="Logo de Tindog"
            style={{ width: logoSize, height: logoSize * (1320 / 1192), borderRadius: 28 }}
          />

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

          {method === 'none' ? (
            <>
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
            </>
          ) : null}

          {method === 'none' ? (
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>O CONTINUÁ CON</Text>
              <View style={styles.divider} />
            </View>
          ) : null}
          {method === 'none' ? (
            <View style={styles.methodList}>
              <MethodButton icon="mail-outline" label="Enviar código al email" onPress={() => { setMethod('code'); setErrorMessage(''); }} />
              <MethodButton icon="key-outline" label="Email y contraseña" onPress={() => { setMethod('password'); setErrorMessage(''); }} />
              <MethodButton icon="phone-portrait-outline" label="Continuar con teléfono" onPress={() => { setMethod('phone'); setErrorMessage(''); }} />
            </View>
          ) : null}

          {method === 'password' ? (
            <View style={styles.form}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="vos@ejemplo.com" placeholderTextColor={theme.colors.textMuted} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" placeholderTextColor={theme.colors.textMuted} secureTextEntry autoComplete="current-password" />
              <Pressable accessibilityRole="button" disabled={busy} onPress={submitPassword} style={[styles.submit, busy && styles.authButtonDisabled]}>
                <Text style={styles.submitText}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={resetMethod}><Text style={styles.backLink}>Volver a las otras opciones</Text></Pressable>
            </View>
          ) : null}

          {method === 'code' ? (
            <View style={styles.form}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="vos@ejemplo.com" placeholderTextColor={theme.colors.textMuted} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!sentCode} />
              {sentCode ? (
                <>
                  <Text style={styles.codeHint}>Todavía no enviamos mails de verdad, así que tu código es {sentCode}.</Text>
                  <Text style={styles.fieldLabel}>Código</Text>
                  <TextInput style={styles.input} value={code} onChangeText={setCode} placeholder="6 dígitos" placeholderTextColor={theme.colors.textMuted} keyboardType="number-pad" />
                </>
              ) : null}
              <Pressable accessibilityRole="button" disabled={busy} onPress={submitCode} style={[styles.submit, busy && styles.authButtonDisabled]}>
                <Text style={styles.submitText}>{busy ? 'Un momento…' : sentCode ? 'Verificar código' : 'Enviarme un código'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={resetMethod}><Text style={styles.backLink}>Volver a las otras opciones</Text></Pressable>
            </View>
          ) : null}

          {method === 'phone' ? (
            <View style={styles.form}>
              <Text style={styles.fieldLabel}>Teléfono</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+54 9 11 1234 5678" placeholderTextColor={theme.colors.textMuted} keyboardType="phone-pad" autoComplete="tel" />
              <Pressable accessibilityRole="button" onPress={() => setErrorMessage('El acceso por teléfono necesita un proveedor de SMS todavía no conectado.')} style={styles.submit}>
                <Text style={styles.submitText}>Enviarme un código</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={resetMethod}><Text style={styles.backLink}>Volver a las otras opciones</Text></Pressable>
            </View>
          ) : null}
        </View>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}
