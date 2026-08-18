import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { ConnectionRequest } from '../../../core/types/social.types';

const STATUS_LABEL: Record<ConnectionRequest['status'], string> = {
  pending: 'Esperando respuesta',
  accepted: 'Aceptada',
  declined: 'Rechazada',
};

/**
 * Solicitudes de conexión, entrantes y salientes.
 *
 * Existía en la web pero no acá, así que desde el teléfono no había forma
 * de aceptar una conexión: la app quedaba a mitad de camino.
 */
export function RequestsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { requests, respondToRequest } = useAppData();

  const incoming = requests.filter((item) => item.direction === 'incoming');
  const outgoing = requests.filter((item) => item.direction === 'outgoing');

  const renderIncoming = ({ item }: { item: ConnectionRequest }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.ownerAvatar }} style={styles.avatar} />
      <View style={styles.copy}>
        <Text style={styles.name}>{item.ownerName}</Text>
        <Text style={styles.detail}>{item.pet.name} · {item.pet.breed} · {item.pet.age} años</Text>
      </View>
      {item.status === 'pending' ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => respondToRequest(item.id, true)}
            style={styles.accept}
          >
            <Ionicons name="checkmark" size={18} color={theme.colors.onPrimary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => respondToRequest(item.id, false)}
            style={styles.decline}
          >
            <Ionicons name="close" size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <Text style={styles.status}>{STATUS_LABEL[item.status]}</Text>
      )}
    </View>
  );

  const renderOutgoing = ({ item }: { item: ConnectionRequest }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.pet.photos[0] }} style={styles.avatar} />
      <View style={styles.copy}>
        <Text style={styles.name}>{item.pet.name}</Text>
        <Text style={styles.detail}>{item.pet.breed} · {STATUS_LABEL[item.status]}</Text>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}
      data={incoming}
      keyExtractor={(item) => item.id}
      renderItem={renderIncoming}
      ItemSeparatorComponent={() => <View style={{ height: 9 }} />}
      ListHeaderComponent={
        <View style={styles.head}>
          <Text style={styles.intro}>
            Acá decidís con quién se abre un chat. Nadie puede escribirte hasta que aceptes su solicitud.
          </Text>
          <Text style={styles.section}>RECIBIDAS</Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="mail-outline" size={30} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>No tenés solicitudes pendientes.</Text>
        </View>
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <Text style={styles.section}>ENVIADAS</Text>
          {outgoing.length > 0 ? outgoing.map((item) => (
            <View key={item.id} style={{ marginBottom: 9 }}>{renderOutgoing({ item })}</View>
          )) : (
            <View style={styles.empty}>
              <Ionicons name="paper-plane-outline" size={30} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Todavía no enviaste ninguna solicitud.</Text>
            </View>
          )}
        </View>
      }
    />
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { padding: 16, paddingTop: 8 },
    head: { gap: 12, marginBottom: 12 },
    intro: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19 },
    section: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    footer: { marginTop: 22, gap: 12 },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12,
      borderRadius: 20, backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    avatar: { width: 52, height: 52, borderRadius: 16 },
    copy: { flex: 1, minWidth: 0 },
    name: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
    detail: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 },
    actions: { flexDirection: 'row', gap: 7 },
    accept: {
      width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    decline: {
      width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: theme.colors.border,
    },
    status: { color: theme.colors.textMuted, fontSize: 11, fontWeight: '800' },
    empty: {
      alignItems: 'center', gap: 8, padding: 26, borderRadius: 20,
      borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border,
    },
    emptyText: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center' },
  });
}
