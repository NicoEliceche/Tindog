import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import { GoldHeading } from '../../../shared/components/GoldHeading';

const logoSource = require('../../../../assets/tindog_patita_logo_black.png');
const mockupSource = require('../../../../assets/home_screen.jpeg');

/**
 * Primera pantalla de la aplicación, igual que la de la web: la marca, la
 * promesa y el botón dorado que lleva al ingreso. Antes el teléfono abría
 * directamente en el login y se perdía esta entrada.
 */
export function LandingScreen({ onStart }: { onStart: () => void }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const compact = height < 740;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: Math.max(insets.top, 12) + 12, paddingBottom: Math.max(insets.bottom, 16) + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Image source={logoSource} style={[styles.logo, compact && styles.logoCompact]} resizeMode="contain" />

      <View style={styles.eyebrow}>
        <Ionicons name="sparkles" size={13} color={theme.colors.primary} />
        <Text style={styles.eyebrowText}>La red social para perros</Text>
      </View>

      <GoldHeading style={[styles.title, compact && styles.titleCompact]}>Donde las Patas conectan.</GoldHeading>

      <Text style={styles.subtitle}>
        La red social más guau para encontrar la cita perfecta de tu mejor amigo.
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Empezar aventura"
        onPress={onStart}
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
      >
        <Text style={styles.ctaText}>Empezar aventura</Text>
      </Pressable>

      <Text style={styles.trust}>Gratis · Sin tarjeta de crédito</Text>

      <View style={styles.mockupFrame}>
        <Image source={mockupSource} style={styles.mockup} resizeMode="cover" />
      </View>
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent' },
    content: { paddingHorizontal: 20, alignItems: 'center' },

    // El alto sigue la proporcion del archivo (1192x1320) y el radio es la
    // mitad del lado mayor, que es lo que hace el 50% de la web. React
    // Native no admite porcentajes en borderRadius.
    //
    // La web pasa de 120 a 235 en escritorio; en el telefono ese salto
    // literal daria 329 y ocuparia casi todo el ancho, asi que va a 220,
    // dos tercios del ancho util de una pantalla de 375.
    logo: { width: 220, height: 244, borderRadius: 122 },
    logoCompact: { width: 176, height: 195, borderRadius: 98 },

    eyebrow: {
      flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99,
      backgroundColor: theme.colors.primaryFaded,
      borderWidth: 1, borderColor: theme.colors.primaryBorder,
    },
    eyebrowText: { color: theme.colors.primary, fontSize: 11, fontWeight: '900' },

    title: { fontSize: 38, fontWeight: '900', textAlign: 'center', marginTop: 16, lineHeight: 42 },
    titleCompact: { fontSize: 31, lineHeight: 35 },
    subtitle: {
      color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22,
      textAlign: 'center', marginTop: 12, maxWidth: 320,
    },

    cta: {
      minHeight: 54, minWidth: 240, paddingHorizontal: 28, marginTop: 24,
      alignItems: 'center', justifyContent: 'center', borderRadius: 27,
      backgroundColor: theme.colors.primary,
      elevation: 8, shadowColor: theme.colors.shadow,
      shadowOpacity: 0.3, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
    },
    ctaPressed: { opacity: 0.85 },
    ctaText: { color: theme.colors.onPrimary, fontSize: 16, fontWeight: '900' },
    trust: { color: theme.colors.textMuted, fontSize: 11, marginTop: 10 },

    mockupFrame: {
      width: 232, height: 464, marginTop: 28, borderRadius: 32, overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.borderStrong,
      elevation: 10, shadowColor: theme.colors.shadow,
      shadowOpacity: 0.28, shadowRadius: 26, shadowOffset: { width: 0, height: 14 },
    },
    mockup: { width: '100%', height: '100%' },
  });
}
