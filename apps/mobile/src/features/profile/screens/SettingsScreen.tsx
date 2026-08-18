import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { requestPushPermission } from '../../../core/data/services/pushNotifications';
import { useAppPreferences } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme, ThemeMode } from '../../../core/theme/tokens';
import type { AppPreferences } from '../../../core/types/preferences.types';

export function SettingsScreen() {
  const { theme, preferences, updatePreference } = useAppPreferences();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();

  const togglePush = async (key: 'pushMessages' | 'pushRequests' | 'pushAppointments', value: boolean) => {
    if (!value) { updatePreference(key, false); return; }
    const granted = await requestPushPermission().catch(() => false);
    if (granted) updatePreference(key, true);
    else Alert.alert('Notificaciones desactivadas', 'Podés habilitarlas más adelante desde los ajustes del teléfono.');
  };

  return <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]} showsVerticalScrollIndicator={false}>
    <Text style={styles.intro}>Controlá qué mostrás, cuándo recibís avisos y cómo querés proteger tus encuentros.</Text>
    <Section title="Apariencia" theme={theme}>
      <View style={styles.appearance}>{(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => <Pressable key={mode} accessibilityRole="button" onPress={() => updatePreference('themeMode', mode)} style={[styles.appearanceOption, preferences.themeMode === mode && styles.appearanceActive]}><Ionicons name={mode === 'dark' ? 'moon' : mode === 'light' ? 'sunny' : 'phone-portrait'} size={18} color={preferences.themeMode === mode ? theme.colors.onPrimary : theme.colors.textSecondary} /><Text style={[styles.appearanceText, preferences.themeMode === mode && { color: theme.colors.onPrimary }]}>{mode === 'dark' ? 'Oscuro' : mode === 'light' ? 'Claro' : 'Sistema'}</Text></Pressable>)}</View>
    </Section>
    <Section title="Descubrimiento" theme={theme}>
      <ToggleRow icon="paw-outline" title="Mostrar mi perfil" detail="Al pausarlo conservás chats y citas" value={preferences.discoveryEnabled} theme={theme} onChange={(value) => updatePreference('discoveryEnabled', value)} />
      <ToggleRow icon="navigate-outline" title="Mostrar distancia aproximada" detail="Nunca mostramos tu ubicación exacta" value={preferences.showDistance} theme={theme} onChange={(value) => updatePreference('showDistance', value)} />
      <View style={styles.distance}><Text style={styles.rowTitle}>Distancia máxima</Text><View style={styles.distanceOptions}>{[10,25,50].map((distance) => <Pressable key={distance} onPress={() => updatePreference('maxDistanceKm', distance)} style={[styles.distanceChip, preferences.maxDistanceKm === distance && styles.distanceChipActive]}><Text style={[styles.distanceText, preferences.maxDistanceKm === distance && { color: theme.colors.onPrimary }]}>{distance} km</Text></Pressable>)}</View></View>
    </Section>
    <Section title="Privacidad" theme={theme}>
      <ToggleRow icon="radio-outline" title="Estado en línea" detail="Está oculto de forma predeterminada" value={preferences.showOnlineStatus} theme={theme} onChange={(value) => updatePreference('showOnlineStatus', value)} />
      <ToggleRow icon="checkmark-done-outline" title="Confirmaciones de lectura" detail="También dejarás de ver las de otros" value={preferences.readReceipts} theme={theme} onChange={(value) => updatePreference('readReceipts', value)} />
      <ActionRow icon="medkit-outline" title="Visibilidad de salud" detail={preferences.healthVisibility === 'connections' ? 'Sólo conexiones aceptadas' : 'Sólo vos'} theme={theme} onPress={() => updatePreference('healthVisibility', preferences.healthVisibility === 'connections' ? 'private' : 'connections')} />
      <ActionRow icon="ban-outline" title="Personas bloqueadas" detail="Revisá y administrá bloqueos" theme={theme} onPress={() => Alert.alert('Personas bloqueadas', 'No tenés personas bloqueadas.')} />
    </Section>
    <Section title="Notificaciones" theme={theme}>
      <ToggleRow icon="chatbubble-outline" title="Mensajes" detail="Nuevos mensajes de chats aceptados" value={preferences.pushMessages} theme={theme} onChange={(value) => togglePush('pushMessages', value)} />
      <ToggleRow icon="heart-outline" title="Solicitudes" detail="Conexiones recibidas y aceptadas" value={preferences.pushRequests} theme={theme} onChange={(value) => togglePush('pushRequests', value)} />
      <ToggleRow icon="calendar-outline" title="Citas" detail="Recordatorios y cambios de estado" value={preferences.pushAppointments} theme={theme} onChange={(value) => togglePush('pushAppointments', value)} />
      <ToggleRow icon="megaphone-outline" title="Alertas de mascotas perdidas" detail="Sólo en tu zona general" value={preferences.lostPetAlerts} theme={theme} onChange={(value) => updatePreference('lostPetAlerts', value)} />
    </Section>
    <Section title="Seguridad de citas" theme={theme}>
      <ToggleRow icon="shield-checkmark-outline" title="Check-in de seguridad" detail="Te preguntamos si el encuentro comenzó y terminó bien" value={preferences.safetyCheckIns} theme={theme} onChange={(value) => updatePreference('safetyCheckIns', value)} />
      <ActionRow icon="people-outline" title="Contacto de confianza" detail={preferences.trustedContactName || 'Configurá a quién compartir una cita'} theme={theme} onPress={() => Alert.alert('Contacto de confianza', 'Se conectará con la agenda del teléfono sin guardar contactos completos en nuestros servidores.')} />
      <ActionRow icon="warning-outline" title="Centro de seguridad" detail="Reportes, emergencias y consejos" theme={theme} onPress={() => Alert.alert('Si hay peligro inmediato', 'Contactá a emergencias. Tindog permite bloquear y reportar desde cada conversación.')} />
    </Section>
    <Section title="Tus datos" theme={theme}>
      <ActionRow icon="download-outline" title="Descargar mis datos" detail="Solicitá una copia portable" theme={theme} onPress={() => Alert.alert('Solicitud registrada', 'Te avisaremos cuando el archivo esté listo.')} />
      <ActionRow icon="trash-outline" title="Eliminar cuenta" detail="Requiere reautenticación y confirmación" danger theme={theme} onPress={() => Alert.alert('Eliminar cuenta', 'Esta acción se implementará con reautenticación obligatoria y un período de recuperación.')} />
    </Section>
  </ScrollView>;
}

