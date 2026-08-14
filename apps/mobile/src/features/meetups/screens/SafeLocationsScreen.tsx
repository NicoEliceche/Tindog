import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { requestForegroundCoordinates } from '../../../core/data/services/foregroundLocation';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { Coordinates, SafeLocation } from '../../../core/types/appointment.types';
import type { RootStackParamList } from '../../../navigation/types';
import { SafeMap } from '../components/SafeMap';

type Props = NativeStackScreenProps<RootStackParamList, 'SafeLocations'>;

export function SafeLocationsScreen({ route, navigation }: Props) {
  const theme = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  const { locations, appointments, scheduleAppointment } = useAppData();
  const appointment = appointments.find((item) => item.id === route.params?.appointmentId);
  const [selectedId, setSelectedId] = useState(appointment?.location.id ?? locations[0]?.id ?? '');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const mapsConfigured = Boolean(Constants.expoConfig?.extra?.googleMapsConfigured);
  const selected = locations.find((item) => item.id === selectedId) ?? locations[0];

  const locate = async () => { setLocating(true); const result = await requestForegroundCoordinates().catch(() => null); setLocating(false); if (!result) Alert.alert('Ubicación no disponible', 'Podés explorar todos los puntos moviendo el mapa o desde la lista.'); else setCoordinates(result); };
  const confirm = () => {
    if (!route.params?.conversationId || !route.params.startAt) return;
    const created = scheduleAppointment(route.params.conversationId, selectedId, route.params.startAt);
    if (created) { Alert.alert('Cita agendada', 'El encuentro quedó guardado y visible en Citas.', [{ text: 'Ver citas', onPress: () => navigation.navigate('Main', { screen: 'Appointments' }) }]); }
  };

  return <View style={styles.screen}>
    <View style={styles.mapWrap}>
      {mapsConfigured ? <SafeMap locations={locations} selectedId={selectedId} userCoordinates={coordinates} onSelect={setSelectedId} /> : <View style={styles.mapFallback}><Ionicons name="map" size={40} color={theme.colors.primary} /><Text style={styles.mapTitle}>Mapa listo para configurar</Text><Text style={styles.mapText}>La lista funciona ahora. Para ver Google Maps agregá las claves nativas restringidas y generá un nuevo development build.</Text></View>}
      <Pressable accessibilityRole="button" accessibilityLabel="Usar mi ubicación" disabled={locating} onPress={locate} style={styles.locate}><Ionicons name={locating ? 'hourglass-outline' : 'locate'} size={20} color={theme.colors.primary} /></Pressable>
    </View>
    <View style={styles.header}><View style={{ flex: 1 }}><Text style={styles.title}>Puntos públicos recomendados</Text><Text style={styles.disclaimer}>La recomendación reduce riesgos, pero no garantiza seguridad.</Text></View></View>
    <FlatList data={locations} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false} renderItem={({ item }) => <LocationCard item={item} selected={item.id === selectedId} theme={theme} onSelect={() => setSelectedId(item.id)} onReviews={() => navigation.navigate('LocationReviews', { locationId: item.id, appointmentId: appointment?.id })} />} ItemSeparatorComponent={() => <View style={{ height: 9 }} />} />
    {route.params?.conversationId ? <View style={styles.footer}><View style={{ flex: 1 }}><Text style={styles.selectedLabel}>PUNTO ELEGIDO</Text><Text style={styles.selectedName} numberOfLines={1}>{selected?.name}</Text></View><Pressable accessibilityRole="button" disabled={!selected} onPress={confirm} style={styles.confirm}><Text style={styles.confirmText}>Confirmar cita</Text></Pressable></View> : null}
  </View>;
}

function LocationCard({ item, selected, theme, onSelect, onReviews }: { item: SafeLocation; selected: boolean; theme: AppTheme; onSelect: () => void; onReviews: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onSelect} style={{ padding: 13, gap: 8, borderRadius: 21, backgroundColor: selected ? theme.colors.primaryFaded : theme.colors.surface, borderWidth: selected ? 2 : 1, borderColor: selected ? theme.colors.primary : theme.colors.border }}>
    <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}><View style={{ width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt }}><Ionicons name="location" size={20} color={selected ? theme.colors.onPrimary : theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '900' }}>{item.name}</Text><Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>{item.address} · {item.distanceKm} km</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Ver reseñas de ${item.name}`} onPress={onReviews}><Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '900' }}>★ {item.rating}</Text><Text style={{ color: theme.colors.textMuted, fontSize: 9, textAlign: 'right' }}>{item.reviewCount}</Text></Pressable></View>
    <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>{item.tags.map((tag) => <View key={tag} style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 9, backgroundColor: theme.colors.surfaceAlt }}><Text style={{ color: theme.colors.textSecondary, fontSize: 9, fontWeight: '800' }}>{tag}</Text></View>)}</View>
  </Pressable>;
}

function createStyles(theme: AppTheme) { return StyleSheet.create({ screen: { flex: 1, backgroundColor: theme.colors.background }, mapWrap: { height: '30%', minHeight: 176, position: 'relative', overflow: 'hidden', backgroundColor: theme.colors.surfaceAlt }, mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 35 }, mapTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '900' }, mapText: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center' }, locate: { position: 'absolute', right: 13, bottom: 13, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, elevation: 5 }, header: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14 }, title: { color: theme.colors.text, fontSize: 19, fontWeight: '900' }, disclaimer: { color: theme.colors.warning, fontSize: 10, marginTop: 3 }, list: { padding: 14, paddingBottom: 18 }, footer: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.border }, selectedLabel: { color: theme.colors.primary, fontSize: 9, fontWeight: '900' }, selectedName: { color: theme.colors.text, fontSize: 12, fontWeight: '800', marginTop: 2 }, confirm: { minHeight: 46, paddingHorizontal: 16, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }, confirmText: { color: theme.colors.onPrimary, fontSize: 13, fontWeight: '900' } }); }
