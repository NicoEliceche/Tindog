import { StyleSheet } from 'react-native';
import { theme } from '../../../core/theme/tokens';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    gap: theme.spacing.xl,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 26,
    elevation: 8,
  },
  brand: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoMark: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.xxl,
    fontWeight: '900',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.size.hero,
    fontWeight: '900',
    lineHeight: theme.typography.size.hero * theme.typography.lineHeight.tight,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.size.md * theme.typography.lineHeight.normal,
    textAlign: 'center',
  },
  googleButton: {
    minHeight: 54,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  googleButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.size.md,
    fontWeight: '900',
  },
  helper: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.sm,
    lineHeight: theme.typography.size.sm * theme.typography.lineHeight.normal,
    textAlign: 'center',
  },
  error: {
    color: theme.colors.danger,
    backgroundColor: theme.colors.dangerFaded,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.size.sm,
    fontWeight: '800',
    textAlign: 'center',
  },
});
