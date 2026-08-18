import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { SafeLocationReview } from '../../../core/types/appointment.types';
import type { AppointmentsStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<AppointmentsStackParamList, 'LocationReviews'>;

export function LocationReviewsScreen({ route }: Props) {
  const theme = useAppTheme(); const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { locations, appointments, addLocationReview, profile } = useAppData();
  const location = locations.find((item) => item.id === route.params.locationId);
  const appointment = appointments.find((item) => item.id === route.params.appointmentId);
  const canReview = Boolean(appointment?.status === 'completed' && appointment.checkedIn && !appointment.reviewSubmitted);
  const [rating, setRating] = useState(5); const [comment, setComment] = useState(''); const [sent, setSent] = useState(false);
  if (!location) return <View style={styles.center}><Text style={styles.title}>Punto no disponible</Text></View>;

  const submit = () => { if (!canReview || comment.trim().length < 10) return; addLocationReview(location.id, { authorName: profile.name.split(' ')[0] || 'Usuario', rating, comment: comment.trim() }); setComment(''); setSent(true); };

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}><FlatList
    data={location.reviews}
    keyExtractor={(item) => item.id}
    contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 16 }]}
    showsVerticalScrollIndicator={false}
    ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
    ListHeaderComponent={<View style={styles.header}>
      <View style={styles.locationIcon}><Ionicons name="location" size={27} color={theme.colors.onPrimary} /></View><Text style={styles.title}>{location.name}</Text><Text style={styles.address}>{location.address}</Text>
      <View style={styles.ratingSummary}><Text style={styles.ratingValue}>{location.rating}</Text><View><Text style={styles.stars}>★★★★★</Text><Text style={styles.count}>{location.reviewCount} reseñas Tindog</Text></View></View>
      {route.params.appointmentId ? <View style={[styles.reviewBox, !canReview && styles.reviewDisabled]}>
        {sent ? <><Ionicons name="checkmark-circle" size={34} color={theme.colors.success} /><Text style={styles.reviewTitle}>Gracias por compartir tu experiencia</Text></> : canReview ? <><Text style={styles.reviewTitle}>¿Cómo fue este punto?</Text><Text style={styles.reviewHint}>Tu asistencia fue verificada. No incluyas datos personales de la otra persona.</Text><View style={styles.starRow}>{[1,2,3,4,5].map((star) => <Pressable key={star} accessibilityRole="button" accessibilityLabel={`${star} estrellas`} onPress={() => setRating(star)}><Ionicons name={star <= rating ? 'star' : 'star-outline'} size={29} color={theme.colors.primary} /></Pressable>)}</View><TextInput value={comment} onChangeText={setComment} placeholder="Contá cómo era la iluminación, el movimiento y el acceso…" placeholderTextColor={theme.colors.textMuted} multiline maxLength={500} style={styles.reviewInput} /><Pressable accessibilityRole="button" disabled={comment.trim().length < 10} onPress={submit} style={[styles.submit, comment.trim().length < 10 && { opacity: .45 }]}><Text style={styles.submitText}>Publicar reseña</Text></Pressable></> : <><Ionicons name="shield-outline" size={28} color={theme.colors.textMuted} /><Text style={styles.reviewTitle}>{appointment?.status === 'cancelled' ? 'La cita fue cancelada' : 'Reseña no disponible'}</Text><Text style={styles.reviewHint}>Las reseñas públicas del lugar se habilitan solo después de una cita finalizada con asistencia. La cancelación permanece en tu historial.</Text></>}
      </View> : null}
      <Text style={styles.section}>Experiencias verificadas</Text>
    </View>}
    renderItem={({ item }) => <ReviewCard review={item} theme={theme} />}
    ListEmptyComponent={<Text style={styles.empty}>Todavía no hay comentarios escritos para este punto.</Text>}
  /></KeyboardAvoidingView>;
}

function ReviewCard({ review, theme }: { review: SafeLocationReview; theme: AppTheme }) { return <View style={{ padding: 14, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ color: theme.colors.text, fontWeight: '900' }}>{review.authorName}</Text><Text style={{ color: theme.colors.primary, fontWeight: '900' }}>{'★'.repeat(review.rating)}</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}><Ionicons name="checkmark-circle" size={13} color={theme.colors.success} /><Text style={{ color: theme.colors.success, fontSize: 10, fontWeight: '800' }}>Asistencia verificada</Text></View><Text style={{ color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 8 }}>{review.comment}</Text></View>; }
function createStyles(theme: AppTheme) { return StyleSheet.create({ screen: { flex: 1, backgroundColor: 'transparent' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center' }, content: { padding: 16, paddingBottom: 30 }, header: { alignItems: 'center', gap: 5, marginBottom: 12 }, locationIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary }, title: { color: theme.colors.heading, fontSize: 22, fontWeight: '900', textAlign: 'center' }, address: { color: theme.colors.textSecondary, fontSize: 12, textAlign: 'center' }, ratingSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 12 }, ratingValue: { color: theme.colors.text, fontSize: 36, fontWeight: '900' }, stars: { color: theme.colors.primary, fontSize: 16, letterSpacing: 2 }, count: { color: theme.colors.textMuted, fontSize: 10, marginTop: 3 }, reviewBox: { width: '100%', alignItems: 'center', gap: 9, padding: 14, borderRadius: 22, backgroundColor: theme.colors.primaryFaded, borderWidth: 1, borderColor: theme.colors.primaryBorder }, reviewDisabled: { backgroundColor: theme.colors.surface }, reviewTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900', textAlign: 'center' }, reviewHint: { color: theme.colors.textSecondary, fontSize: 11, lineHeight: 16, textAlign: 'center' }, starRow: { flexDirection: 'row', gap: 8 }, reviewInput: { width: '100%', minHeight: 78, padding: 11, textAlignVertical: 'top', borderRadius: 15, color: theme.colors.text, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }, submit: { minHeight: 43, paddingHorizontal: 18, borderRadius: 22, justifyContent: 'center', backgroundColor: theme.colors.primary }, submitText: { color: theme.colors.onPrimary, fontWeight: '900' }, section: { alignSelf: 'flex-start', color: theme.colors.text, fontSize: 16, fontWeight: '900', marginTop: 10 }, empty: { color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 24 } }); }
