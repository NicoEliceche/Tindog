import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../../core/theme/tokens';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface PrimaryButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  icon?: IoniconName;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ label, icon, variant = 'primary', style, ...props }: PrimaryButtonProps) {
  const palette = {
    primary: { background: theme.colors.primary, color: theme.colors.onPrimary },
    secondary: { background: theme.colors.infoFaded, color: theme.colors.info },
    danger: { background: theme.colors.dangerFaded, color: theme.colors.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.background, opacity: pressed ? 0.76 : 1 },
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {icon ? <Ionicons name={icon} size={20} color={palette.color} /> : null}
        <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  content: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.size.md,
    fontWeight: '800',
  },
});
