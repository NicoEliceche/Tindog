// src/shared/components/ui/MetalText.tsx
'use client';

import styled, { css, keyframes } from 'styled-components';

const sheenSweep = keyframes`
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

/**
 * Texto con relleno de gradiente metálico dorado. A diferencia de un color
 * plano (que sobre fondos claros lee como mostaza), el gradiente produce
 * highlights y sombras dentro de la propia letra, que es lo que el ojo
 * interpreta como "metal".
 *
 * `$shimmer` agrega un barrido de luz que recorre el texto en loop.
 */
export const MetalText = styled.span<{ $shimmer?: boolean }>`
  background: ${({ theme }) => theme.color.metalGold};
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  display: inline-block;

  ${({ $shimmer }) => $shimmer && css`
    animation: ${sheenSweep} 4.5s linear infinite;
  `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
