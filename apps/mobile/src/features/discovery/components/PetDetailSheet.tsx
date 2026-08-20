import { Ionicons } from '@expo/vector-icons';
import type React from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useMemo, useState } from 'react';
import {
  Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { Pet, PetMedia } from '../../../core/types/pet.types';

/** Deriva la galería: si la mascota no trae `media`, usa sus fotos sueltas. */
function galleryOf(pet: Pet): PetMedia[] {
  if (pet.media?.length) return pet.media;
  return pet.photos.map((url, index) => ({ id: `${pet.id}-${index}`, kind: 'photo' as const, url }));
}

/** Un dato de la ficha, con su ícono. */
function Fact({ icon, label, value, theme }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: string; theme: AppTheme;
}) {
  const styles = createStyles(theme);
  return (
    <View style={styles.fact}>
      <View style={styles.factIcon}><Ionicons name={icon} size={17} color={theme.colors.primary} /></View>
      <View style={styles.factCopy}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue}>{value}</Text>
      </View>
    </View>
  );
}

/**
 * Reproductor del video de la galería.
 *
 * El `player` va tipado como el propio prop de `VideoView`: el tsconfig
 * resuelve a la vez la variante nativa y la web del paquete, y la
 * intersección de ambas no coincide con lo que devuelve el hook.
 */
function GalleryVideo({ url, height }: { url: string; height: number }) {
  const player = useVideoPlayer(url, (instance) => { instance.loop = false; });
  return (
    <VideoView
      player={player as React.ComponentProps<typeof VideoView>['player']}
      style={{ width: '100%', height }}
      contentFit="contain"
      nativeControls
    />
  );
}

interface PetDetailSheetProps {
  pet: Pet | null;
  onClose: () => void;
}

/**
 * Ficha completa de una mascota, a pantalla completa.
 *
 * La tarjeta de Inicio muestra lo justo para decidir un swipe; acá va todo
 * lo que alguien querría saber antes de escribir. Es la misma información y
 * el mismo orden que en la web.
 */
