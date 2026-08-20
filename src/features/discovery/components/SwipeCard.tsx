// src/features/discovery/components/SwipeCard.tsx
'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  type MotionValue, type PanInfo, useMotionValue, useReducedMotion, useSpring, useTransform,
} from 'framer-motion';
import type { Pet } from '@core/types/pet.types';
import {
  Card, CardGlare, CardShine, LabelConnect, LabelPass, PetBody, PetImage, Spark, SparkBurst,
} from './SwipeCardStyled';

export type SwipeDirection = 'left' | 'right';

/**
 * Fracción del ancho de la tarjeta que hay que recorrer para que el swipe
 * se confirme. Tinder usa una proporción (no píxeles fijos) para que el
 * gesto pida el mismo esfuerzo relativo en un teléfono chico y en desktop.
 */
/** Margen en pixeles para distinguir un toque de un arrastre minimo. */
const TAP_SLOP = 8;

const SWIPE_RATIO = 0.32;
/** Flick corto pero rápido: la velocidad sola alcanza para confirmar. */
const FLICK_VELOCITY = 520;
/** Ángulo máximo de rotación, en grados, al llegar al borde de la pantalla. */
const MAX_ROTATION = 18;
const SPARK_COUNT = 14;

interface SwipeCardProps {
  pet: Pet;
  onSwipe: (direction: SwipeDirection, pet: Pet) => void;
  /** Toque sin arrastre: abre la ficha completa. */
  onTap?: () => void;
  /** Progreso del arrastre (-1..1) para que el padre anime el stack. */
  /**
   * Progreso del arrastre, de -1 a 1, como MotionValue.
   *
   * No es una función que reciba el número: llamarla en cada frame obligaba
   * a un cambio de estado de React por movimiento del puntero, y con eso se
   * re-renderizaba la pantalla entera —fondo animado incluido— mientras la
   * tarjeta trataba de seguir al mouse. El resultado se veía a los saltos.
   * Un MotionValue lo actualiza fuera del ciclo de React.
   */
  dragProgress?: MotionValue<number>;
}

/**
 * Tarjeta arrastrable con la mecánica de Tinder:
 *
 * - **Pivote en el dedo**: la rotación no ocurre alrededor del centro sino
 *   del punto donde el usuario agarró la tarjeta. Agarrarla de abajo la hace
 *   girar al revés que agarrarla de arriba, que es exactamente lo que hace
 *   que el gesto se sienta como un objeto físico y no como una animación.
 * - **Umbral proporcional** al ancho, más atajo por velocidad (flick).
 * - **Arrastre libre en X e Y**, con la Y amortiguada.
 * - **Rebote elástico** al soltar sin llegar al umbral.
 */
