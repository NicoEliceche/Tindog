import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { myPets } from '../../../core/data/mock/pets';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PetProfile'>;

export function PetProfileScreen({ route, navigation }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { appointments } = useAppData();
  const pet = myPets.find((item) => item.id === route.params.petId) ?? myPets[0];
  const compact = height < 740 || width < 360;
  const nextAppointment = appointments.find((item) => item.status === 'scheduled' && item.petNames.includes(pet.name));
  const recordCount = pet.health_records?.length ?? 0;
  const docsCount = pet.paper_types?.length ?? 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 10) }]}
      showsVerticalScrollIndicator={false}
    >
        <View style={styles.hero}>
          <Image source={{ uri: pet.photos[0] }} style={[styles.petPhoto, compact && styles.petPhotoCompact]} />
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>PANEL DE {pet.name.toUpperCase()}</Text>
            <Text style={[styles.title, compact && { fontSize: 25 }]}>{pet.name}</Text>
            <Text style={styles.subtitle}>{pet.breed} · {pet.age} años · {pet.weight ?? '—'} kg</Text>
            <View style={styles.verified}><Ionicons name="shield-checkmark" size={14} color={theme.colors.success} /><Text style={styles.verifiedText}>Perfil y documentación verificados</Text></View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Editar mascota" style={styles.edit}><Ionicons name="create-outline" size={20} color={theme.colors.primary} /></Pressable>
        </View>

        <View style={styles.grid}>
          <DashboardCard theme={theme} icon="heart" title="Conexiones" value="8" detail="2 nuevas esta semana" compact={compact} />
          <DashboardCard theme={theme} icon="fitness" title="Actividad" value="4/5" detail="Paseos completados" compact={compact} bars />
          <DashboardCard theme={theme} icon="git-compare" title="Compatibilidad" value={`${pet.coi_percentage ?? 0}%`} detail="COI estimado · bajo" compact={compact} />
          <DashboardCard theme={theme} icon="medkit" title="Salud" value={`${recordCount + docsCount}`} detail="Controles y documentos" compact={compact} />
        </View>

        <View style={styles.nextCard}>
          <View style={styles.nextIcon}><Ionicons name={nextAppointment ? 'calendar' : 'sparkles'} size={22} color={theme.colors.onPrimary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.nextLabel}>{nextAppointment ? 'PRÓXIMA CITA' : 'SIGUIENTE PASO'}</Text>
            <Text style={styles.nextTitle} numberOfLines={1}>{nextAppointment ? `${nextAppointment.petNames.join(' + ')} · ${new Date(nextAppointment.startAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}` : 'Completá el control veterinario'}</Text>
            {!compact ? <Text style={styles.nextDetail} numberOfLines={1}>{nextAppointment ? nextAppointment.location.name : 'Mantener los estudios al día mejora conexiones responsables.'}</Text> : null}
          </View>
          {nextAppointment ? <Pressable accessibilityRole="button" onPress={() => navigation.navigate('SafeLocations', { appointmentId: nextAppointment.id })}><Ionicons name="chevron-forward" size={24} color={theme.colors.primary} /></Pressable> : null}
        </View>

        {!compact ? <View style={styles.tip}><Ionicons name="bulb-outline" size={21} color={theme.colors.primary} /><Text style={styles.tipText}><Text style={{ fontWeight: '900' }}>Consejo Tindog: </Text>compartí estudios de salud antes de coordinar una cruza.</Text></View> : null}
    </ScrollView>
  );
}

function DashboardCard({ theme, icon, title, value, detail, compact, bars }: { theme: AppTheme; icon: keyof typeof Ionicons.glyphMap; title: string; value: string; detail: string; compact: boolean; bars?: boolean }) {
  return <View style={{ width: '48.3%', minHeight: compact ? 116 : 142, borderRadius: 22, padding: compact ? 12 : 15, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: theme.colors.textSecondary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }}>{title}</Text><Ionicons name={icon} size={19} color={theme.colors.primary} /></View>
    <Text style={{ color: theme.colors.text, fontSize: compact ? 25 : 30, fontWeight: '900' }}>{value}</Text>
    {bars ? <View style={{ height: 18, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>{[8, 15, 11, 18, 13, 17, 9].map((bar, index) => <View key={index} style={{ flex: 1, height: bar, borderRadius: 4, backgroundColor: index === 5 ? theme.colors.primary : theme.colors.primaryFaded }} />)}</View> : null}
    <Text style={{ color: theme.colors.textMuted, fontSize: compact ? 10 : 11, fontWeight: '700' }} numberOfLines={1}>{detail}</Text>
  </View>;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent' },
    content: { flexGrow: 1, maxWidth: 520, width: '100%', alignSelf: 'center', padding: 16, gap: 14 },
    hero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    petPhoto: { width: 76, height: 76, borderRadius: 24, borderWidth: 2, borderColor: theme.colors.primary },
    petPhotoCompact: { width: 62, height: 62, borderRadius: 20 },
    heroCopy: { flex: 1 },
    eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
    title: { color: theme.colors.text, fontSize: 30, fontWeight: '900', lineHeight: 34 },
    subtitle: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '700' },
    verified: { flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 5 },
    verifiedText: { color: theme.colors.success, fontSize: 10, fontWeight: '800' },
    edit: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.border },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
    nextCard: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 22, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.primaryBorderStrong },
    nextIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary },
    nextLabel: { color: theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
    nextTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900', marginTop: 2 },
    nextDetail: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },
    tip: { flex: 1, maxHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 20, backgroundColor: theme.colors.primaryFaded },
    tipText: { flex: 1, color: theme.colors.textSecondary, fontSize: 12, lineHeight: 18 },
  });
}
