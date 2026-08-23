import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../../shared/components/Toast';
import { requestForegroundCoordinates } from '../../../core/data/services/foregroundLocation';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { GoldHeading } from '../../../shared/components/GoldHeading';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { Coordinates, SafeLocation } from '../../../core/types/appointment.types';
import type {
  AppointmentsStackParamList, MessagesStackParamList, RootStackParamList,
} from '../../../navigation/types';
import { SafeMap } from '../components/SafeMap';

/**
 * La pantalla se abre desde dos pestanas -Mensajes y Citas- y ademas puede
 * saltar a la de Citas, asi que ve las tres pilas.
 */
type Props = NativeStackScreenProps<
  MessagesStackParamList & AppointmentsStackParamList & RootStackParamList,
  'SafeLocations'
>;

/** Tres horarios propuestos, los mismos que ofrecia la pantalla anterior. */
function buildSlots() {
  const now = new Date();
  return [1, 2, 3].map((days, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + days);
    date.setHours(index === 1 ? 11 : 18, 0, 0, 0);
    return date;
  });
}

export function SafeLocationsScreen({ route, navigation }: Props) {
  const theme = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  /**
   * Alto del mapa, en pixeles y no en porcentaje.
   *
   * Estaba en 30%, y un porcentaje dentro de un ScrollView se mide contra un
   * contenedor que no tiene alto propio: el mapa quedaba de un tamano
   * indefinido y el scroll no llegaba al final, asi que el boton de
   * confirmar no se alcanzaba. Es la misma cuenta que hace la web:
   * un tercio de la pantalla, con tope y piso.
   */
  const mapHeight = Math.max(190, Math.min(windowHeight * 0.33, 290));
  const toast = useToast();
  const { locations, appointments, scheduleAppointment } = useAppData();
  const appointment = appointments.find((item) => item.id === route.params?.appointmentId);
  const [selectedId, setSelectedId] = useState(appointment?.location.id ?? locations[0]?.id ?? '');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const mapsConfigured = Boolean(Constants.expoConfig?.extra?.googleMapsConfigured);
  const selected = locations.find((item) => item.id === selectedId) ?? locations[0];

  const locate = async () => { setLocating(true); const result = await requestForegroundCoordinates().catch(() => null); setLocating(false); if (!result) toast({ title: 'Ubicación no disponible', body: 'Podés explorar todos los puntos moviendo el mapa o desde la lista.' }); else setCoordinates(result); };
  // Aviso propio en vez de Alert.alert: el cuadro del sistema interrumpe y
  // no sigue la identidad de la aplicación.
  const [confirmed, setConfirmed] = useState(false);

  // La fecha se elige en esta misma pantalla, como en la web: antes vivia en
  // una pantalla aparte y el punto de encuentro en otra.
  const slots = useMemo(buildSlots, []);
  const [startAt, setStartAt] = useState(route.params?.startAt ?? slots[0].toISOString());

  const confirm = () => {
    if (!route.params?.conversationId) return;
    const created = scheduleAppointment(route.params.conversationId, selectedId, startAt);
    if (created) setConfirmed(true);
  };

  const agendando = Boolean(route.params?.conversationId);

  /** Fecha de la cita ya agendada, partida en dos renglones para mostrarla. */
  const appointmentWhen = useMemo(() => {
    if (!appointment) return null;
    const when = new Date(appointment.startAt);
    return {
      // Solo la primera letra: `capitalize` de RN sube cada palabra y
      // dejaba "Domingo, 2 De Agosto".
      date: (() => { const d = when.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }); return d.charAt(0).toUpperCase() + d.slice(1); })(),
      time: when.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
  }, [appointment]);

  return <View style={styles.screen}>
    {/* Mismo encabezado que la web: flecha y titulo dorado en linea. */}
    <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) + 6 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.heading} />
      </Pressable>
      <GoldHeading style={styles.topTitle} numberOfLines={1}>
        {agendando ? 'Agendar encuentro' : 'Punto de encuentro'}
      </GoldHeading>
    </View>

    <ScrollView
      style={styles.body}
      contentContainerStyle={[styles.bodyContent, { paddingBottom: 18 + 60 + Math.max(insets.bottom, 0) }]}
      showsVerticalScrollIndicator={false}
    >
    <View style={[styles.mapWrap, { height: mapHeight }]}>
      {mapsConfigured ? <SafeMap locations={locations} selectedId={selectedId} userCoordinates={coordinates} onSelect={setSelectedId} /> : <View style={styles.mapFallback}><Ionicons name="map" size={40} color={theme.colors.primary} /><Text style={styles.mapTitle}>Mapa listo para configurar</Text><Text style={styles.mapText}>La lista funciona ahora. Para ver Google Maps agregá las claves nativas restringidas y generá un nuevo development build.</Text></View>}
      <Pressable accessibilityRole="button" accessibilityLabel="Usar mi ubicación" disabled={locating} onPress={locate} style={styles.locate}><Ionicons name={locating ? 'hourglass-outline' : 'locate'} size={20} color={theme.colors.primary} /></Pressable>
    </View>
    <View style={styles.slotsBlock}>
      <Text style={styles.sectionTitle}>Fecha y hora</Text>
      {!agendando ? (
        /* Mirando una cita ya agendada no hay nada que elegir: se muestra la
           fecha que quedó, que antes había que ir a buscar a la pantalla
           anterior. */
        <View style={styles.scheduledWhen}>
          <View style={styles.scheduledIcon}><Ionicons name="calendar-clear" size={18} color={theme.colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.scheduledDate}>{appointmentWhen?.date ?? 'Sin fecha'}</Text>
            <Text style={styles.scheduledTime}>{appointmentWhen?.time ?? ''}</Text>
          </View>
        </View>
      ) : null}
    </View>
    {agendando ? (
      <View style={styles.slotsBlock}>
        {slots.map((slot) => {
          const iso = slot.toISOString();
          const active = startAt === iso;
          return (
            <Pressable key={iso} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setStartAt(iso)} style={[styles.slot, active && styles.slotActive]}>
              <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.slotTitle, active && { color: theme.colors.onPrimary }]}>{slot.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
                <Text style={[styles.slotTime, active && { color: 'rgba(5,5,5,.7)' }]}>{slot.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} · 60 minutos</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    ) : null}

    <View style={styles.header}><View style={{ flex: 1 }}><Text style={styles.title}>Puntos públicos recomendados</Text><Text style={styles.disclaimer}>La recomendación reduce riesgos, pero no garantiza seguridad.</Text></View></View>
    <View style={styles.list}>
      {locations.map((item) => (
        <View key={item.id} style={{ marginBottom: 9 }}>
          <LocationCard item={item} selected={item.id === selectedId} theme={theme} onSelect={() => setSelectedId(item.id)} onReviews={() => navigation.navigate('LocationReviews', { locationId: item.id, appointmentId: appointment?.id })} />
        </View>
      ))}
    </View>

    {selected ? (
      <View style={styles.reviewsBlock}>
        <Text style={styles.sectionTitle}>Experiencias verificadas</Text>
        {selected.reviews.length === 0 ? (
          <Text style={styles.disclaimer}>Todavía no hay reseñas de este punto.</Text>
        ) : null}
        {selected.reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewTop}>
              <Text style={styles.reviewAuthor}>{review.authorName}</Text>
              <Text style={styles.reviewStars}>{'★'.repeat(review.rating)}</Text>
            </View>
            {review.verifiedAttendance ? (
              <View style={styles.reviewVerified}>
                <Ionicons name="checkmark-circle" size={13} color={theme.colors.success} />
                <Text style={styles.reviewVerifiedText}>Asistencia verificada</Text>
              </View>
            ) : null}
            <Text style={styles.reviewBody}>{review.comment}</Text>
          </View>
        ))}
      </View>
    ) : null}

    {route.params?.conversationId ? (
      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.selectedLabel}>PUNTO ELEGIDO</Text>
          <Text style={styles.selectedName} numberOfLines={1}>{selected?.name}</Text>
        </View>
        <Pressable accessibilityRole="button" disabled={!selected} onPress={confirm} style={styles.confirm}>
          <Text style={styles.confirmText}>Confirmar cita</Text>
        </Pressable>
      </View>
    ) : null}
    </ScrollView>
    <Modal transparent visible={confirmed} animationType="fade" onRequestClose={() => setConfirmed(false)}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Cita agendada</Text>
          <Text style={styles.modalBody}>El encuentro quedó guardado y visible en Citas.</Text>
          <View style={styles.modalActions}>
            <Pressable accessibilityRole="button" onPress={() => setConfirmed(false)} style={styles.modalSecondary}>
              <Text style={styles.modalSecondaryText}>Seguir acá</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => { setConfirmed(false); navigation.navigate('Main', { screen: 'Appointments' }); }}
              style={styles.modalPrimary}
            >
              <Text style={styles.modalPrimaryText}>Ver citas</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>

  </View>;
}

