import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../core/theme/tokens';

export type TabKey = 'discovery' | 'pets' | 'chat' | 'profile';
type IoniconName = keyof typeof Ionicons.glyphMap;

interface TabItem {
  key: TabKey;
  label: string;
  icon: IoniconName;
  activeIcon: IoniconName;
}

const tabs: TabItem[] = [
  { key: 'discovery', label: 'Descubrir', icon: 'heart-outline', activeIcon: 'heart' },
  { key: 'pets', label: 'Perros', icon: 'paw-outline', activeIcon: 'paw' },
  { key: 'chat', label: 'Chats', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles' },
  { key: 'profile', label: 'Perfil', icon: 'person-circle-outline', activeIcon: 'person-circle' },
];

interface BottomTabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

export function BottomTabs({ activeTab, onChange }: BottomTabsProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) }]}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        const color = active ? theme.colors.primary : theme.colors.textMuted;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Ionicons name={active ? tab.activeIcon : tab.icon} size={24} color={color} />
            <Text style={[styles.label, { color }, active && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: theme.layout.tabHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 12,
  },
  tab: {
    minWidth: 72,
    minHeight: theme.layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.lg,
    gap: theme.spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontWeight: '700',
  },
  activeLabel: {
    fontWeight: '900',
  },
});
