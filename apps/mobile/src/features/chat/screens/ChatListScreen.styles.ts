import { StyleSheet } from 'react-native';
import { theme } from '../../../core/theme/tokens';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.size.hero,
    fontWeight: '900',
    lineHeight: theme.typography.size.hero * theme.typography.lineHeight.tight,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.md,
    lineHeight: theme.typography.size.md * theme.typography.lineHeight.normal,
    marginTop: theme.spacing.sm,
  },
  search: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  searchText: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.md,
    fontWeight: '700',
  },
  row: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  name: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.size.md,
    fontWeight: '900',
  },
  time: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.xs,
    fontWeight: '800',
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.sm,
    lineHeight: theme.typography.size.sm * theme.typography.lineHeight.normal,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  intent: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.infoFaded,
  },
  intentText: {
    color: theme.colors.info,
    fontSize: theme.typography.size.xs,
    fontWeight: '900',
  },
  unread: {
    width: 10,
    height: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginLeft: 72,
  },
});
