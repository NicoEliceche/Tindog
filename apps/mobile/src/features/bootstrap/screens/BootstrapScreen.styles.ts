import { StyleSheet } from 'react-native';
import type { AppTheme } from '../../../core/theme/tokens';

/**
 * Los colores llegan por parametro y no importados sueltos: esta pantalla
 * es lo primero que se ve, y si se pintara siempre en oscuro quien tiene el
 * claro elegido veria el salto de un modo al otro apenas termina de cargar.
 */
export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    logoFrame: {
      width: 172,
      height: 172,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: theme.radius.xxl,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },
    logo: {
      width: '86%',
      height: '86%',
    },
    wordmarkBand: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.primaryBorder,
      borderBottomRightRadius: theme.radius.xl,
      backgroundColor: theme.colors.surfaceOverlay,
    },
    wordmark: {
      color: theme.colors.primary,
      fontSize: theme.typography.size.sm,
      fontWeight: '900',
      letterSpacing: 3,
    },
    loadingText: {
      color: theme.colors.textSecondary,
      fontSize: theme.typography.size.sm,
      fontWeight: '700',
    },
  });
}
