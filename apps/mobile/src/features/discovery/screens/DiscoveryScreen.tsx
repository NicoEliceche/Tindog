import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchDiscoveryPets } from '../../../core/data/services/petService';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { Pet } from '../../../core/types/pet.types';
import { AuroraBackground } from '../../../shared/components/AuroraBackground';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';

const fallbackPetPhoto = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=1200';

/** Fracción del ancho de la tarjeta que confirma el swipe (como Tinder). */
const SWIPE_RATIO = 0.32;
/** Flick corto pero rápido: la velocidad sola alcanza para confirmar. */
const SWIPE_VELOCITY = 800;
/** Ángulo máximo de rotación en grados. */
const MAX_ROTATION = 18;

export function DiscoveryScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { profile, sendConnectionRequest, requests } = useAppData();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [lastDismissed, setLastDismissed] = useState<Pet | null>(null);
  const compact = height < 740;

  useEffect(() => {
    let mounted = true;
    fetchDiscoveryPets().then((result) => mounted && setPets(result)).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const currentPet = pets[0];
  const pendingPetIds = requests.filter((item) => item.direction === 'outgoing' && item.status === 'pending').map((item) => item.pet.id);
  const cardWidth = Math.min(width - theme.spacing.lg * 2, 430);
  const available = height - insets.top - insets.bottom - (compact ? 132 : 148);
  const cardHeight = Math.min(Math.max(Math.round(available * 0.72), compact ? 330 : 400), compact ? 440 : 540);
  const imageHeight = Math.round(cardHeight * 0.67);
  const firstName = profile.name.trim().split(/\s+/)[0] || 'Perfil';

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  // +1 si se agarró la mitad superior, -1 si fue la inferior: invierte el
  // sentido del giro para que la tarjeta pivotee alrededor del dedo, como
  // hace Tinder, en vez de rotar siempre desde su centro.
  const grabSign = useSharedValue(1);

  // Umbral proporcional al ancho de la tarjeta (no px fijos), para que el
  // gesto pida el mismo esfuerzo relativo en cualquier tamaño de pantalla.
  const swipeThreshold = cardWidth * SWIPE_RATIO;

  const next = useCallback(() => setPets((current) => current.slice(1)), []);

  const connect = useCallback(() => {
    if (!currentPet) return;
    sendConnectionRequest(currentPet);
    setLastDismissed(currentPet);
    setNotice({
      title: 'Solicitud enviada',
      body: `El tutor de ${currentPet.name} recibió tu solicitud. El chat se habilitará únicamente si la acepta.`,
    });
    next();
  }, [currentPet, next, sendConnectionRequest]);

  const pass = useCallback(() => {
    if (currentPet) setLastDismissed(currentPet);
    next();
  }, [currentPet, next]);

  const undo = useCallback(() => {
    if (!lastDismissed) return;
    setPets((current) => (current.some((p) => p.id === lastDismissed.id) ? current : [lastDismissed, ...current]));
    setLastDismissed(null);
  }, [lastDismissed]);

  const reload = useCallback(async () => {
    setLoading(true);
    setPets(await fetchDiscoveryPets());
    setLastDismissed(null);
    setLoading(false);
  }, []);

  // Al quedarnos sin perfiles pedimos la siguiente tanda sola, como haría
  // contra el backend real. Con el mock local vuelve el mismo set, así que
  // el recorrido no se corta nunca ni queda una pantalla muerta.
  useEffect(() => {
    if (loading || pets.length > 0) return;
    const timer = setTimeout(() => { void reload(); }, 650);
    return () => clearTimeout(timer);
  }, [loading, pets.length, reload]);

  const handleSwiped = useCallback((direction: 'left' | 'right') => {
    if (direction === 'right') connect();
    else pass();
    translateX.value = 0;
    translateY.value = 0;
  }, [connect, pass, translateX, translateY]);

  const pan = useMemo(() => Gesture.Pan()
    .enabled(Boolean(currentPet))
    .onBegin((event) => {
      // event.y es relativo a la tarjeta: define el pivote de la rotación.
      grabSign.value = event.y > cardHeight / 2 ? -1 : 1;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.4;
    })
    .onEnd((event) => {
      const shouldSwipeRight = event.translationX > swipeThreshold || event.velocityX > SWIPE_VELOCITY;
      const shouldSwipeLeft = event.translationX < -swipeThreshold || event.velocityX < -SWIPE_VELOCITY;

      if (shouldSwipeRight) {
        translateX.value = withTiming(width * 1.4, { duration: 260 }, () => runOnJS(handleSwiped)('right'));
      } else if (shouldSwipeLeft) {
        translateX.value = withTiming(-width * 1.4, { duration: 260 }, () => runOnJS(handleSwiped)('left'));
      } else {
        translateX.value = withSpring(0, { damping: 18, stiffness: 220 });
        translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      }
    }), [cardHeight, currentPet, grabSign, handleSwiped, swipeThreshold, translateX, translateY, width]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-300, 300], [-MAX_ROTATION, MAX_ROTATION]) * grabSign.value}deg` },
    ],
  }));

  // La tarjeta de atrás se acerca conforme la de adelante se aleja.
  const backdropStyle = useAnimatedStyle(() => {
    const progress = Math.min(1, Math.abs(translateX.value) / swipeThreshold);
    return {
      transform: [{ scale: 0.94 + progress * 0.06 }, { translateY: 10 - progress * 10 }],
      opacity: 0.6 + progress * 0.4,
    };
  });

  const likeLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [20, 120], [0, 1], 'clamp'),
  }));

  const nopeLabelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-120, -20], [1, 0], 'clamp'),
  }));

  // Glare metálico: un reflejo que barre la tarjeta según se arrastra,
  // igual que la luz sobre una superficie pulida.
  const glareStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(translateX.value), [0, 160], [0.12, 0.5], 'clamp'),
    transform: [{ translateX: interpolate(translateX.value, [-300, 300], [cardWidth * 0.7, -cardWidth * 0.35]) }],
  }));

  return (
    <View style={styles.screen}>
      <AuroraBackground theme={theme} />
      <View style={[styles.safeArea, { paddingTop: Math.max(insets.top + 6, 10) }]}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <View style={styles.brand}>
            <Text style={[styles.brandName, !compact && styles.brandNameLarge]}>TINDOG</Text>
            <Text style={styles.tagline}>ENCONTRÁ SU PAREJA IDEAL</Text>
          </View>
          <View style={styles.profileChip}>
            {profile.avatar ? <Image source={{ uri: profile.avatar }} style={styles.avatar} /> : <Text style={styles.initial}>{firstName[0]?.toUpperCase()}</Text>}
            <Text style={styles.profileName} numberOfLines={1}>{firstName}</Text>
          </View>
        </View>

        <View style={styles.main}>
          {loading ? (
            <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /><Text style={styles.muted}>Buscando perfiles compatibles…</Text></View>
          ) : currentPet ? (
            <>
              <View style={[styles.cardStack, { width: cardWidth, height: cardHeight }]}>
                {pets[1] ? (
                  <Animated.View style={[styles.backdropCard, StyleSheet.absoluteFill, backdropStyle]}>
                    <Image
                      source={{ uri: pets[1].photos[0] ?? fallbackPetPhoto }}
                      style={[styles.backdropImage, { height: imageHeight }]}
                      resizeMode="cover"
                    />
                  </Animated.View>
                ) : null}
                <GestureDetector gesture={pan}>
                  <Animated.View style={[styles.card, StyleSheet.absoluteFill, cardAnimatedStyle]}>
                    <Animated.View style={[styles.swipeLabel, styles.likeLabel, likeLabelStyle]}>
                      <Text style={[styles.swipeLabelText, { color: theme.colors.success, borderColor: theme.colors.success }]}>Conectar</Text>
                    </Animated.View>
                    <Animated.View style={[styles.swipeLabel, styles.nopeLabel, nopeLabelStyle]}>
                      <Text style={[styles.swipeLabelText, { color: theme.colors.danger, borderColor: theme.colors.danger }]}>Pasar</Text>
                    </Animated.View>
                    <Animated.View style={[styles.glare, glareStyle]} pointerEvents="none">
                      <LinearGradient
                        colors={['transparent', 'rgba(255,244,194,0.45)', 'rgba(255,255,255,0.6)', 'rgba(255,244,194,0.45)', 'transparent']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    </Animated.View>
                    <Image source={{ uri: currentPet.photos[0] ?? fallbackPetPhoto }} style={[styles.petImage, { height: imageHeight }]} resizeMode="cover" />
                    <View style={styles.cardBody}>
                      <View style={styles.titleRow}><Text style={styles.petName}>{currentPet.name}</Text><Text style={styles.age}>{currentPet.age}</Text></View>
                      <Text style={styles.meta}>{currentPet.breed} · {currentPet.gender} · cerca de ti</Text>
                      <Text style={styles.bio} numberOfLines={compact ? 2 : 3}>{currentPet.bio}</Text>
                    </View>
                  </Animated.View>
                </GestureDetector>
              </View>
              <View style={styles.actions}>
                <Action icon="close" label="Pasar" theme={theme} onPress={pass} />
                <Action icon="chatbubble-ellipses" label="Conectar" theme={theme} primary disabled={pendingPetIds.includes(currentPet.id)} onPress={connect} />
                <Action icon="bookmark" label="Guardar" theme={theme} onPress={() => { setNotice({ title: 'Perfil guardado', body: `Podrás volver a ver a ${currentPet.name} desde tus favoritos.` }); pass(); }} />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Deshacer el último swipe"
                disabled={!lastDismissed}
                onPress={undo}
                style={({ pressed }) => [styles.undoButton, { opacity: !lastDismissed ? 0.35 : pressed ? 0.7 : 1 }]}
              >
                <Ionicons name="arrow-undo" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.undoText}>Deshacer</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.emptyTitle}>Buscando más perfiles</Text>
              <Text style={styles.muted}>Estamos trayendo perros compatibles cerca tuyo…</Text>
            </View>
          )}
        </View>
      </View>
      <Modal visible={Boolean(notice)} transparent animationType="fade" onRequestClose={() => setNotice(null)}>
        <View style={styles.backdrop}><View style={styles.modal}><Text style={styles.modalTitle}>{notice?.title}</Text><Text style={styles.modalBody}>{notice?.body}</Text><PrimaryButton label="Entendido" icon="checkmark" onPress={() => setNotice(null)} /></View></View>
      </Modal>
    </View>
  );
}

function Action({ icon, label, primary, disabled, theme, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; primary?: boolean; disabled?: boolean; theme: AppTheme; onPress: () => void }) {
  const size = primary ? 64 : 56;
  // El botón primario usa gradiente metálico + halo dorado; los secundarios
  // un glow suave. Es lo que da la sensación de relieve y brillo real.
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ alignItems: 'center', gap: 4, opacity: disabled ? 0.4 : pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] })}>
    <View style={{
      width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      backgroundColor: primary ? 'transparent' : theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.borderStrong,
      shadowColor: theme.colors.primary, shadowOpacity: primary ? 0.55 : 0.25,
      shadowRadius: primary ? 16 : 9, shadowOffset: { width: 0, height: 0 }, elevation: primary ? 10 : 5,
    }}>
      {primary ? (
        <LinearGradient colors={theme.gradients.metalGoldSoft} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      ) : null}
      <Ionicons name={icon} size={primary ? 29 : 25} color={primary ? theme.colors.onPrimary : theme.colors.primary} />
    </View>
    <Text style={{ color: theme.colors.text, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
  </Pressable>;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    safeArea: { flex: 1, width: '100%', maxWidth: theme.layout.maxPhoneWidth, alignSelf: 'center', paddingHorizontal: theme.spacing.lg },
    header: { minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
    headerSpacer: { width: 58 },
    brand: { flex: 1, alignItems: 'center' },
    brandName: { color: theme.colors.primary, fontWeight: '900', fontSize: 17, letterSpacing: 2 },
    brandNameLarge: { fontSize: 21, letterSpacing: 2.6 },
    tagline: { color: theme.colors.textMuted, fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
    profileChip: { width: 58, alignItems: 'center', gap: 2 },
    avatar: { width: 38, height: 38, borderRadius: 19 },
    initial: { width: 38, height: 38, borderRadius: 19, textAlign: 'center', textAlignVertical: 'center', color: theme.colors.primary, backgroundColor: theme.colors.primaryFaded, fontWeight: '900' },
    profileName: { maxWidth: 58, color: theme.colors.text, fontSize: 10, fontWeight: '800' },
    main: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingBottom: theme.spacing.md },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.spacing.md, paddingHorizontal: theme.spacing.xl },
    cardStack: { position: 'relative' },
    // transform y opacity los controla backdropStyle (animado con el arrastre).
    backdropCard: { borderRadius: 28, overflow: 'hidden', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border },
    card: { borderRadius: 28, overflow: 'hidden', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.borderStrong, elevation: 7, shadowColor: theme.colors.shadow, shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 14 } },
    backdropImage: { width: '100%', opacity: 0.55 },
    undoButton: {
      flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center',
      marginTop: theme.spacing.sm, paddingVertical: 7, paddingHorizontal: 14,
      borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    undoText: {
      color: theme.colors.textSecondary, fontSize: 11, fontWeight: '800',
      textTransform: 'uppercase', letterSpacing: 0.5,
    },
    glare: { position: 'absolute', top: -40, left: 0, width: '55%', height: '160%', zIndex: 5 },
    swipeLabel: { position: 'absolute', top: 24, zIndex: 20 },
    likeLabel: { left: 20 },
    nopeLabel: { right: 20 },
    swipeLabelText: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 3, fontSize: 20, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
    petImage: { width: '100%', backgroundColor: theme.colors.surfaceAlt },
    cardBody: { flex: 1, padding: theme.spacing.lg, gap: 4 },
    titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    petName: { color: theme.colors.primary, fontSize: 28, fontWeight: '900' },
    age: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
    meta: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
    bio: { color: theme.colors.text, fontSize: 15, lineHeight: 21, marginTop: 4 },
    actions: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-around', paddingTop: theme.spacing.md },
    muted: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center' },
    emptyTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '900', textAlign: 'center' },
    backdrop: { flex: 1, backgroundColor: theme.colors.overlay, justifyContent: 'center', padding: theme.spacing.xl },
    modal: { backgroundColor: theme.colors.surface, borderRadius: 28, padding: theme.spacing.xl, gap: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.borderStrong },
    modalTitle: { color: theme.colors.primary, fontSize: 26, fontWeight: '900', textAlign: 'center' },
    modalBody: { color: theme.colors.textSecondary, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  });
}