export function SwipeCard({ pet, onSwipe, onTap, dragProgress }: SwipeCardProps) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState(false);
  const [flyOut, setFlyOut] = useState<SwipeDirection | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // -1 cuando se agarra el borde superior, +1 en el inferior. Invierte el
  // signo de la rotación, replicando el anchorPoint variable de Tinder.
  const grabSign = useRef(1);
  const [originY, setOriginY] = useState(0.5);

  // Ancho real de la tarjeta: define el umbral y la escala de la rotación.
  const widthRef = useRef(320);
  /** Mientras dura el arrastre se apagan los adornos que leen el layout. */
  const draggingRef = useRef(false);
  /** Si el puntero se movio lo suficiente como para no ser un toque. */
  const movedRef = useRef(false);

  const rotate = useTransform(x, (value) => {
    const span = widthRef.current * 1.6;
    const ratio = Math.max(-1, Math.min(1, value / span));
    return ratio * MAX_ROTATION * grabSign.current;
  });

  const connectOpacity = useTransform(x, [24, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -24], [1, 0]);

  // Tilt 3D sutil mientras el puntero recorre la tarjeta (sin arrastrar).
  const tiltX = useSpring(useMotionValue(0), { stiffness: 260, damping: 26 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 260, damping: 26 });

  const glareX = useTransform(x, [-320, 320], [130, -30]);
  const glareOpacity = useTransform(x, [-320, 0, 320], [0.55, 0.18, 0.55]);

  /**
   * Inclinación 3D según dónde está el puntero sobre la tarjeta.
   *
   * `getBoundingClientRect` obliga al navegador a recalcular el layout, y
   * durante el arrastre eso ocurría en cada movimiento del mouse sobre un
   * elemento que se está moviendo: el gesto se entrecortaba. Ahora la caja
   * se mide una vez al entrar y el adorno se apaga mientras se arrastra,
   * que es cuando la tarjeta ya tiene su propia rotación.
   */
  const boxRef = useRef<DOMRect | null>(null);

  const handlePointerEnter = useCallback(() => {
    if (reduceMotion || !cardRef.current) return;
    boxRef.current = cardRef.current.getBoundingClientRect();
  }, [reduceMotion]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || draggingRef.current) return;
    const rect = boxRef.current;
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 12);
    tiltX.set(-py * 12);
  }, [reduceMotion, tiltX, tiltY]);

  const resetTilt = useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
  }, [tiltX, tiltY]);

  /** Al empezar a arrastrar fijamos el pivote donde está el dedo. */
  const handleDragStart = useCallback((event: MouseEvent | TouchEvent | PointerEvent) => {
    const node = cardRef.current;
    if (!node) return;
    draggingRef.current = true;
    // Única lectura del layout en todo el gesto: de acá salen el ancho para
    // el umbral y el punto donde se agarró la tarjeta.
    const rect = node.getBoundingClientRect();
    widthRef.current = rect.width;
    boxRef.current = rect;

    const clientY = 'clientY' in event
      ? event.clientY
      : (event as TouchEvent).touches?.[0]?.clientY ?? rect.top + rect.height / 2;

    const relativeY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    setOriginY(relativeY);
    // Agarrar la mitad inferior invierte el sentido del giro.
    grabSign.current = relativeY > 0.5 ? -1 : 1;
    resetTilt();
  }, [resetTilt]);

  const handleDrag = useCallback((_: unknown, info: PanInfo) => {
    if (!dragProgress) return;
    const threshold = widthRef.current * SWIPE_RATIO;
    dragProgress.set(Math.max(-1, Math.min(1, info.offset.x / threshold)));
  }, [dragProgress]);

  const commit = useCallback((direction: SwipeDirection) => {
    setFlyOut(direction);
    if (direction === 'right' && !reduceMotion) setBurst(true);
    dragProgress?.set(0);
    // Damos tiempo a la animación de salida antes de avisar al padre,
    // que es quien desmonta esta tarjeta y monta la siguiente.
    window.setTimeout(() => onSwipe(direction, pet), reduceMotion ? 0 : 280);
  }, [dragProgress, onSwipe, pet, reduceMotion]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    // Un arrastre, por corto que sea, no cuenta como toque: si no, soltar la
    // tarjeta en el medio abriria la ficha sin querer.
    movedRef.current = Math.abs(info.offset.x) > TAP_SLOP || Math.abs(info.offset.y) > TAP_SLOP;
    draggingRef.current = false;
    resetTilt();
    const threshold = widthRef.current * SWIPE_RATIO;
    const passedDistance = Math.abs(info.offset.x) > threshold;
    const flicked = Math.abs(info.velocity.x) > FLICK_VELOCITY;

    if (passedDistance || flicked) {
      commit(info.offset.x > 0 ? 'right' : 'left');
    } else {
      // No llegó: framer devuelve la tarjeta con el spring de dragTransition.
      dragProgress?.set(0);
    }
  }, [commit, dragProgress, resetTilt]);

  const sparks = Array.from({ length: SPARK_COUNT }, (_, i) => {
    const angle = (i / SPARK_COUNT) * Math.PI * 2;
    return { id: i, dx: Math.cos(angle) * (90 + (i % 4) * 26), dy: Math.sin(angle) * (90 + (i % 3) * 22) };
  });

  return (
    <Card
      ref={cardRef}
      style={{
        x,
        y,
        rotate,
        rotateX: tiltX,
        rotateY: tiltY,
        // El pivote sigue al dedo en el eje vertical.
        originY,
      }}
      // El arrastre es la forma principal de usar la pantalla, así que se
      // mantiene siempre. `prefers-reduced-motion` sólo apaga los adornos
      // (tilt, chispas, duraciones), nunca la interacción en sí.
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={{ left: 1, right: 1, top: 0.35, bottom: 0.35 }}
      onTap={() => { if (!movedRef.current) onTap?.(); movedRef.current = false; }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      whileTap={{ scale: reduceMotion ? 1 : 1.02 }}
      animate={flyOut
        ? {
            x: flyOut === 'right' ? 720 : -720,
            y: 60,
            opacity: 0,
            transition: { duration: reduceMotion ? 0 : 0.32, ease: [0.32, 0, 0.67, 0] },
          }
        : undefined}
      // Rebote elástico al soltar sin confirmar.
      dragTransition={{ bounceStiffness: 320, bounceDamping: 22 }}
      // `transition` sólo gobierna las animaciones declaradas en `animate`
      // (la salida al confirmar). Durante el arrastre la tarjeta tiene que
      // seguir al puntero sin intermediarios: con un resorte de por medio
      // cada movimiento del mouse disparaba una animación hacia la posición
      // nueva y el recorrido se veía a los saltos.
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    >
      <CardShine />
      <CardGlare style={{ x: glareX, opacity: glareOpacity }} />

      <LabelConnect style={{ opacity: connectOpacity }}>Conectar</LabelConnect>
      <LabelPass style={{ opacity: passOpacity }}>Pasar</LabelPass>

      <PetImage src={pet.photos[0]} alt={pet.name} draggable={false} />
      <PetBody>
        <div className="title-row">
          <h2>{pet.name}</h2>
          <strong>{pet.age}</strong>
        </div>
        <div className="meta">{pet.breed} · {pet.gender} · cerca de ti</div>
        <p>{pet.bio}</p>
      </PetBody>

      {burst ? (
        <SparkBurst>
          {sparks.map((spark) => (
            <Spark
              key={spark.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: spark.dx, y: spark.dy, scale: 0.2 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
            />
          ))}
        </SparkBurst>
      ) : null}
    </Card>
  );
}
