// src/shared/components/layout/CyberDogBackground.tsx
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

const PAW_PAIR_COUNT = 10;

const randomBetween = (min: number, max: number, index: number, salt: number) => {
  const seeded = Math.sin((index + 1) * 9283.17 + salt * 197.31) * 43758.5453;
  const value = min + (seeded - Math.floor(seeded)) * (max - min);
  // Redondeado a 4 decimales para que Math.sin() no difiera en el último
  // bit de precisión entre el motor JS del servidor y el del navegador
  // (evita hydration mismatch en los estilos inline).
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
  duration: randomBetween(14, 26, index, 16), delay: -randomBetween(0, 22, index, 17),
});

function pawCssVars(paw: PawConfig): React.CSSProperties {
  return {
    '--paw-x-0': `${paw.x0}vw`, '--paw-y-0': `${paw.y0}vh`,
    '--paw-x-1': `${paw.x1}vw`, '--paw-y-1': `${paw.y1}vh`,
    '--paw-x-2': `${paw.x2}vw`, '--paw-y-2': `${paw.y2}vh`,
    '--paw-x-3': `${paw.x3}vw`, '--paw-y-3': `${paw.y3}vh`,
    '--paw-x-4': `${paw.x4}vw`, '--paw-y-4': `${paw.y4}vh`,
    '--paw-x-5': `${paw.x5}vw`, '--paw-y-5': `${paw.y5}vh`,
    '--paw-rotate-0': `${paw.rotate0}deg`,
    '--paw-rotate-1': `${paw.rotate1}deg`,
    '--paw-rotate-2': `${paw.rotate2}deg`,
    '--paw-duration': `${paw.duration}s`,
    '--paw-delay': `${paw.delay}s`,
  } as React.CSSProperties;
}

// ── Keyframes ────────────────────────────────────────────────────────────
const pawBounce = keyframes`
  0%   { transform: translate3d(var(--paw-x-0), var(--paw-y-0), 0) rotate(var(--paw-rotate-0)); }
  20%  { transform: translate3d(var(--paw-x-1), var(--paw-y-1), 0) rotate(var(--paw-rotate-1)); }
  40%  { transform: translate3d(var(--paw-x-2), var(--paw-y-2), 0) rotate(var(--paw-rotate-2)); }
  60%  { transform: translate3d(var(--paw-x-3), var(--paw-y-3), 0) rotate(var(--paw-rotate-1)); }
  80%  { transform: translate3d(var(--paw-x-4), var(--paw-y-4), 0) rotate(var(--paw-rotate-2)); }
  100% { transform: translate3d(var(--paw-x-5), var(--paw-y-5), 0) rotate(var(--paw-rotate-0)); }
`;

const gridDrift = keyframes`
  0%   { background-position: 0 0, 0 0; }
  100% { background-position: 64px 64px, 64px 64px; }
`;

const scanSweep = keyframes`
  0%   { transform: translateY(-20%); opacity: 0; }
  8%   { opacity: 0.55; }
  50%  { opacity: 0.55; }
  92%  { opacity: 0; }
  100% { transform: translateY(120%); opacity: 0; }
`;

const orbFloat = keyframes`
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50%      { transform: translate3d(2%, -3%, 0) scale(1.06); }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
`;

// ── Layers ───────────────────────────────────────────────────────────────
const Container = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: ${({ theme }) => theme.color.background};
`;

const CircuitGrid = styled.div`
  position: absolute;
  inset: -64px;
  background-image:
    linear-gradient(${({ theme }) => theme.color.border} 1px, transparent 1px),
    linear-gradient(90deg, ${({ theme }) => theme.color.border} 1px, transparent 1px);
  background-size: 64px 64px;
  opacity: 0.35;
  animation: ${gridDrift} 40s linear infinite;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 75%);

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Orb = styled.div<{ $x: string; $y: string; $size: string; $tone: 'primary' | 'accent'; $delay: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border-radius: 50%;
  background: radial-gradient(circle, ${({ theme, $tone }) => ($tone === 'primary' ? theme.color.primary : theme.color.accent)} 0%, transparent 70%);
  opacity: 0.16;
  filter: blur(40px);
  animation: ${orbFloat} 18s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
  will-change: transform;

  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const ScanLine = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    ${({ theme }) => theme.color.primaryFaded} 45%,
    ${({ theme }) => theme.color.primary}22 50%,
    ${({ theme }) => theme.color.primaryFaded} 55%,
    transparent 100%
  );
  animation: ${scanSweep} 9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform, opacity;

  @media (prefers-reduced-motion: reduce) { display: none; }
`;

const CircuitNode = styled.div<{ $x: string; $y: string; $delay: string }>`
  position: absolute;
  left: ${({ $x }) => $x};
  top: ${({ $y }) => $y};
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.primary};
  box-shadow: 0 0 8px 2px ${({ theme }) => theme.color.primary};
  animation: ${pulseGlow} 3.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};

  @media (prefers-reduced-motion: reduce) { animation: none; opacity: 0.6; }
`;

const PawLayer = styled.div`
  position: absolute;
  inset: 0;
`;

const PawPair = styled.div<{ $shade: PawShade }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 2.25rem;
  height: 1.35rem;
  color: ${({ theme, $shade }) => theme.color.neutral[$shade]};
  opacity: 0.7;
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
  transform: rotate(${({ $side }) => ($side === 'left' ? '-12deg' : '12deg')});
`;

const NODE_POSITIONS: Array<{ x: string; y: string; delay: string }> = [
  { x: '8%', y: '14%', delay: '0s' }, { x: '22%', y: '38%', delay: '0.6s' },
  { x: '38%', y: '9%', delay: '1.2s' }, { x: '54%', y: '28%', delay: '0.3s' },
  { x: '68%', y: '12%', delay: '1.8s' }, { x: '82%', y: '34%', delay: '0.9s' },
  { x: '14%', y: '62%', delay: '1.5s' }, { x: '46%', y: '58%', delay: '0.4s' },
  { x: '76%', y: '64%', delay: '2.1s' }, { x: '92%', y: '48%', delay: '1.1s' },
];

export function CyberDogBackground() {
  const paws = useMemo(
    () => Array.from({ length: PAW_PAIR_COUNT }, (_, index) => createPawConfig(index)),
    [],
  );

  return (
    <Container aria-hidden="true">
      <CircuitGrid />
      <Orb $x="8%" $y="10%" $size="34vw" $tone="primary" $delay="0s" />
      <Orb $x="60%" $y="55%" $size="28vw" $tone="accent" $delay="-6s" />
      <ScanLine />
      {NODE_POSITIONS.map((node, index) => (
        <CircuitNode key={index} $x={node.x} $y={node.y} $delay={node.delay} />
      ))}
      <PawLayer>
        {paws.map((paw) => (
          <PawPair key={paw.id} $shade={paw.shade} style={pawCssVars(paw)}>
            <PawPrint $side="left" />
            <PawPrint $side="right" />
          </PawPair>
        ))}
      </PawLayer>
    </Container>
  );
}
