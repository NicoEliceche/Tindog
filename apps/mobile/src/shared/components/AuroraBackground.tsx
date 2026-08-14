import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions, type DimensionValue } from 'react-native';
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import type { AppTheme } from '../../core/theme/tokens';

const PAW_COUNT = 5;

interface PawSpec {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  rotate: number;
}

function seeded(n: number) {
  const x = Math.sin(n * 9283.17) * 43758.5453;
  return x - Math.floor(x);
}

const PAWS: PawSpec[] = Array.from({ length: PAW_COUNT }, (_, i) => ({
  id: i,
  left: 8 + seeded(i + 1) * 78,
  top: 8 + seeded(i + 11) * 78,
  size: 22 + seeded(i + 21) * 12,
  duration: 5200 + seeded(i + 31) * 4200,
  rotate: -22 + seeded(i + 41) * 44,
}));

/** Orbe de aurora que respira y deriva lentamente. */
function AuroraOrb({
  color, size, top, left, duration, disabled,
}: { color: string; size: number; top: DimensionValue; left: DimensionValue; duration: number; disabled: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (disabled) return;
    progress.value = withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(progress);
  }, [disabled, duration, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: 1 + progress.value * 0.16 },
      { translateX: progress.value * 18 },
      { translateY: progress.value * -14 },
    ],
    opacity: 0.38 + progress.value * 0.18,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        { width: size, height: size, borderRadius: size / 2, top, left, backgroundColor: color },
        style,
      ]}
    />
  );
}

/** Huella flotante que sube y baja suavemente. */
function FloatingPaw({ spec, color, disabled }: { spec: PawSpec; color: string; disabled: boolean }) {
  const drift = useSharedValue(0);

  useEffect(() => {
    if (disabled) return;
    drift.value = withRepeat(withTiming(1, { duration: spec.duration, easing: Easing.inOut(Easing.sin) }), -1, true);
    return () => cancelAnimation(drift);
  }, [disabled, spec.duration, drift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * -16 }, { rotate: `${spec.rotate}deg` }],
    opacity: 0.32 + drift.value * 0.2,
  }));

  const dot = (w: number, left: number, top: number) => ({
    position: 'absolute' as const,
    backgroundColor: color,
    width: w,
    height: w,
    borderRadius: w / 2,
    left,
    top,
  });

  return (
    <Animated.View
      style={[styles.paw, { left: `${spec.left}%`, top: `${spec.top}%`, width: spec.size, height: spec.size }, style]}
    >
      <View style={{
        position: 'absolute', backgroundColor: color, bottom: 0, left: spec.size * 0.25,
        width: spec.size * 0.5, height: spec.size * 0.4, borderRadius: spec.size * 0.25,
      }} />
      <View style={dot(spec.size * 0.22, spec.size * 0.06, 0)} />
      <View style={dot(spec.size * 0.22, spec.size * 0.38, -spec.size * 0.08)} />
      <View style={dot(spec.size * 0.22, spec.size * 0.7, 0)} />
    </Animated.View>
  );
}

/**
 * Fondo vivo: aurora dorada en movimiento sobre el gris cálido del theme,
 * con huellas flotantes. Todo corre en el UI thread vía Reanimated, así que
 * no compite con el JS de la app.
 */
export function AuroraBackground({ theme }: { theme: AppTheme }) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={theme.gradients.app} style={StyleSheet.absoluteFill} />
      <AuroraOrb color={theme.colors.glow} size={width * 1.05} top="-24%" left="-28%" duration={9000} disabled={reduceMotion} />
      <AuroraOrb color={theme.colors.glowSoft} size={width * 0.85} top="52%" left="38%" duration={12000} disabled={reduceMotion} />
      {PAWS.map((spec) => (
        <FloatingPaw key={spec.id} spec={spec} color={theme.colors.borderSubtle} disabled={reduceMotion} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute' },
  paw: { position: 'absolute' },
});
