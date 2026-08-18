import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData, type AppNotification, type NotificationKind } from '../../core/providers/AppDataProvider';
import { useAppTheme } from '../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../core/theme/tokens';
import type { RootStackParamList } from '../../navigation/types';

const KIND_ICON: Record<NotificationKind, keyof typeof Ionicons.glyphMap> = {
  request: 'person-add-outline',
  message: 'chatbubble-ellipses-outline',
  appointment: 'calendar-outline',
};

/**
 * Campana de notificaciones con panel desplegable, como en la web.
 *
 * Los avisos se derivan del estado de la app (solicitudes, mensajes sin leer,
 * citas proximas), asi que no hace falta mantenerlos en sincronia a mano.
 */
export function NotificationBell() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { notifications, unreadNotifications, markNotificationsRead } = useAppData();
  const [open, setOpen] = useState(false);

  // Al cerrar se dan por vistas. Marcarlas al abrir borraria el resaltado de
  // las nuevas justo cuando el usuario esta por leerlas.
  const close = () => {
    setOpen(false);
    markNotificationsRead();
  };

  const go = (item: AppNotification) => {
    close();
    if (item.target === 'Messages' && item.conversationId) {
      navigation.navigate('Main', { screen: 'Messages', params: { screen: 'ChatRoom', params: { conversationId: item.conversationId } } });
      return;
    }
    if (item.target === 'Requests') {
      navigation.navigate('Requests');
      return;
    }
    navigation.navigate('Main', { screen: item.target });
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={unreadNotifications > 0
          ? `Notificaciones, ${unreadNotifications} sin leer`
          : 'Notificaciones'}
        onPress={() => setOpen(true)}
        style={styles.bell}
      >
        <Ionicons name="notifications-outline" size={21} color={theme.colors.primary} />
        {unreadNotifications > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        {/* El toque fuera del panel cierra, como el clic afuera en la web. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar notificaciones" style={styles.backdrop} onPress={close}>
          <Pressable style={[styles.panel, { marginTop: Math.max(insets.top, 12) + 54 }]} onPress={(event) => event.stopPropagation()}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>Notificaciones</Text>
              <Pressable
                accessibilityRole="button"
                disabled={unreadNotifications === 0}
                onPress={markNotificationsRead}
              >
                <Text style={[styles.markRead, unreadNotifications === 0 && styles.markReadOff]}>
                  Marcar leídas
                </Text>
              </Pressable>
            </View>

            {notifications.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
                {notifications.map((item) => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    onPress={() => go(item)}
                    style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
                  >
                    <View style={styles.itemIcon}>
                      {item.avatar
                        ? <Image source={{ uri: item.avatar }} style={styles.itemAvatar} />
                        : <Ionicons name={KIND_ICON[item.kind]} size={17} color={theme.colors.primary} />}
                    </View>
                    <View style={styles.itemCopy}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
                    </View>
                    {!item.read ? <View style={styles.unreadDot} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.empty}>
                <Ionicons name="notifications-off-outline" size={30} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>No tenés notificaciones nuevas.</Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    bell: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
    badge: {
      position: 'absolute', top: 4, right: 2, minWidth: 17, height: 17, paddingHorizontal: 4,
      borderRadius: 9, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderWidth: 2, borderColor: theme.colors.background,
    },
    badgeText: { color: theme.colors.onPrimary, fontSize: 9, fontWeight: '900' },

    backdrop: { flex: 1, alignItems: 'flex-end', paddingHorizontal: 12, backgroundColor: theme.colors.overlay },
    panel: {
      width: '100%', maxWidth: 380, maxHeight: '70%',
      borderRadius: 24, overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.borderStrong,
    },
    panelHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingVertical: 13,
      borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    panelTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
    markRead: { color: theme.colors.primary, fontSize: 12, fontWeight: '800' },
    markReadOff: { color: theme.colors.textMuted },

    list: { paddingHorizontal: 8, paddingVertical: 8 },
    item: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 10, borderRadius: 16 },
    itemPressed: { backgroundColor: theme.colors.surfaceAlt },
    itemIcon: {
      width: 40, height: 40, borderRadius: 14, overflow: 'hidden',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.primaryFaded,
    },
    itemAvatar: { width: '100%', height: '100%' },
    itemCopy: { flex: 1, minWidth: 0 },
    itemTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '900' },
    itemBody: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },

    empty: { alignItems: 'center', gap: 9, paddingVertical: 34, paddingHorizontal: 24 },
    emptyText: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center' },
  });
}
