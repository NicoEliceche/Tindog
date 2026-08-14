import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { Conversation } from '../../../core/types/social.types';
import type { RootStackParamList } from '../../../navigation/types';

export function ChatListScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { conversations, requests, respondToRequest } = useAppData();
  const [query, setQuery] = useState('');
  const pendingIncoming = requests.filter((item) => item.direction === 'incoming' && item.status === 'pending');
  const filtered = conversations.filter((item) => `${item.ownerName} ${item.petName}`.toLowerCase().includes(query.toLowerCase()));

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir chat con ${item.ownerName}`} onPress={() => navigation.navigate('ChatRoom', { conversationId: item.id })} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.body}>
        <View style={styles.topRow}><Text style={styles.name} numberOfLines={1}>{item.ownerName}</Text><Text style={styles.time}>{item.timeLabel}</Text></View>
        <Text style={styles.pet}>{item.petName} · {item.intent}</Text>
        <Text style={styles.message} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      {item.unread ? <View style={styles.unread} /> : <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />}
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 16, 24) }]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListHeaderComponent={<>
          <Text style={styles.title}>Mensajes</Text>
          <Text style={styles.subtitle}>El chat se habilita después de aceptar una solicitud.</Text>
          <View style={styles.search}><Ionicons name="search" size={20} color={theme.colors.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Buscar conversaciones" placeholderTextColor={theme.colors.textMuted} style={styles.input} /></View>
          {pendingIncoming.length ? <View style={styles.requests}>
            <Text style={styles.sectionTitle}>Solicitudes</Text>
            {pendingIncoming.map((request) => <View key={request.id} style={styles.requestCard}>
              <Image source={{ uri: request.pet.photos[0] }} style={styles.requestPhoto} />
              <View style={{ flex: 1 }}><Text style={styles.requestTitle}>{request.ownerName}</Text><Text style={styles.requestMeta}>Quiere conectar con {request.pet.name}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Rechazar solicitud" onPress={() => respondToRequest(request.id, false)} style={styles.roundSecondary}><Ionicons name="close" size={20} color={theme.colors.danger} /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Aceptar solicitud" onPress={() => respondToRequest(request.id, true)} style={styles.roundPrimary}><Ionicons name="checkmark" size={20} color={theme.colors.onPrimary} /></Pressable>
            </View>)}
          </View> : null}
          <Text style={styles.sectionTitle}>Conversaciones</Text>
        </>}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="chatbubbles-outline" size={42} color={theme.colors.primary} /><Text style={styles.emptyTitle}>No encontramos conversaciones</Text></View>}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background }, content: { paddingHorizontal: 16, paddingBottom: 28 },
    title: { color: theme.colors.text, fontSize: 32, fontWeight: '900' }, subtitle: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 5 },
    search: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 16, paddingHorizontal: 14, borderRadius: 99, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    input: { flex: 1, color: theme.colors.text, fontSize: 15 }, requests: { gap: 9, marginBottom: 18 }, sectionTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '900', marginVertical: 8 },
    requestCard: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: 20, backgroundColor: theme.colors.primaryFaded, borderWidth: 1, borderColor: theme.colors.primaryBorder },
    requestPhoto: { width: 48, height: 48, borderRadius: 16 }, requestTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '900' }, requestMeta: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 },
    roundSecondary: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface }, roundPrimary: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary },
    row: { minHeight: 86, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }, avatar: { width: 58, height: 58, borderRadius: 20, backgroundColor: theme.colors.surfaceAlt }, body: { flex: 1, gap: 2 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, name: { flex: 1, color: theme.colors.text, fontSize: 16, fontWeight: '900' }, time: { color: theme.colors.textMuted, fontSize: 11 }, pet: { color: theme.colors.primary, fontSize: 11, fontWeight: '900' }, message: { color: theme.colors.textSecondary, fontSize: 13 },
    unread: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary }, divider: { height: StyleSheet.hairlineWidth, marginLeft: 70, backgroundColor: theme.colors.border }, empty: { paddingVertical: 44, alignItems: 'center', gap: 10 }, emptyTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '900' },
  });
}