function Section({ title, theme, children }: { title: string; theme: AppTheme; children: React.ReactNode }) { return <View style={{ gap: 8 }}><Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '900', marginTop: 6 }}>{title}</Text><View style={{ overflow: 'hidden', borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}>{children}</View></View>; }
function ToggleRow({ icon, title, detail, value, theme, onChange }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; value: boolean; theme: AppTheme; onChange: (value: boolean) => void }) { return <View style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }}><Ionicons name={icon} size={21} color={theme.colors.primary} /><View style={{ flex: 1 }}><Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '900' }}>{title}</Text><Text style={{ color: theme.colors.textMuted, fontSize: 10, lineHeight: 14, marginTop: 2 }}>{detail}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ false: theme.colors.surfaceAlt, true: theme.colors.primary }} thumbColor={value ? theme.colors.onPrimary : theme.colors.textMuted} /></View>; }
function ActionRow({ icon, title, detail, danger, theme, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; detail: string; danger?: boolean; theme: AppTheme; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 13, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border, opacity: pressed ? .65 : 1 })}><Ionicons name={icon} size={21} color={danger ? theme.colors.danger : theme.colors.primary} /><View style={{ flex: 1 }}><Text style={{ color: danger ? theme.colors.danger : theme.colors.text, fontSize: 13, fontWeight: '900' }}>{title}</Text><Text style={{ color: theme.colors.textMuted, fontSize: 10, marginTop: 2 }}>{detail}</Text></View><Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} /></Pressable>; }
function createStyles(theme: AppTheme) { return StyleSheet.create({ screen: { flex: 1, backgroundColor: 'transparent' }, content: { padding: 16, paddingBottom: 36, gap: 14 }, intro: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19 }, appearance: { flexDirection: 'row', gap: 5, padding: 6 }, appearanceOption: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 17 }, appearanceActive: { backgroundColor: theme.colors.primary }, appearanceText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '900' }, distance: { padding: 13, gap: 10 }, rowTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '900' }, distanceOptions: { flexDirection: 'row', gap: 8 }, distanceChip: { flex: 1, minHeight: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surfaceAlt }, distanceChipActive: { backgroundColor: theme.colors.primary }, distanceText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '900' } }); }