function LocationCard({ item, selected, theme, onSelect, onReviews }: { item: SafeLocation; selected: boolean; theme: AppTheme; onSelect: () => void; onReviews: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onSelect} style={{ padding: 13, gap: 8, borderRadius: 21, backgroundColor: selected ? theme.colors.primaryFaded : theme.colors.surface, borderWidth: selected ? 2 : 1, borderColor: selected ? theme.colors.primary : theme.colors.border }}>
    <View style={{ flexDirection: 'row', gap: 9, alignItems: 'flex-start' }}><View style={{ width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt }}><Ionicons name="location" size={20} color={selected ? theme.colors.onPrimary : theme.colors.primary} /></View><View style={{ flex: 1 }}><Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '900' }}>{item.name}</Text><Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 2 }}>{item.address} · {item.distanceKm} km</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Ver reseñas de ${item.name}`} onPress={onReviews}><Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '900' }}>★ {item.rating}</Text><Text style={{ color: theme.colors.textMuted, fontSize: 9, textAlign: 'right' }}>{item.reviewCount}</Text></Pressable></View>
    <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>{item.tags.map((tag) => <View key={tag} style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 9, backgroundColor: theme.colors.surfaceAlt }}><Text style={{ color: theme.colors.textSecondary, fontSize: 9, fontWeight: '800' }}>{tag}</Text></View>)}</View>
  </Pressable>;
}

function createStyles(theme: AppTheme) { return StyleSheet.create({
  // Sin color propio: asi se ve el lienzo animado que se dibuja detras de
  // todas las pantallas, igual que en la web. Con el fondo opaco esta era
  // la unica pantalla que lo tapaba.
  screen: { flex: 1, backgroundColor: 'transparent' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingBottom: 10 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 22, fontWeight: '800' },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 18 },
  slotsBlock: { gap: 9, paddingHorizontal: 16, paddingTop: 16 },
  reviewsBlock: { gap: 9, paddingHorizontal: 16, paddingTop: 14 },

  // La fecha de una cita ya agendada, en el lugar de los horarios elegibles.
  scheduledWhen: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    padding: 12, borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  scheduledIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.colors.primaryFaded,
  },
  // El dia viene en minuscula del formateador.
  scheduledDate: { color: theme.colors.text, fontSize: 15, fontWeight: '800' },
  scheduledTime: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },

  reviewCard: {
    padding: 14, borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between' },
  reviewAuthor: { color: theme.colors.text, fontWeight: '900' },
  reviewStars: { color: theme.colors.primary, fontWeight: '900' },
  reviewVerified: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  reviewVerifiedText: { color: theme.colors.success, fontSize: 10, fontWeight: '800' },
  reviewBody: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 8 },
  // Estos titulos quedan sobre el fondo animado, sin tarjeta detras: el halo
  // los despega de las particulas, con el mismo valor que usa la web.
  sectionTitle: {
    color: theme.colors.text, fontSize: 16, fontWeight: '900',
    textShadowColor: 'rgba(255, 255, 255, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  slot: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12, borderRadius: 19, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
  slotActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: theme.colors.onPrimary },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: theme.colors.onPrimary },
  slotTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '900', textTransform: 'capitalize' },
  slotTime: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 }, mapWrap: { position: 'relative', overflow: 'hidden', backgroundColor: theme.colors.surfaceAlt }, mapFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 35 }, mapTitle: { color: theme.colors.text, fontSize: 16, fontWeight: '900' }, mapText: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center' }, locate: { position: 'absolute', right: 13, bottom: 13, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, elevation: 5 }, header: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14 }, title: {
    color: theme.colors.text, fontSize: 18, fontWeight: '900',
    textShadowColor: 'rgba(255, 255, 255, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  }, disclaimer: {
    color: theme.colors.warning, fontSize: 11, marginTop: 3,
    textShadowColor: 'rgba(255, 255, 255, 0.35)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  }, list: { padding: 14, paddingBottom: 0 }, footer: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 14, marginTop: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }, selectedLabel: { color: theme.colors.primary, fontSize: 13, fontWeight: '900' }, selectedName: { color: theme.colors.text, fontSize: 14, fontWeight: '800', marginTop: 2 }, confirm: { minHeight: 46, paddingHorizontal: 16, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }, confirmText: { color: theme.colors.onPrimary, fontSize: 13, fontWeight: '900' },
    backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.overlay },
    modal: { padding: 20, gap: 12, borderRadius: 24, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    modalTitle: { color: theme.colors.primary, fontSize: 20, fontWeight: '900' },
    modalBody: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9, marginTop: 4 },
    modalSecondary: { minHeight: 44, paddingHorizontal: 16, justifyContent: 'center' },
    modalSecondaryText: { color: theme.colors.textSecondary, fontWeight: '800' },
    modalPrimary: { minHeight: 44, paddingHorizontal: 20, borderRadius: 22, justifyContent: 'center', backgroundColor: theme.colors.primary },
    modalPrimaryText: { color: theme.colors.onPrimary, fontWeight: '900' } }); }
