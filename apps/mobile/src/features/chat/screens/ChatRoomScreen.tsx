import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import { useMemo, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useToast } from '../../../shared/components/Toast';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { ChatMessage } from '../../../core/types/social.types';
import type { MessagesStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<MessagesStackParamList, 'ChatRoom'>;

export function ChatRoomScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const { conversations, messages, sendMessage, editMessage, deleteMessage, appointments, blockedOwners } = useAppData();
  const toast = useToast();
  const conversation = conversations.find((item) => item.id === route.params.conversationId);
  const data = messages[route.params.conversationId] ?? [];
  const [draft, setDraft] = useState('');
  /** Mensaje sobre el que se abrió el menú del long press. */
  const [menuFor, setMenuFor] = useState<ChatMessage | null>(null);
  /** Mensaje que se está citando al responder. */
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  /** Mensaje que se está editando; el campo pasa a mostrar su texto. */
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const activeAppointment = appointments.find((item) => item.conversationId === route.params.conversationId && ['scheduled', 'in_progress'].includes(item.status));

  if (!conversation) return (
    <View style={[styles.center, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Conversación no disponible</Text>
      <Pressable accessibilityRole="button" onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.heading} />
      </Pressable>
    </View>
  );
  /** A quien esta bloqueado no se le escribe: el campo queda inhabilitado. */
  const blocked = blockedOwners.includes(conversation.ownerName);
  const scrollToEnd = () => setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);

  /** Enviar, o guardar la edición si se está editando. */
  const submit = () => {
    if (blocked || !draft.trim()) return;
    if (editing) {
      editMessage(conversation.id, editing.id, draft);
      setEditing(null);
      toast({ title: 'Mensaje editado' });
    } else {
      sendMessage(conversation.id, draft, replyTo?.id);
      setReplyTo(null);
      scrollToEnd();
    }
    setDraft('');
  };

  const startReply = (message: ChatMessage) => {
    setEditing(null);
    setReplyTo(message);
    setMenuFor(null);
  };

  const startEdit = (message: ChatMessage) => {
    setReplyTo(null);
    setEditing(message);
    setDraft(message.body);
    setMenuFor(null);
  };

  const copyMessage = async (message: ChatMessage) => {
    await Clipboard.setStringAsync(message.body);
    setMenuFor(null);
    toast({ title: 'Texto copiado' });
  };

  const removeMessage = (message: ChatMessage) => {
    deleteMessage(conversation.id, message.id);
    setMenuFor(null);
    // Si se estaba respondiendo o editando justo ese, se cancela.
    if (replyTo?.id === message.id) setReplyTo(null);
    if (editing?.id === message.id) { setEditing(null); setDraft(''); }
    toast({ title: 'Mensaje borrado' });
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      /* El campo tiene que quedar sobre el teclado para poder leer lo que se
         escribe. El desplazamiento es el alto de la barra de pestañas, que
         es lo unico que queda debajo; antes era un 90 fijo que no coincidia
         con ninguna medida real y dejaba el campo tapado. */
      keyboardVerticalOffset={60 + insets.bottom}>
      {/* Encabezado unico: flecha, foto, nombre, mascota y escudo en una sola
          barra, igual que en la web. */}
      <View style={[styles.contact, { paddingTop: Math.max(insets.top, 8) + 6 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.heading} />
        </Pressable>
        <Image source={{ uri: conversation.avatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{conversation.ownerName}</Text>
          <Text style={styles.meta} numberOfLines={1}>{conversation.petName} · conexión aceptada</Text>
        </View>
        <Ionicons name="shield-checkmark" size={22} color={theme.colors.success} />
      </View>
      <View style={styles.safety}><Ionicons name="shield-outline" size={18} color={theme.colors.primary} /><Text style={styles.safetyText}>Mantené la conversación en Tindog y coordiná el primer encuentro en un lugar público.</Text></View>
      {activeAppointment ? <Pressable accessibilityRole="button" onPress={() => navigation.navigate('SafeLocations', { appointmentId: activeAppointment.id })} style={styles.appointmentBanner}><Ionicons name="calendar" size={19} color={theme.colors.onPrimary} /><Text style={styles.appointmentText} numberOfLines={1}>{new Date(activeAppointment.startAt).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {activeAppointment.location.name}</Text><Ionicons name="chevron-forward" size={18} color={theme.colors.onPrimary} /></Pressable> : null}
      <FlatList ref={listRef} data={data} keyExtractor={(item) => item.id} renderItem={({ item }) => (
          <MessageBubble
            item={item}
            quoted={item.replyTo ? data.find((m) => m.id === item.replyTo) : undefined}
            theme={theme}
            styles={styles}
            onLongPress={setMenuFor}
            onReply={startReply}
          />
        )} contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false} onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })} />
      {/* Sin insets.bottom: la barra de pestanas ya reserva el area segura y
          sumarla aca dejaba un hueco entre el campo y la barra. */}
      {/* Lo que se está respondiendo o editando, arriba del campo. */}
      {replyTo || editing ? (
        <View style={styles.contextBar}>
          <View style={styles.contextAccent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.contextTitle}>
              {editing ? 'Editando mensaje' : `Respondiendo a ${replyTo?.sender === 'me' ? 'vos' : conversation.ownerName}`}
            </Text>
            <Text style={styles.contextBody} numberOfLines={1}>
              {(editing ?? replyTo)?.body}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancelar"
            onPress={() => { setReplyTo(null); setEditing(null); setDraft(''); }}
            style={styles.contextClose}
          >
            <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.composerArea}>
        <Pressable accessibilityRole="button" accessibilityLabel="Agendar encuentro" onPress={() => navigation.navigate('SafeLocations', { conversationId: conversation.id })} style={styles.calendar}><Ionicons name="calendar-outline" size={22} color={theme.colors.primary} /></Pressable>
        <View style={[styles.composer, blocked && styles.composerBlocked]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            editable={!blocked}
            placeholder={blocked ? 'Bloqueaste a esta persona' : editing ? 'Editá tu mensaje…' : 'Escribí un mensaje…'}
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
            multiline
            maxLength={1000}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Enviar mensaje" disabled={blocked || !draft.trim()} onPress={submit} style={[styles.send, (blocked || !draft.trim()) && { opacity: 0.4 }]}>
            <Ionicons name={editing ? 'checkmark' : 'send'} size={19} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </View>
      {/* Menú del long press. Sólo los mensajes propios se editan o borran:
          los ajenos se pueden responder y copiar. */}
      <Modal visible={Boolean(menuFor)} transparent animationType="fade" onRequestClose={() => setMenuFor(null)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setMenuFor(null)}>
          <View style={styles.menu}>
            <MenuOption icon="arrow-undo-outline" label="Responder" theme={theme} styles={styles} onPress={() => menuFor && startReply(menuFor)} />
            <MenuOption icon="copy-outline" label="Copiar texto del mensaje" theme={theme} styles={styles} onPress={() => menuFor && void copyMessage(menuFor)} />
            {menuFor?.sender === 'me' && !menuFor.deletedAt ? (
              <>
                <MenuOption icon="create-outline" label="Editar mensaje" theme={theme} styles={styles} onPress={() => menuFor && startEdit(menuFor)} />
                <MenuOption icon="trash-outline" label="Borrar mensaje" tone="danger" theme={theme} styles={styles} onPress={() => menuFor && removeMessage(menuFor)} />
              </>
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

/**
 * Una burbuja del chat.
 *
 * Arrastrarla hacia la derecha responde, como en WhatsApp: es el gesto que
 * la gente ya tiene aprendido. Se suelta a los 60 px y vuelve sola; el
 * umbral es bajo a propósito, porque el gesto compite con el scroll
 * vertical de la lista.
 */
function MessageBubble({ item, quoted, theme, styles, onLongPress, onReply }: {
  item: ChatMessage;
  quoted?: ChatMessage;
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
  onLongPress: (message: ChatMessage) => void;
  onReply: (message: ChatMessage) => void;
}) {
  const translateX = useSharedValue(0);

  if (item.sender === 'system') {
    return (
      <View style={styles.systemBubble}>
        <Text style={styles.systemText}>{item.body}</Text>
      </View>
    );
  }

  const mine = item.sender === 'me';
  const deleted = Boolean(item.deletedAt);

  const pan = Gesture.Pan()
    // Sólo horizontal: si no, cualquier scroll de la lista dispara el gesto.
    .activeOffsetX([-15, 15])
    .failOffsetY([-12, 12])
    .onUpdate((event) => {
      // Sólo hacia la derecha, y con tope: el arrastre indica la intención,
      // no mueve la burbuja de lugar.
      translateX.value = Math.max(0, Math.min(event.translationX, 80));
    })
    .onEnd(() => {
      if (translateX.value > 60) runOnJS(onReply)(item);
      translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
    });

  const animated = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%' }, animated]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={deleted ? 'Mensaje borrado' : item.body}
          onLongPress={() => onLongPress(item)}
          delayLongPress={350}
          style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}
        >
          {quoted ? (
            <View style={[styles.quote, mine ? styles.quoteMine : styles.quoteTheirs]}>
              <Text style={[styles.quoteAuthor, mine && styles.quoteAuthorMine]} numberOfLines={1}>
                {quoted.sender === 'me' ? 'Vos' : 'Ellos'}
              </Text>
              <Text style={[styles.quoteBody, mine && styles.quoteBodyMine]} numberOfLines={2}>
                {quoted.deletedAt ? 'Borrado' : quoted.body}
              </Text>
            </View>
          ) : null}

          <Text style={[
            styles.bubbleText,
            mine && styles.bubbleTextMine,
            deleted && styles.bubbleTextDeleted,
          ]}>
            {deleted ? 'Borrado' : item.body}
          </Text>

          <Text style={[styles.bubbleTime, mine && styles.bubbleTimeMine]}>
            {item.editedAt && !deleted ? 'editado · ' : ''}
            {new Date(item.sentAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

/** Una fila del menú del long press. */
function MenuOption({ icon, label, tone, theme, styles, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  tone?: 'danger';
  theme: AppTheme;
  styles: ReturnType<typeof createStyles>;
  onPress: () => void;
}) {
  const color = tone === 'danger' ? theme.colors.danger : theme.colors.text;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.menuOption}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.menuLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(theme: AppTheme) { return StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },

  systemBubble: { alignSelf: 'center', maxWidth: '90%', padding: 10, borderRadius: 14, backgroundColor: theme.colors.primaryFaded },
  systemText: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center' },

  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 19 },
  bubbleMine: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 6 },
  bubbleText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  bubbleTextMine: { color: theme.colors.onPrimary },
  // Un mensaje borrado conserva su lugar pero se lee como ausencia.
  bubbleTextDeleted: { fontStyle: 'italic', opacity: 0.6 },
  bubbleTime: { color: theme.colors.textMuted, fontSize: 9, marginTop: 4, textAlign: 'right' },
  bubbleTimeMine: { color: 'rgba(5,5,5,.6)' },

  quote: { borderLeftWidth: 3, paddingLeft: 8, paddingVertical: 4, marginBottom: 6, borderRadius: 4 },
  quoteMine: { borderLeftColor: 'rgba(5,5,5,.35)', backgroundColor: 'rgba(5,5,5,.08)' },
  quoteTheirs: { borderLeftColor: theme.colors.primary, backgroundColor: theme.colors.primaryFaded },
  quoteAuthor: { color: theme.colors.primary, fontSize: 11, fontWeight: '900' },
  quoteAuthorMine: { color: 'rgba(5,5,5,.75)' },
  quoteBody: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 1 },
  quoteBodyMine: { color: 'rgba(5,5,5,.6)' },

  contextBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: theme.colors.surfaceAlt, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.border },
  contextAccent: { width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: theme.colors.primary },
  contextTitle: { color: theme.colors.primary, fontSize: 12, fontWeight: '900' },
  contextBody: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 1 },
  contextClose: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  menuBackdrop: { flex: 1, justifyContent: 'center', paddingHorizontal: 34, backgroundColor: theme.colors.overlay },
  menu: { borderRadius: 20, overflow: 'hidden', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  menuOption: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  menuLabel: { fontSize: 14, fontWeight: '700' },
 center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, title: { color: theme.colors.text, fontSize: 20, fontWeight: '900' },
  contact: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 10, paddingBottom: 8, backgroundColor: theme.colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }, back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }, avatar: { width: 44, height: 44, borderRadius: 15 }, name: { color: theme.colors.text, fontSize: 16, fontWeight: '900' }, meta: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: theme.colors.primaryFaded }, safetyText: { flex: 1, color: theme.colors.textSecondary, fontSize: 10, lineHeight: 14 },
  appointmentBanner: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, backgroundColor: theme.colors.primary }, appointmentText: { flex: 1, color: theme.colors.onPrimary, fontSize: 11, fontWeight: '900' },
  messages: { flexGrow: 1, justifyContent: 'flex-end', gap: 9, padding: 14 }, composerArea: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 10, paddingTop: 8, paddingBottom: 8, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border }, calendar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryFaded },
  composerBlocked: { opacity: 0.55 },
  composer: { flex: 1, minHeight: 46, maxHeight: 110, flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingLeft: 14, paddingRight: 5, paddingVertical: 5, borderRadius: 24, backgroundColor: theme.colors.backgroundAlt, borderWidth: 1, borderColor: theme.colors.border }, input: { flex: 1, minHeight: 34, color: theme.colors.text, fontSize: 14, paddingTop: 4, paddingBottom: 8, textAlignVertical: 'center' }, send: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary },
}); }