export function PetDetailSheet({ pet, onClose }: PetDetailSheetProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  // Cada mascota abre su galería desde el principio.
  useEffect(() => { setIndex(0); }, [pet?.id]);

  const media = pet ? galleryOf(pet) : [];
  const galleryHeight = Math.round((width - 32) * 1.25);

  if (!pet) return null;

  const owner = pet.caregivers?.[0];
  const others = (pet.caregivers ?? []).slice(1);
  const health = pet.health_records ?? [];
  const competitions = pet.competitions ?? [];
  const current = media[index];

  const lineage = [
    ['Padre', pet.father_id],
    ['Madre', pet.mother_id],
    ['Abuelos paternos', [pet.paternal_grandfather_id, pet.paternal_grandmother_id].filter(Boolean).join(' · ')],
    ['Abuelos maternos', [pet.maternal_grandfather_id, pet.maternal_grandmother_id].filter(Boolean).join(' · ')],
  ] as const;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      {/* La capa deja libre la barra de pestañas: desde la ficha se sigue
          navegando sin tener que cerrarla. */}
      <View style={[styles.screen, { marginBottom: 60 + insets.bottom }]}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) + 6 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar ficha" onPress={onClose} style={styles.close}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Redondeada en las cuatro puntas, como la tarjeta de Inicio. */}
          <View style={[styles.gallery, { height: galleryHeight }]}>
            {current?.kind === 'video'
              ? <GalleryVideo url={current.url} height={galleryHeight} />
              : <Image source={{ uri: current?.url }} style={styles.galleryImage} resizeMode="cover" />}

            {media.length > 1 ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Anterior"
                  onPress={() => setIndex((c) => (c - 1 + media.length) % media.length)}
                  style={[styles.navButton, { left: 10 }]}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Siguiente"
                  onPress={() => setIndex((c) => (c + 1) % media.length)}
                  style={[styles.navButton, { right: 10 }]}
                >
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
                </Pressable>
                <View style={styles.dots}>
                  {media.map((item, dotIndex) => (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Ver elemento ${dotIndex + 1}`}
                      onPress={() => setIndex(dotIndex)}
                      style={[styles.dot, dotIndex === index && styles.dotActive]}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </View>

          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petMeta}>
            {pet.breed} · {pet.gender} · {pet.age} {pet.age === 1 ? 'año' : 'años'}
          </Text>

          <View style={styles.chips}>
            <View style={[styles.chip, pet.nearby && styles.chipPrimary]}>
              <Ionicons name="location-outline" size={12} color={pet.nearby ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[styles.chipText, pet.nearby && styles.chipTextPrimary]}>
                {pet.nearby
                  ? `Cerca tuyo${pet.distanceKm ? ` · ${pet.distanceKm} km` : ''}`
                  : pet.distanceKm ? `A ${pet.distanceKm} km` : 'En tu ciudad'}
              </Text>
            </View>
            {pet.breeding_preferences?.looking_for_pair ? (
              <View style={[styles.chip, styles.chipPrimary]}>
                <Ionicons name="heart-outline" size={12} color={theme.colors.primary} />
                <Text style={[styles.chipText, styles.chipTextPrimary]}>Busca pareja</Text>
              </View>
            ) : null}
            {pet.is_verified_breeder_pet ? (
              <View style={[styles.chip, styles.chipPrimary]}>
                <Ionicons name="shield-checkmark-outline" size={12} color={theme.colors.primary} />
                <Text style={[styles.chipText, styles.chipTextPrimary]}>Criadero verificado</Text>
              </View>
            ) : null}
            {pet.personality_traits.map((trait) => (
              <View key={trait} style={styles.chip}><Text style={styles.chipText}>{trait}</Text></View>
            ))}
          </View>

          {pet.bio ? <Text style={styles.bio}>{pet.bio}</Text> : null}

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>INFO DEL DUEÑO/A</Text>

          {owner ? (
            <>
              <View style={styles.ownerRow}>
                <View style={styles.ownerAvatar}>
                  {owner.avatar
                    ? <Image source={{ uri: owner.avatar }} style={styles.ownerAvatarImage} />
                    : <Text style={styles.ownerInitial}>{owner.name[0]}</Text>}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={styles.ownerNameRow}>
                    <Text style={styles.ownerName} numberOfLines={1}>{owner.name}</Text>
                    {owner.verified ? <Ionicons name="shield-checkmark" size={14} color={theme.colors.success} /> : null}
                  </View>
                  <Text style={styles.ownerMeta} numberOfLines={1}>
                    <Ionicons name="location-outline" size={11} color={theme.colors.textMuted} /> {owner.zone}
                  </Text>
                  {owner.memberSince ? (
                    <Text style={styles.ownerMeta}>
                      En Tindog desde{' '}
                      {new Date(owner.memberSince).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </Text>
                  ) : null}
                </View>
              </View>
              {owner.bio ? <Text style={styles.bio}>{owner.bio}</Text> : null}
              {others.length ? (
                <Text style={styles.petMeta}>
                  También a cargo: {others.map((person) => person.name).join(', ')}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.petMeta}>El tutor todavía no completó su perfil.</Text>
          )}

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>INFORMACIÓN ADICIONAL DE LA MASCOTA</Text>

          <Fact icon="calendar-outline" label="EDAD" theme={theme} value={`${pet.age} ${pet.age === 1 ? 'año' : 'años'}`} />
          <Fact icon="barbell-outline" label="PESO" theme={theme} value={pet.weight ? `${pet.weight} kg` : 'Sin dato'} />
          <Fact
            icon="medkit-outline"
            label="SALUD GENÉTICA"
            theme={theme}
            value={health.length ? health.map((r) => `${r.test_name}: ${r.result}`).join(' · ') : 'Sin estudios cargados'}
          />
          <Fact
            icon="heart-outline"
            label="BUSCA PAREJA PARA CRÍA"
            theme={theme}
            value={`${pet.breeding_preferences?.looking_for_pair ? 'Sí' : 'No'}${pet.breeding_preferences?.terms ? ` · ${pet.breeding_preferences.terms}` : ''}`}
          />
          <Fact
            icon="document-text-outline"
            label="DOCUMENTACIÓN"
            theme={theme}
            value={pet.has_papers ? (pet.paper_types?.join(', ') || 'Con papeles') : 'Sin papeles'}
          />
          <Fact
            icon="trophy-outline"
            label="CONCURSOS"
            theme={theme}
            value={pet.is_competitor && competitions.length
              ? competitions.map((c) => `${c.name} ${c.year}${c.award ? ` · ${c.award}` : ''}`).join(' · ')
              : pet.is_competitor ? 'Participa' : 'No participa'}
          />

          <Text style={styles.sectionLabel}>LINAJE Y ÁRBOL GENEALÓGICO</Text>
          <View style={styles.lineage}>
            {lineage.map(([label, value]) => (
              <View key={label} style={styles.lineageCell}>
                <Text style={styles.factLabel}>{label}</Text>
                <Text style={styles.factValue}>{value || 'Sin registrar'}</Text>
              </View>
            ))}
          </View>

          <Fact
            icon="git-branch-outline"
            label="COEFICIENTE DE CONSANGUINIDAD (COI)"
            theme={theme}
            value={pet.coi_percentage != null
              ? `${pet.coi_percentage}%${pet.coi_percentage < 10 ? ' · dentro de lo recomendable' : ''}`
              : 'Sin dato'}
          />

          <Text style={styles.footnote}>Los datos los carga quien tiene la mascota.</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 10, paddingBottom: 4 },
    close: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
    content: { paddingHorizontal: 16, paddingBottom: 28, gap: 8 },

    gallery: {
      position: 'relative', borderRadius: 28, overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    galleryImage: { width: '100%', height: '100%' },
    navButton: {
      position: 'absolute', top: '50%', marginTop: -19,
      width: 38, height: 38, borderRadius: 19,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.surfaceOverlay,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    dots: { position: 'absolute', left: 0, right: 0, bottom: 10, flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.textMuted },
    dotActive: { width: 22, backgroundColor: theme.colors.primary },

    petName: { color: theme.colors.heading, fontSize: 30, fontWeight: '900', marginTop: 6 },
    petMeta: { color: theme.colors.textSecondary, fontSize: 14 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
    chip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    chipPrimary: { backgroundColor: theme.colors.primaryFaded, borderColor: theme.colors.primaryBorderStrong },
    chipText: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '800' },
    chipTextPrimary: { color: theme.colors.primary },
    bio: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 21 },

    divider: { height: 1, marginVertical: 10, backgroundColor: theme.colors.primary, opacity: 0.75 },
    sectionLabel: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 4 },

    ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    ownerAvatar: {
      width: 52, height: 52, borderRadius: 26, overflow: 'hidden',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.primaryFaded,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    ownerAvatarImage: { width: '100%', height: '100%' },
    ownerInitial: { color: theme.colors.primary, fontSize: 20, fontWeight: '900' },
    ownerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    ownerName: { color: theme.colors.text, fontSize: 16, fontWeight: '900' },
    ownerMeta: { color: theme.colors.textMuted, fontSize: 11, marginTop: 2 },

    fact: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 11, padding: 12,
      borderRadius: 18, backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    factIcon: {
      width: 36, height: 36, borderRadius: 12,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.primaryFaded,
    },
    factCopy: { flex: 1, minWidth: 0 },
    factLabel: { color: theme.colors.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    factValue: { color: theme.colors.text, fontSize: 13, fontWeight: '700', lineHeight: 19, marginTop: 2 },

    lineage: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    lineageCell: {
      flexGrow: 1, flexBasis: '45%', padding: 12, borderRadius: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },

    footnote: { color: theme.colors.textMuted, fontSize: 11, marginTop: 4 },
  });
}
