import { StyleSheet } from 'react-native';
import { theme } from '../../../core/theme/tokens';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.size.hero,
    fontWeight: '900',
    lineHeight: theme.typography.size.hero * theme.typography.lineHeight.tight,
  },
  ownerCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 5,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.xl,
    fontWeight: '900',
  },
  name: {
    color: theme.colors.text,
    fontSize: theme.typography.size.xl,
    fontWeight: '900',
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.sm,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  stat: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceAlt,
  },
  statValue: {
    color: theme.colors.text,
    fontSize: theme.typography.size.xl,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.xs,
    fontWeight: '800',
    marginTop: theme.spacing.xs,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.size.lg,
    fontWeight: '900',
  },
  settingRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  settingText: {
    color: theme.colors.text,
    fontSize: theme.typography.size.md,
    fontWeight: '800',
  },
  settingMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.sm,
    marginTop: theme.spacing.xs,
  },
  statusPill: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.successFaded,
  },
  statusText: {
    color: theme.colors.success,
    fontSize: theme.typography.size.xs,
    fontWeight: '900',
  },
});
