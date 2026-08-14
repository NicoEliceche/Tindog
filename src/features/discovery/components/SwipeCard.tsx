// src/features/discovery/components/SwipeCard.tsx
'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  type PanInfo, useMotionValue, useReducedMotion, useSpring, useTransform,
} from 'framer-motion';
import type { Pet } from '@core/types/pet.types';
import {
  Card, CardGlare, CardShine, LabelConnect, LabelPass, PetBody, PetImage, Spark, SparkBurst,
} from './SwipeCardStyled';

export type SwipeDirection = 'left' | 'right';

const SWIPE_DISTANCE = 110;
const SWIPE_POWER = 6000;
const SPARK_COUNT = 14;

interface SwipeCardProps {
  pet: Pet;
  onSwipe: (direction: SwipeDirection, pet: Pet) => void;
}

/**
 * Tarjeta arrastrable estilo Tinder con física de objeto real:
 * - rotación proporcional al desplazamiento horizontal
 * - tilt 3D que sigue la posición del puntero sobre la tarjeta
 * - glare metálico que se desplaza con la inclinación
 * - burst de chispas doradas al conectar
 */
export function SwipeCard({ pet, onSwipe }: SwipeCardProps) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Tilt 3D: el puntero inclina la tarjeta como si fuese una placa física.
  const tiltX = useSpring(useMotionValue(0), { stiffness: 260, damping: 26 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 260, damping: 26 });

  const rotate = useTransform(x, [-320, 0, 320], [-20, 0, 20]);
  const connectOpacity = useTransform(x, [30, 130], [0, 1]);
  const passOpacity = useTransform(x, [-130, -30], [1, 0]);

  // El glare se mueve según el arrastre + la inclinación del puntero.
  const glareX = useTransform(x, [-320, 320], [130, -30]);
  const glareOpacity = useTransform(x, [-320, 0, 320], [0.55, 0.18, 0.55]);

  const [flyOut, setFlyOut] = useState<SwipeDirection | null>(null);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 14);
    tiltX.set(-py * 14);
  }, [reduceMotion, tiltX, tiltY]);

  const resetTilt = useCallback(() => {
    tiltX.set(0);
    tiltY.set(0);
  }, [tiltX, tiltY]);

  const commit = useCallback((direction: SwipeDirection) => {
    setFlyOut(direction);
    if (direction === 'right' && !reduceMotion) setBurst(true);
    // Damos tiempo a la animación de salida antes de avisar al padre,
    // que es quien desmonta esta tarjeta y monta la siguiente.
    window.setTimeout(() => onSwipe(direction, pet), reduceMotion ? 0 : 260);
  }, [onSwipe, pet, reduceMotion]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    resetTilt();
    const power = info.offset.x * info.velocity.x;
    if (info.offset.x > SWIPE_DISTANCE || power > SWIPE_POWER) commit('right');
    else if (info.offset.x < -SWIPE_DISTANCE || power < -SWIPE_POWER) commit('left');
  }, [commit, resetTilt]);

  // Chispas: posiciones deterministas en abanico.
  const sparks = Array.from({ length: SPARK_COUNT }, (_, i) => {
    const angle = (i / SPARK_COUNT) * Math.PI * 2;
    return { id: i, dx: Math.cos(angle) * (90 + (i % 4) * 26), dy: Math.sin(angle) * (90 + (i % 3) * 22) };
  });

  return (
    <Card
      ref={cardRef}
      style={{ x, y, rotate, rotateX: tiltX, rotateY: tiltY }}
      drag={reduceMotion ? false : 'x'}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.65}
      onDragEnd={handleDragEnd}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      whileTap={{ scale: reduceMotion ? 1 : 1.02 }}
      animate={flyOut
        ? { x: flyOut === 'right' ? 700 : -700, opacity: 0, transition: { duration: reduceMotion ? 0 : 0.3, ease: 'easeIn' } }
        : undefined}
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
