import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import type { AppTheme } from '../../core/theme/tokens';

const AURORA_COUNT = 5;
/** Cada "paw" dibuja un par de huellas, como un paso. */
const PAW_COUNT = 18;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
/** Valor con signo aleatorio, evitando magnitudes casi nulas. */
const signed = (min: number, max: number) => (Math.random() < 0.5 ? -1 : 1) * rand(min, max);

interface DrifterSpec {
  id: number;
  size: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  duration: number;
  colorKey: 'glow' | 'glowSoft' | 'primaryFaded';
}

interface PawSpec {
  id: number;
  size: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  duration: number;
  rotation: number;
  opacity: number;
}

/**
 * Mancha de aurora que recorre la pantalla. Cada una recibe un vector de
 * desplazamiento propio, así que todas van en direcciones distintas y sus
 * ciclos (de duraciones dispares) no se sincronizan.
 */
function AuroraOrb({ spec, color, disabled }: { spec: DrifterSpec; color: string; disabled: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (disabled) return;
    progress.value = withRepeat(
      withTiming(1, { duration: spec.duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [disabled, spec.duration, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * spec.dx },
      { translateY: progress.value * spec.dy },
      { scale: 1 + progress.value * 0.18 },
    ],
    opacity: 0.34 + progress.value * 0.2,
  }));

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: spec.size,
          height: spec.size,
          borderRadius: spec.size / 2,
          left: spec.startX,
          top: spec.startY,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

/** Contorno de una huella suelta: almohadilla + cuatro dedos. */
function PawPrint({ size, color }: { size: number; color: string }) {
  const toe = (toeSize: number, left: number, top: number) => ({
    position: 'absolute' as const,
    width: toeSize,
    height: toeSize * 1.15,
    borderRadius: toeSize,
    borderWidth: 1.5,
    borderColor: color,
    left,
    top,
  });

  return (
    <View style={{ position: 'absolute', width: size, height: size }}>
      {/* Almohadilla */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: size * 0.2,
        width: size * 0.6,
        height: size * 0.48,
        borderRadius: size * 0.3,
        borderWidth: 1.5,
        borderColor: color,
      }} />
      {/* Dedos */}
      <View style={toe(size * 0.2, size * 0.02, size * 0.2)} />
      <View style={toe(size * 0.21, size * 0.28, size * 0.02)} />
      <View style={toe(size * 0.21, size * 0.56, size * 0.02)} />
      <View style={toe(size * 0.2, size * 0.82, size * 0.2)} />
    </View>
  );
}

/**
 * Par de huellas doradas que ronda el fondo girando despacio. Van de a dos
 * y desfasadas, como el paso de un perro, no como una huella suelta.
 */
function FloatingPaw({ spec, color, disabled }: { spec: PawSpec; color: string; disabled: boolean }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (disabled) return;
    progress.value = withRepeat(
      withTiming(1, { duration: spec.duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(progress);
  }, [disabled, spec.duration, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * spec.dx },
      { translateY: progress.value * spec.dy },
      { rotate: `${spec.rotation + progress.value * 40}deg` },
    ],
    opacity: spec.opacity + progress.value * 0.12,
  }));

  // Las dos huellas comparten el tamaño base y se separan en diagonal, cada
  // una girada al revés que la otra para que el par se lea como una pisada.
  const print = spec.size * 0.82;

  return (
    <Animated.View
      style={[
        styles.paw,
        { left: spec.startX, top: spec.startY, width: spec.size * 1.7, height: spec.size * 1.6 },
        style,
      ]}
    >
      <View style={{ position: 'absolute', left: 0, top: spec.size * 0.42, transform: [{ rotate: '-10deg' }] }}>
        <PawPrint size={print} color={color} />
      </View>
      <View style={{ position: 'absolute', left: spec.size * 0.72, top: 0, transform: [{ rotate: '10deg' }] }}>
        <PawPrint size={print} color={color} />
      </View>
    </Animated.View>
  );
}

/**
 * Fondo vivo de la app: auroras doradas que derivan libremente por toda la
 * pantalla en direcciones independientes, más contornos de patitas que
 * rondan girando. Corre en el hilo de UI vía Reanimated y respeta la
 * preferencia de movimiento reducido del sistema.
 */
export function AuroraBackground({ theme }: { theme: AppTheme }) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();

  // Trayectorias generadas una sola vez por montaje: cada elemento arranca
  // en un punto al azar y se desplaza en su propia dirección.
  const auroras = useMemo<DrifterSpec[]>(() => Array.from({ length: AURORA_COUNT }, (_, i) => {
    // Con más manchas conviene achicarlas para que el fondo respire.
    const size = Math.max(width, height) * rand(0.55, 0.9);
    return {
      id: i,
      size,
      startX: rand(-size * 0.35, width - size * 0.4),
      startY: rand(-size * 0.35, height - size * 0.4),
      dx: signed(width * 0.18, width * 0.42),
      dy: signed(height * 0.12, height * 0.3),
      duration: rand(9000, 17000),
      colorKey: (['glow', 'glowSoft', 'primaryFaded'] as const)[i % 3],
    };
  }), [width, height]);

  const paws = useMemo<PawSpec[]>(() => Array.from({ length: PAW_COUNT }, (_, i) => {
    const size = rand(30, 54);
    return {
      id: i,
      size,
      startX: rand(0, Math.max(1, width - size)),
      startY: rand(0, Math.max(1, height - size)),
      dx: signed(width * 0.16, width * 0.46),
      dy: signed(height * 0.14, height * 0.38),
      duration: rand(7000, 14000),
      rotation: rand(0, 360),
      opacity: rand(0.14, 0.28),
    };
  }), [width, height]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={theme.gradients.app} style={StyleSheet.absoluteFill} />
      {auroras.map((spec) => (
        <AuroraOrb
          key={spec.id}
          spec={spec}
          color={theme.colors[spec.colorKey]}
          disabled={reduceMotion}
        />
      ))}
      {paws.map((spec) => (
        <FloatingPaw key={spec.id} spec={spec} color={theme.colors.primary} disabled={reduceMotion} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute' },
  paw: { position: 'absolute' },
});
