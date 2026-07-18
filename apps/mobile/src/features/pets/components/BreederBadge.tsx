import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../../core/theme/tokens';

export function BreederBadge() {
  return (
    <View style={styles.badge} accessibilityLabel="Criador verificado">
      <Ionicons name="shield-checkmark" size={14} color={theme.colors.success} />
      <Text style={styles.text}>Verificado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.successFaded,
  },
  text: {
    color: theme.colors.success,
    fontSize: theme.typography.size.xs,
    fontWeight: '900',
  },
});
