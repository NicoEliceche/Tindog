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
    gap: theme.spacing.lg,
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
  summaryCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  summaryItem: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  summaryValue: {
    color: theme.colors.text,
    fontSize: theme.typography.size.xl,
    fontWeight: '900',
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  card: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 88,
    height: 108,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surfaceAlt,
  },
  cardContent: {
    flex: 1,
    minHeight: 108,
    justifyContent: 'space-between',
  },
  petName: {
    color: theme.colors.text,
    fontSize: theme.typography.size.lg,
    fontWeight: '900',
  },
  petMeta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.sm,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceAlt,
  },
  chipText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.size.xs,
    fontWeight: '800',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  coiText: {
    color: theme.colors.primaryDark,
    fontSize: theme.typography.size.sm,
    fontWeight: '900',
  },
  sectionLabel: {
    color: theme.colors.text,
    fontSize: theme.typography.size.lg,
    fontWeight: '900',
  },
});
