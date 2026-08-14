import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions, type DimensionValue } from 'react-native';
import Animated, {
  Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming,
} from 'react-native-reanimated';
import type { AppTheme } from '../../core/theme/tokens';

const PAW_COUNT = 6;

interface PawSpec {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  rotate: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9283.17) * 43758.5453;
  return x - Math.floor(x);
}

function buildPaws(): PawSpec[] {
  return Array.from({ length: PAW_COUNT }, (_, index) => ({
    id: index,
    left: 6 + seededRandom(index + 1) * 82,
    top: 6 + seededRandom(index + 11) * 82,
    size: 22 + seededRandom(index + 21) * 10,
    duration: 6000 + seededRandom(index + 31) * 5000,
    delay: seededRandom(index + 41) * 2000,
    rotate: -20 + seededRandom(index + 51) * 40,
  }));
}

function FloatingPaw({ spec, color }: { spec: PawSpec; color: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-14, { duration: spec.duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    return () => cancelAnimation(translateY);
  }, [spec.duration, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { rotate: `${spec.rotate}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.paw,
        { left: `${spec.left}%`, top: `${spec.top}%`, width: spec.size, height: spec.size },
        animatedStyle,
      ]}
    >
      <View style={[styles.pawDot, styles.pawDotCenter, { backgroundColor: color, width: spec.size * 0.5, height: spec.size * 0.4, borderRadius: spec.size * 0.25 }]} />
      <View style={[styles.pawDot, { backgroundColor: color, width: spec.size * 0.22, height: spec.size * 0.22, borderRadius: spec.size * 0.11, left: spec.size * 0.08, top: 0 }]} />
      <View style={[styles.pawDot, { backgroundColor: color, width: spec.size * 0.22, height: spec.size * 0.22, borderRadius: spec.size * 0.11, left: spec.size * 0.38, top: -spec.size * 0.08 }]} />
      <View style={[styles.pawDot, { backgroundColor: color, width: spec.size * 0.22, height: spec.size * 0.22, borderRadius: spec.size * 0.11, left: spec.size * 0.68, top: 0 }]} />
    </Animated.View>
  );
}

function GlowOrb({ color, size, top, left, duration }: { color: string; size: number; top: DimensionValue; left: DimensionValue; duration: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(withTiming(1.15, { duration, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(scale);
  }, [duration, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        styles.orb,
        { width: size, height: size, borderRadius: size / 2, top, left, backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

export function CyberDogBackground({ theme }: { theme: AppTheme }) {
  const { width, height } = useWindowDimensions();
  const paws = useMemo(() => buildPaws(), []);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { width, height }]}>
      <LinearGradient colors={theme.gradients.app} style={StyleSheet.absoluteFill} />
      <GlowOrb color={theme.colors.glow} size={width * 0.9} top="-12%" left="-20%" duration={9000} />
      <GlowOrb color={theme.colors.glowSoft} size={width * 0.7} top="55%" left="45%" duration={11000} />
      {paws.map((spec) => (
        <FloatingPaw key={spec.id} spec={spec} color={theme.colors.borderSubtle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', opacity: 0.5 },
  paw: { position: 'absolute', opacity: 0.5 },
  pawDot: { position: 'absolute' },
  pawDotCenter: { bottom: 0, left: '25%' },
});
