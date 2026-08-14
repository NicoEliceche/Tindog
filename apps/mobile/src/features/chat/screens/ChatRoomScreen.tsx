import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { ChatMessage } from '../../../core/types/social.types';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

export function ChatRoomScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const { conversations, messages, sendMessage, appointments } = useAppData();
  const conversation = conversations.find((item) => item.id === route.params.conversationId);
  const data = messages[route.params.conversationId] ?? [];
  const [draft, setDraft] = useState('');
  const activeAppointment = appointments.find((item) => item.conversationId === route.params.conversationId && ['scheduled', 'in_progress'].includes(item.status));

  if (!conversation) return <View style={styles.center}><Text style={styles.title}>Conversación no disponible</Text></View>;
  const submit = () => { sendMessage(conversation.id, draft); setDraft(''); setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50); };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <View style={styles.contact}><Image source={{ uri: conversation.avatar }} style={styles.avatar} /><View style={{ flex: 1 }}><Text style={styles.name}>{conversation.ownerName}</Text><Text style={styles.meta}>{conversation.petName} · conexión aceptada</Text></View><Ionicons name="shield-checkmark" size={22} color={theme.colors.success} /></View>
      <View style={styles.safety}><Ionicons name="shield-outline" size={18} color={theme.colors.primary} /><Text style={styles.safetyText}>Mantené la conversación en Tindog y coordiná el primer encuentro en un lugar público.</Text></View>
      {activeAppointment ? <Pressable accessibilityRole="button" onPress={() => navigation.navigate('SafeLocations', { appointmentId: activeAppointment.id })} style={styles.appointmentBanner}><Ionicons name="calendar" size={19} color={theme.colors.onPrimary} /><Text style={styles.appointmentText} numberOfLines={1}>{new Date(activeAppointment.startAt).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {activeAppointment.location.name}</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.onPrimary} /></Pressable> : null}
      <FlatList ref={listRef} data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => <MessageBubble item={item} theme={theme} />} contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false} onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })} />
      <View style={[styles.composerArea, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Agendar encuentro" onPress={() => navigation.navigate('AppointmentPlanner', { conversationId: conversation.id })} style={styles.calendar}><Ionicons name="calendar-outline" size={22} color={theme.colors.primary} /></Pressable>
        <View style={styles.composer}><TextInput value={draft} onChangeText={setDraft} placeholder="Escribí un mensaje…" placeholderTextColor={theme.colors.textMuted} style={styles.input} multiline maxLength={1000} /><Pressable accessibilityRole="button" accessibilityLabel="Enviar mensaje" disabled={!draft.trim()} onPress={submit} style={[styles.send, !draft.trim() && { opacity: 0.4 }]}><Ionicons name="send" size={19} color={theme.colors.onPrimary} /></Pressable></View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ item, theme }: { item: ChatMessage; theme: AppTheme }) {
  if (item.sender === 'system') return <View style={{ alignSelf: 'center', maxWidth: '90%', padding: 10, borderRadius: 14, backgroundColor: theme.colors.primaryFaded }}><Text style={{ color: theme.colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center' }}>{item.body}</Text></View>;
  const mine = item.sender === 'me';
  return <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 19, backgroundColor: mine ? theme.colors.primary : theme.colors.surface, borderBottomRightRadius: mine ? 6 : 19, borderBottomLeftRadius: mine ? 19 : 6 }}><Text style={{ color: mine ? theme.colors.onPrimary : theme.colors.text, fontSize: 14, lineHeight: 20 }}>{item.body}</Text><Text style={{ color: mine ? 'rgba(5,5,5,.6)' : theme.colors.textMuted, fontSize: 9, marginTop: 4, textAlign: 'right' }}>{new Date(item.sentAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</Text></View>;
}

function createStyles(theme: AppTheme) { return StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, title: { color: theme.colors.text, fontSize: 20, fontWeight: '900' },
  contact: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }, avatar: { width: 44, height: 44, borderRadius: 15 }, name: { color: theme.colors.text, fontSize: 16, fontWeight: '900' }, meta: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: theme.colors.primaryFaded }, safetyText: { flex: 1, color: theme.colors.textSecondary, fontSize: 10, lineHeight: 14 },
  appointmentBanner: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, backgroundColor: theme.colors.primary }, appointmentText: { flex: 1, color: theme.colors.onPrimary, fontSize: 11, fontWeight: '900' },
  messages: { flexGrow: 1, justifyContent: 'flex-end', gap: 9, padding: 14 }, composerArea: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 10, paddingTop: 8, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border }, calendar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryFaded },
  composer: { flex: 1, minHeight: 46, maxHeight: 110, flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingLeft: 14, paddingRight: 5, paddingVertical: 5, borderRadius: 24, backgroundColor: theme.colors.backgroundAlt, borderWidth: 1, borderColor: theme.colors.border }, input: { flex: 1, minHeight: 34, color: theme.colors.text, fontSize: 14, paddingVertical: 6 }, send: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary },
}); }
