import { Ionicons } from '@expo/vector-icons';
import Svg, { Line } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing, cancelAnimation, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { AppTheme } from '../../core/theme/tokens';

/**
 * Cuantos elementos lleva el fondo.
 *
 * Acá cada elemento es una vista animada de verdad, no una figura pintada
 * en un lienzo, así que la cuenta pesa todavía más que en la web. Bajaron a
 * la mitad, igual que allá: el motivo se sigue leyendo -las huellas, la red
 * de nodos, el halo dorado- pero más espaciado.
 */
const AURORA_COUNT = 3;
/** Nodos de la red: rombos que giran sobre su eje mientras derivan. */
const NODE_COUNT = 13;
/** Distancia bajo la cual dos nodos se unen con una línea. */
const LINK_DISTANCE = 120;
/** Cada "paw" dibuja un par de huellas, como un paso. */
const PAW_COUNT = 9;

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

interface NodeSpec {
  id: number;
  size: number;
  startX: number;
  startY: number;
  pathX: number[];
  pathY: number[];
  duration: number;
  rotation: number;
  /** 1 o -1: sentido de giro. */
  spinDirection: number;
  /** Milisegundos por vuelta completa. Fija la velocidad, que no cambia. */
  spinDuration: number;
}

interface PawSpec {
  id: number;
  size: number;
  startX: number;
  startY: number;
  /** Puntos de rebote sucesivos, relativos a la posición inicial. */
  pathX: number[];
  pathY: number[];
  duration: number;
  rotation: number;
  /** 1 o -1: sentido de giro. */
  spinDirection: number;
  /** Milisegundos por vuelta completa. Fija la velocidad, que no cambia. */
  spinDuration: number;
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

/**
 * Huella dorada. Antes se componía con Views redondeados —una almohadilla y
 * cuatro dedos—, pero a tamaño chico esos círculos se leían como burbujas y
 * no como una pata. El ícono del set tiene la silueta correcta y escala sin
 * deformarse.
 */
function PawPrint({ size, color }: { size: number; color: string }) {
  return <Ionicons name="paw-outline" size={size} color={color} />;
}

/**
 * Nodo de la red. Es un cuadrado rotado 45 grados —un rombo— porque en un
 * círculo el giro sobre el propio eje sería invisible.
 */
/**
 * Un nodo de la red.
 *
 * El desplazamiento se recibe desde afuera en vez de crearlo acá: las
 * líneas que unen los nodos tienen que leer las mismas posiciones para
 * seguirlos. Antes cada nodo movía valores propios y las líneas se
 * calculaban una sola vez sobre las posiciones iniciales, así que los
 * rombos se iban y las líneas quedaban flotando sueltas. En la web las
 * líneas se redibujan en cada cuadro junto con los puntos, y así se ve.
 */
function FloatingNode({ spec, color, disabled, tx, ty }: {
  spec: NodeSpec; color: string; disabled: boolean;
  tx: SharedValue<number>; ty: SharedValue<number>;
}) {
  const spin = useSharedValue(0);

  useEffect(() => {
    if (disabled) return;
    // Una vuelta exacta por ciclo. El signo decide el sentido y la duración
    // la velocidad, que queda fija: con un destino de varias vueltas, cada
    // repetición reiniciaba desde cero hacia un ángulo mayor y el giro se
    // veía cada vez más rápido cuanto más tiempo llevaba la app abierta.
    spin.value = withRepeat(
      withTiming(spec.spinDirection * 360, { duration: spec.spinDuration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => { cancelAnimation(spin); };
  }, [disabled, spec, spin]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${spec.rotation + spin.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: spec.startX,
          top: spec.startY,
          width: spec.size,
          height: spec.size,
          backgroundColor: color,
          opacity: 0.5,
        },
        style,
      ]}
    />
  );
}

/**
 * Par de huellas doradas que ronda el fondo girando despacio. Van de a dos
 * y desfasadas, como el paso de un perro, no como una huella suelta.
 */
function FloatingPaw({ spec, color, disabled }: { spec: PawSpec; color: string; disabled: boolean }) {
  // Cada tramo va hasta un punto distinto y ahí "rebota" hacia el
  // siguiente. Un withRepeat(..., true) sería un vaivén entre dos puntos
  // fijos, que se lee como un péndulo y no como movimiento libre.
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (disabled) return;
    const leg = (v: number) => withTiming(v, { duration: spec.duration, easing: Easing.inOut(Easing.sin) });
    tx.value = withRepeat(
      withSequence(...spec.pathX.map((v) => leg(v))),
      -1,
      false,
    );
    ty.value = withRepeat(
      withSequence(...spec.pathY.map((v) => leg(v))),
      -1,
      false,
    );
    // Una vuelta exacta por ciclo, siempre en el mismo sentido y a
    // velocidad constante (ver nota en FloatingNode).
    spin.value = withRepeat(
      withTiming(spec.spinDirection * 360, { duration: spec.spinDuration, easing: Easing.linear }),
      -1,
      false,
    );
    return () => { cancelAnimation(tx); cancelAnimation(ty); cancelAnimation(spin); };
  }, [disabled, spec, tx, ty, spin]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${spec.rotation + spin.value}deg` },
    ],
    opacity: spec.opacity,
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
/**
 * El desplazamiento de cada nodo, en un solo lugar.
 *
 * Los rombos y las líneas tienen que leer exactamente los mismos valores
 * para moverse juntos, así que viven acá y no dentro de cada rombo. La
 * cantidad es una constante, de modo que la lista de hooks no cambia entre
 * renders.
 */
function useNodeMotion(nodes: NodeSpec[], disabled: boolean) {
  const motion = Array.from({ length: NODE_COUNT }, () => ({
    // eslint-disable-next-line react-hooks/rules-of-hooks -- NODE_COUNT es fijo.
    tx: useSharedValue(0),
    // eslint-disable-next-line react-hooks/rules-of-hooks -- NODE_COUNT es fijo.
    ty: useSharedValue(0),
  }));

  useEffect(() => {
    if (disabled) return;
    nodes.forEach((spec, i) => {
      const leg = (v: number) => withTiming(v, { duration: spec.duration, easing: Easing.inOut(Easing.sin) });
      motion[i].tx.value = withRepeat(withSequence(...spec.pathX.map(leg)), -1, false);
      motion[i].ty.value = withRepeat(withSequence(...spec.pathY.map(leg)), -1, false);
    });
    return () => {
      motion.forEach(({ tx, ty }) => { cancelAnimation(tx); cancelAnimation(ty); });
    };
    // `motion` se recrea en cada render pero envuelve los mismos valores.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, nodes]);

  return motion;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);

/**
 * Una línea de la red, atada a los dos nodos que une.
 *
 * Lee los mismos valores que mueven a los rombos, así que los sigue cuadro
 * a cuadro sin volver al hilo de JavaScript. Es lo que hace la web, que
 * recalcula los enlaces dentro del bucle de dibujo.
 */
function NodeLink({ a, b, motion, stroke, width, opacity }: {
  a: NodeSpec; b: NodeSpec;
  motion: Array<{ tx: SharedValue<number>; ty: SharedValue<number> }>;
  stroke: string; width: number; opacity: number;
}) {
  const props = useAnimatedProps(() => ({
    x1: a.startX + a.size / 2 + motion[a.id].tx.value,
    y1: a.startY + a.size / 2 + motion[a.id].ty.value,
    x2: b.startX + b.size / 2 + motion[b.id].tx.value,
    y2: b.startY + b.size / 2 + motion[b.id].ty.value,
  }));

  return (
    <AnimatedLine
      animatedProps={props}
      stroke={stroke}
      strokeWidth={width}
      strokeOpacity={opacity}
    />
  );
}

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
      duration: rand(6000, 11333),
      colorKey: (['glow', 'glowSoft', 'primaryFaded'] as const)[i % 3],
    };
  }), [width, height]);

  const paws = useMemo<PawSpec[]>(() => Array.from({ length: PAW_COUNT }, (_, i) => {
    // El doble que antes, como en la web para telefono: la huella es sutil
    // de fondo y a este tamano se lee como motivo de marca.
    const size = rand(60, 108);
    const startX = rand(0, Math.max(1, width - size));
    const startY = rand(0, Math.max(1, height - size));
    // Cinco destinos al azar dentro de la pantalla; el último vuelve al
    // origen para que el ciclo cierre sin un salto brusco.
    const legs = 5;
    const pathX: number[] = [];
    const pathY: number[] = [];
    for (let leg = 0; leg < legs - 1; leg += 1) {
      pathX.push(rand(0, Math.max(1, width - size)) - startX);
      pathY.push(rand(0, Math.max(1, height - size)) - startY);
    }
    pathX.push(0);
    pathY.push(0);
    return {
      id: i,
      size,
      startX,
      startY,
      pathX,
      pathY,
      // El doble de rápido que antes, y fijo: menos milisegundos por vuelta.
      duration: rand(1400, 3000),
      rotation: rand(0, 360),
      spinDirection: Math.random() < 0.5 ? -1 : 1,
      spinDuration: rand(3000, 6000),
      opacity: rand(0.14, 0.28),
    };
  }), [width, height]);

  const nodes = useMemo<NodeSpec[]>(() => Array.from({ length: NODE_COUNT }, (_, i) => {
    // Al doble: a este tamano la red de puntos se lee como motivo y no como
    // ruido de fondo.
    const size = rand(8, 18);
    const startX = rand(0, Math.max(1, width - size));
    const startY = rand(0, Math.max(1, height - size));
    const pathX: number[] = [];
    const pathY: number[] = [];
    for (let leg = 0; leg < 4; leg += 1) {
      pathX.push(rand(0, Math.max(1, width - size)) - startX);
      pathY.push(rand(0, Math.max(1, height - size)) - startY);
    }
    pathX.push(0);
    pathY.push(0);
    return {
      id: i, size, startX, startY, pathX, pathY,
      // La mitad de duracion es el doble de velocidad.
      duration: rand(1667, 3667),
      rotation: rand(0, 360),
      spinDirection: Math.random() < 0.5 ? -1 : 1,
      spinDuration: rand(2000, 4333),
    };
  }), [width, height]);

  const nodeMotion = useNodeMotion(nodes, reduceMotion);

  /**
   * Qué nodos están lo bastante cerca como para unirse.
   *
   * Se guardan los nodos y no sus coordenadas: la línea las lee del
   * movimiento en cada cuadro. Antes se congelaban las posiciones iniciales
   * y los rombos se alejaban dejando las líneas sueltas.
   */
  const links = useMemo(() => {
    const result: Array<{ a: NodeSpec; b: NodeSpec }> = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        if (Math.hypot(a.startX - b.startX, a.startY - b.startY) < LINK_DISTANCE) {
          result.push({ a, b });
        }
      }
    }
    return result;
  }, [nodes]);

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
      <Svg style={[StyleSheet.absoluteFill]} pointerEvents="none">
        {links.map((link, index) => (
          <NodeLink
            key={index}
            a={link.a}
            b={link.b}
            motion={nodeMotion}
            // Sobre el fondo claro la linea fina y tenue desaparece: va mas
            // gruesa y con mas cuerpo, y con la tinta oscura del tema.
            stroke={theme.colors.canvasInk}
            width={theme.dark ? 1 : 2}
            opacity={theme.dark ? 0.16 : 0.34}
          />
        ))}
      </Svg>

      {nodes.map((spec) => (
        <FloatingNode key={`node-${spec.id}`} spec={spec} color={theme.colors.canvasInk} disabled={reduceMotion} tx={nodeMotion[spec.id].tx} ty={nodeMotion[spec.id].ty} />
      ))}

      {paws.map((spec) => (
        <FloatingPaw key={spec.id} spec={spec} color={theme.colors.canvasInk} disabled={reduceMotion} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute' },
  paw: { position: 'absolute' },
});
