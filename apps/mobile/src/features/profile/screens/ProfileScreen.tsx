import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../../core/theme/tokens';
import { styles } from './ProfileScreen.styles';

const settings = [
  {
    id: 'location',
    title: 'Zona segura',
    detail: 'Palermo, Belgrano y Colegiales',
    icon: 'location-outline' as const,
  },
  {
    id: 'verification',
    title: 'Documentacion',
    detail: 'Pedigri y salud visibles para matches',
    icon: 'document-text-outline' as const,
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    detail: 'Chats y solicitudes importantes',
    icon: 'notifications-outline' as const,
  },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top + theme.spacing.md, theme.spacing.xl) },
        ]}
      >
        <Text style={styles.title}>Perfil</Text>

        <View style={styles.ownerCard}>
          <View style={styles.ownerRow}>
            <View style={styles.avatar} accessibilityLabel="Iniciales de Nico">
              <Text style={styles.initials}>NE</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>Nico Eliceche</Text>
              <Text style={styles.meta}>Tutor responsable · Buenos Aires</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Activo</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>2</Text>
              <Text style={styles.statLabel}>Perros</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferencias</Text>
        {settings.map((item) => (
          <View key={item.id} style={styles.settingRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}>
              <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.settingText}>{item.title}</Text>
                <Text style={styles.settingMeta}>{item.detail}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
