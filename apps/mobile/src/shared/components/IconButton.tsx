import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { theme } from '../../core/theme/tokens';

type IoniconName = keyof typeof Ionicons.glyphMap;

interface IconButtonProps extends Omit<PressableProps, 'style'> {
  name: IoniconName;
  accessibilityLabel: string;
  color?: string;
  backgroundColor?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  name,
  accessibilityLabel,
  color = theme.colors.text,
  backgroundColor = theme.colors.surface,
  size = 24,
  style,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={theme.spacing.sm}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, opacity: pressed ? 0.72 : 1 },
        style,
      ]}
      {...props}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: theme.layout.touchTarget,
    height: theme.layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.full,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
});
