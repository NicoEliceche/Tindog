import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import { useToast } from '../../../shared/components/Toast';
import type { AppTheme } from '../../../core/theme/tokens';

const GUIDELINES = [
  'Elegí siempre un lugar público y concurrido; la app sugiere puntos seguros al agendar.',
  'Contale a alguien de confianza dónde vas a estar y a qué hora.',
  'Llevá la libreta sanitaria de tu perro y pedí ver la del otro.',
  'Si algo te incomoda, cortá el encuentro. No hace falta dar explicaciones.',
  'Mantené la conversación dentro de la app hasta que haya confianza.',
];

/**
 * Centro de seguridad.
 *
 * Tindog coordina encuentros presenciales entre personas que no se conocen,
 * así que necesita un lugar único donde bloquear a alguien, revisar a quién
 * bloqueaste y tener a mano las pautas del encuentro.
 */
export function SafetyScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { conversations, blockedOwners, blockOwner, unblockOwner } = useAppData();

  // Se puede bloquear a cualquiera con quien haya una conversación abierta.
  const blockable = conversations
    .map((chat) => ({ name: chat.ownerName, avatar: chat.avatar }))
    .filter((item) => !blockedOwners.includes(item.name));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.intro}>
        Controlá con quién podés cruzarte y repasá las pautas antes de cada encuentro.
      </Text>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Antes de un encuentro</Text>
        {GUIDELINES.map((line) => (
          <View key={line} style={styles.bulletRow}>
            <Ionicons name="shield-checkmark-outline" size={15} color={theme.colors.primary} />
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>BLOQUEADOS</Text>
      {blockedOwners.length > 0 ? blockedOwners.map((name) => (
        <View key={name} style={styles.card}>
          <View style={styles.iconThumb}>
            <Ionicons name="person-remove-outline" size={20} color={theme.colors.textMuted} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.detail}>No puede verte ni escribirte.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Desbloquear a ${name}`}
            onPress={() => { unblockOwner(name); toast({ title: 'Contacto desbloqueado', body: `${name} vuelve a poder escribirte.` }); }}
            style={styles.ghost}
          >
            <Text style={styles.ghostText}>Desbloquear</Text>
          </Pressable>
        </View>
      )) : (
        <View style={styles.empty}>
          <Ionicons name="shield-checkmark-outline" size={30} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>No bloqueaste a nadie.</Text>
        </View>
      )}

      <Text style={[styles.section, styles.sectionSpaced]}>TUS CONVERSACIONES</Text>
      {blockable.length > 0 ? blockable.map((item) => (
        <View key={item.name} style={styles.card}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.copy}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.detail}>Podés bloquearlo cuando quieras.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Bloquear a ${item.name}`}
            onPress={() => { blockOwner(item.name); toast({ title: 'Contacto bloqueado', body: `${item.name} ya no puede verte ni escribirte.`, tone: 'error' }); }}
            style={styles.danger}
          >
            <Text style={styles.dangerText}>Bloquear</Text>
          </Pressable>
        </View>
      )) : (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={30} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>No tenés conversaciones abiertas.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { padding: 16, paddingTop: 8 },
    intro: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 16 },
    notice: {
      gap: 9, padding: 14, borderRadius: 20, marginBottom: 22,
      backgroundColor: theme.colors.primaryFaded,
      borderWidth: 1, borderColor: theme.colors.primaryBorder,
    },
    noticeTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
    bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
    bulletText: { flex: 1, color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 },
    section: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 9 },
    sectionSpaced: { marginTop: 22 },
    card: {
      flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, marginBottom: 9,
      borderRadius: 20, backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    avatar: { width: 46, height: 46, borderRadius: 15, backgroundColor: theme.colors.surfaceAlt },
    iconThumb: {
      width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.surfaceAlt,
    },
    copy: { flex: 1, minWidth: 0 },
    name: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
    detail: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 },
    ghost: {
      minHeight: 38, paddingHorizontal: 14, justifyContent: 'center',
      borderRadius: 19, borderWidth: 1, borderColor: theme.colors.border,
    },
    ghostText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '900' },
    danger: {
      minHeight: 38, paddingHorizontal: 14, justifyContent: 'center',
      borderRadius: 19, backgroundColor: theme.colors.dangerFaded,
      borderWidth: 1, borderColor: theme.colors.dangerBorder,
    },
    dangerText: { color: theme.colors.danger, fontSize: 12, fontWeight: '900' },
    empty: {
      alignItems: 'center', gap: 8, padding: 26, borderRadius: 20,
      borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border,
    },
    emptyText: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  });
}
