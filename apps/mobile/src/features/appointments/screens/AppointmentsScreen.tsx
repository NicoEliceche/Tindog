import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import { appointmentStatusLabels, getEffectiveAppointmentStatus, type Appointment, type AppointmentStatus } from '../../../core/types/appointment.types';
import type { RootStackParamList } from '../../../navigation/types';

type Filter = 'upcoming' | 'history';

export function AppointmentsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { appointments, updateAppointmentStatus } = useAppData();
  const [filter, setFilter] = useState<Filter>('upcoming');
  const filtered = appointments.filter((item) => filter === 'upcoming' ? ['scheduled', 'in_progress'].includes(getEffectiveAppointmentStatus(item)) : ['completed', 'cancelled'].includes(item.status));

  const cancel = (item: Appointment) => Alert.alert('Cancelar cita', 'La cita quedará visible en el historial como cancelada.', [{ text: 'Volver', style: 'cancel' }, { text: 'Cancelar cita', style: 'destructive', onPress: () => updateAppointmentStatus(item.id, 'cancelled') }]);

  return <View style={styles.screen}><FlatList
    data={filtered}
    keyExtractor={(item) => item.id}
    contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 16, 24) }]}
    showsVerticalScrollIndicator={false}
    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
    ListHeaderComponent={<View style={{ marginBottom: 14 }}><Text style={styles.title}>Citas</Text><Text style={styles.subtitle}>Encuentros agendados, en curso y anteriores.</Text><View style={styles.segment}><Segment label="Próximas" active={filter === 'upcoming'} theme={theme} onPress={() => setFilter('upcoming')} /><Segment label="Historial" active={filter === 'history'} theme={theme} onPress={() => setFilter('history')} /></View></View>}
    renderItem={({ item }) => {
      const status = getEffectiveAppointmentStatus(item);
      return <View style={styles.card}>
        <View style={styles.cardTop}><View style={[styles.iconBox, { backgroundColor: getStatusColor(theme, status).background }]}><Ionicons name={status === 'cancelled' ? 'close' : status === 'completed' ? 'checkmark' : 'calendar'} size={23} color={getStatusColor(theme, status).foreground} /></View><View style={{ flex: 1 }}><Text style={styles.petNames}>{item.petNames.join(' + ')}</Text><Text style={styles.owner}>{item.ownerName}</Text></View><StatusPill status={status} theme={theme} /></View>
        <View style={styles.details}><Detail icon="time-outline" text={new Date(item.startAt).toLocaleString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} theme={theme} /><Detail icon="location-outline" text={item.location.name} theme={theme} /></View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('SafeLocations', { appointmentId: item.id })} style={styles.secondaryButton}><Text style={styles.secondaryText}>Ver punto</Text></Pressable>
          {status === 'scheduled' ? <Pressable accessibilityRole="button" onPress={() => cancel(item)} style={styles.ghostDanger}><Text style={styles.dangerText}>Cancelar</Text></Pressable> : null}
          {status === 'in_progress' ? <Pressable accessibilityRole="button" onPress={() => updateAppointmentStatus(item.id, 'completed')} style={styles.primaryButton}><Text style={styles.primaryText}>Finalizar</Text></Pressable> : null}
          {status === 'completed' && !item.reviewSubmitted ? <Pressable accessibilityRole="button" onPress={() => navigation.navigate('LocationReviews', { locationId: item.location.id, appointmentId: item.id })} style={styles.primaryButton}><Text style={styles.primaryText}>Dejar reseña</Text></Pressable> : null}
        </View>
      </View>;
    }}
    ListEmptyComponent={<View style={styles.empty}><Ionicons name="calendar-outline" size={42} color={theme.colors.primary} /><Text style={styles.emptyTitle}>{filter === 'upcoming' ? 'No tenés citas próximas' : 'Todavía no hay historial'}</Text><Text style={styles.emptyText}>Las citas se coordinan desde una conversación aceptada.</Text></View>}
  /></View>;
}

function Segment({ label, active, theme, onPress }: { label: string; active: boolean; theme: AppTheme; onPress: () => void }) { return <Pressable onPress={onPress} style={{ flex: 1, minHeight: 40, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? theme.colors.primary : 'transparent' }}><Text style={{ color: active ? theme.colors.onPrimary : theme.colors.textSecondary, fontWeight: '900', fontSize: 13 }}>{label}</Text></Pressable>; }
function Detail({ icon, text, theme }: { icon: keyof typeof Ionicons.glyphMap; text: string; theme: AppTheme }) { return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Ionicons name={icon} size={17} color={theme.colors.primary} /><Text numberOfLines={1} style={{ flex: 1, color: theme.colors.textSecondary, fontSize: 12 }}>{text}</Text></View>; }
function getStatusColor(theme: AppTheme, status: AppointmentStatus) { if (status === 'completed') return { background: theme.colors.successFaded, foreground: theme.colors.success }; if (status === 'cancelled') return { background: theme.colors.dangerFaded, foreground: theme.colors.danger }; if (status === 'in_progress') return { background: theme.colors.warningFaded, foreground: theme.colors.warning }; return { background: theme.colors.primaryFaded, foreground: theme.colors.primary }; }
function StatusPill({ status, theme }: { status: AppointmentStatus; theme: AppTheme }) { const colors = getStatusColor(theme, status); return <View style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, backgroundColor: colors.background }}><Text style={{ color: colors.foreground, fontSize: 10, fontWeight: '900' }}>{appointmentStatusLabels[status]}</Text></View>; }
function createStyles(theme: AppTheme) { return StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' }, content: { paddingHorizontal: 16, paddingBottom: 28 }, title: { color: theme.colors.text, fontSize: 32, fontWeight: '900' }, subtitle: { color: theme.colors.textSecondary, fontSize: 14, marginTop: 5 }, segment: { minHeight: 46, flexDirection: 'row', gap: 4, marginTop: 18, padding: 3, borderRadius: 22, backgroundColor: theme.colors.surface },
  card: { padding: 15, gap: 13, borderRadius: 24, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, iconBox: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, petNames: { color: theme.colors.text, fontSize: 16, fontWeight: '900' }, owner: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }, details: { gap: 7, padding: 11, borderRadius: 15, backgroundColor: theme.colors.backgroundAlt }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }, secondaryButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.borderStrong }, secondaryText: { color: theme.colors.primary, fontSize: 12, fontWeight: '900' }, ghostDanger: { minHeight: 40, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' }, dangerText: { color: theme.colors.danger, fontSize: 12, fontWeight: '900' }, primaryButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }, primaryText: { color: theme.colors.onPrimary, fontSize: 12, fontWeight: '900' }, empty: { alignItems: 'center', paddingVertical: 55, gap: 9 }, emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '900' }, emptyText: { color: theme.colors.textSecondary, textAlign: 'center', fontSize: 13 },
}); }
