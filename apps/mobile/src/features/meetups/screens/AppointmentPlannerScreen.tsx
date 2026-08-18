import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AppointmentPlanner'>;

function buildSlots() {
  const now = new Date();
  return [1, 2, 3].map((days, index) => { const date = new Date(now); date.setDate(now.getDate() + days); date.setHours(index === 1 ? 11 : 18, 0, 0, 0); return date; });
}

export function AppointmentPlannerScreen({ route, navigation }: Props) {
  const theme = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { conversations } = useAppData(); const conversation = conversations.find((item) => item.id === route.params.conversationId);
  const slots = useMemo(buildSlots, []); const [selected, setSelected] = useState(slots[0].toISOString());
  return <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
    <View><Text style={styles.eyebrow}>ENCUENTRO CON {conversation?.ownerName.toUpperCase()}</Text><Text style={styles.title}>{conversation?.petName} + Firulais</Text><Text style={styles.subtitle}>Elegí un horario y después un punto público recomendado.</Text></View>
    <View style={styles.card}><Text style={styles.section}>Fecha y hora</Text>{slots.map((slot) => { const iso = slot.toISOString(); const active = selected === iso; return <Pressable key={iso} onPress={() => setSelected(iso)} style={[styles.slot, active && styles.slotActive]}><View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View><View style={{ flex: 1 }}><Text style={[styles.slotTitle, active && { color: theme.colors.onPrimary }]}>{slot.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text><Text style={[styles.slotTime, active && { color: 'rgba(5,5,5,.7)' }]}>{slot.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} · 60 minutos</Text></View></Pressable>; })}</View>
    <View style={styles.safety}><Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={styles.safetyTitle}>Cita con protección Tindog</Text><Text style={styles.safetyText}>Podrás compartir lugar y horario con un contacto de confianza. No compartimos tu ubicación continua.</Text></View></View>
    <Pressable accessibilityRole="button" onPress={() => navigation.navigate('SafeLocations', { conversationId: route.params.conversationId, startAt: selected })} style={styles.primary}><Text style={styles.primaryText}>Elegir punto de encuentro</Text><Ionicons name="arrow-forward" size={20} color={theme.colors.onPrimary} /></Pressable>
  </View>;
}

function createStyles(theme: AppTheme) { return StyleSheet.create({ screen: { flex: 1, padding: 18, gap: 20, backgroundColor: 'transparent' }, eyebrow: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: .8 }, title: { color: theme.colors.heading, fontSize: 28, fontWeight: '900', marginTop: 4 }, subtitle: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 6 }, card: { gap: 10 }, section: { color: theme.colors.text, fontSize: 16, fontWeight: '900', marginBottom: 2 }, slot: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: 19, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }, slotActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.textMuted, alignItems: 'center', justifyContent: 'center' }, radioActive: { borderColor: theme.colors.onPrimary }, radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: theme.colors.onPrimary }, slotTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '900', textTransform: 'capitalize' }, slotTime: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 }, safety: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 20, backgroundColor: theme.colors.primaryFaded }, safetyTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '900' }, safetyText: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 3 }, primary: { marginTop: 'auto', minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 27, backgroundColor: theme.colors.primary }, primaryText: { color: theme.colors.onPrimary, fontSize: 15, fontWeight: '900' } }); }
