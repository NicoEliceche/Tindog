// src/shared/components/layout/FloatingPawsBackground.tsx
'use client';

import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

type PawShade = 400 | 500;

interface PawConfig {
  id: number;
  shade: PawShade;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
  x5: number;
  y5: number;
  rotate0: number;
  rotate1: number;
  rotate2: number;
  duration: number;
  delay: number;
}

const PAW_PAIR_COUNT = 16;

const randomBetween = (min: number, max: number, index: number, salt: number) => {
  const seeded = Math.sin((index + 1) * 9283.17 + salt * 197.31) * 43758.5453;
  const value = min + (seeded - Math.floor(seeded)) * (max - min);
  // Redondeado para evitar que el último bit de precisión de Math.sin()
  // difiera entre el motor JS del servidor (SSR) y el del navegador,
  // lo cual produciría un hydration mismatch en los estilos inline.
  return Math.round(value * 10000) / 10000;
};

const createPawConfig = (index: number): PawConfig => ({
  id: index,
  shade: index % 3 === 0 ? 500 : 400,
  x0: randomBetween(0, 92, index, 1), y0: randomBetween(0, 92, index, 2),
  x1: randomBetween(0, 92, index, 3), y1: randomBetween(0, 92, index, 4),
  x2: randomBetween(0, 92, index, 5), y2: randomBetween(0, 92, index, 6),
  x3: randomBetween(0, 92, index, 7), y3: randomBetween(0, 92, index, 8),
  x4: randomBetween(0, 92, index, 9), y4: randomBetween(0, 92, index, 10),
  x5: randomBetween(0, 92, index, 11), y5: randomBetween(0, 92, index, 12),
  rotate0: randomBetween(-35, 35, index, 13), rotate1: randomBetween(90, 220, index, 14), rotate2: randomBetween(220, 420, index, 15),
  duration: randomBetween(10, 22, index, 16), delay: -randomBetween(0, 22, index, 17),
});

const pawBounce = keyframes`
  0% {
    transform: translate3d(var(--paw-x-0), var(--paw-y-0), 0) rotate(var(--paw-rotate-0));
  }

  20% {
    transform: translate3d(var(--paw-x-1), var(--paw-y-1), 0) rotate(var(--paw-rotate-1));
  }

  40% {
    transform: translate3d(var(--paw-x-2), var(--paw-y-2), 0) rotate(var(--paw-rotate-2));
  }

  60% {
    transform: translate3d(var(--paw-x-3), var(--paw-y-3), 0) rotate(var(--paw-rotate-1));
  }

  80% {
    transform: translate3d(var(--paw-x-4), var(--paw-y-4), 0) rotate(var(--paw-rotate-2));
  }

  100% {
    transform: translate3d(var(--paw-x-5), var(--paw-y-5), 0) rotate(var(--paw-rotate-0));
  }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  pointer-events: none;
  z-index: 5;
  overflow: hidden;
`;

const PawPair = styled.div<{ $shade: PawShade }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 2.25rem;
  height: 1.35rem;
  color: ${({ theme, $shade }) => theme.color.neutral[$shade]};
  opacity: 1;
  animation: ${pawBounce} var(--paw-duration) linear var(--paw-delay) infinite alternate;
  will-change: transform;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 1.9rem;
    height: 1.15rem;
  }
  @media (prefers-reduced-motion: reduce) { display: none; }
`;

const PawPrint = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: ${({ $side }) => ($side === 'left' ? '0' : '18%')};
  left: ${({ $side }) => ($side === 'left' ? '0' : '48%')};
  width: 45%;
  aspect-ratio: 1;
  background:
    radial-gradient(ellipse at 50% 68%, currentColor 0 18%, transparent 19%),
    radial-gradient(circle at 24% 42%, currentColor 0 9%, transparent 10%),
    radial-gradient(circle at 38% 24%, currentColor 0 9%, transparent 10%),
    radial-gradient(circle at 62% 24%, currentColor 0 9%, transparent 10%),
    radial-gradient(circle at 76% 42%, currentColor 0 9%, transparent 10%);
  background-repeat: no-repeat;
  user-select: none;
  opacity: 1;
  transform: rotate(${({ $side }) => ($side === 'left' ? '-12deg' : '12deg')});
`;

function pawCssVars(paw: PawConfig): React.CSSProperties {
  return {
    '--paw-x-0': `${paw.x0}vw`,
    '--paw-y-0': `${paw.y0}vh`,
    '--paw-x-1': `${paw.x1}vw`,
    '--paw-y-1': `${paw.y1}vh`,
    '--paw-x-2': `${paw.x2}vw`,
    '--paw-y-2': `${paw.y2}vh`,
    '--paw-x-3': `${paw.x3}vw`,
    '--paw-y-3': `${paw.y3}vh`,
    '--paw-x-4': `${paw.x4}vw`,
    '--paw-y-4': `${paw.y4}vh`,
    '--paw-x-5': `${paw.x5}vw`,
    '--paw-y-5': `${paw.y5}vh`,
    '--paw-rotate-0': `${paw.rotate0}deg`,
    '--paw-rotate-1': `${paw.rotate1}deg`,
    '--paw-rotate-2': `${paw.rotate2}deg`,
    '--paw-duration': `${paw.duration}s`,
    '--paw-delay': `${paw.delay}s`,
  } as React.CSSProperties;
}

export function FloatingPawsBackground() {
  const paws = useMemo(() => {
    return Array.from({ length: PAW_PAIR_COUNT }, (_, index) => createPawConfig(index));
  }, []);

  return (
    <Container aria-hidden="true">
      {paws.map((paw) => (
        <PawPair key={paw.id} $shade={paw.shade} style={pawCssVars(paw)}>
          <PawPrint $side="left" />
          <PawPrint $side="right" />
        </PawPair>
      ))}
    </Container>
  );
}
