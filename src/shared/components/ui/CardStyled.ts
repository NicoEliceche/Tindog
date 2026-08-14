// src/shared/components/ui/CardStyled.ts
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

export const StyledCard = styled(motion.div)<{ $variant: 'surface' | 'glass'; $padding: string; $interactive: boolean }>`
  position: relative;
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ $padding }) => $padding};
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme, $variant }) => ($variant === 'glass' ? theme.color.glass : theme.color.surface)};
  box-shadow: ${({ theme }) => theme.glow.inset};
  overflow: hidden;

  ${({ $variant, theme }) => $variant === 'glass' && css`
    backdrop-filter: blur(18px);
    border-color: ${theme.color.glassBorder};
  `}

  ${({ $interactive, theme }) => $interactive && css`
    cursor: pointer;
    transition: box-shadow 0.28s ease, border-color 0.28s ease, transform 0.2s ease;

    /* Barrido metálico al pasar el cursor. */
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: ${theme.color.metalSheen};
      background-size: 250% 250%;
      background-position: 120% 120%;
      opacity: 0;
      pointer-events: none;
      transition: background-position 0.7s ease, opacity 0.3s ease;
    }

    /* Halo dorado que respira alrededor del borde. */
    &::after {
      content: '';
      position: absolute;
      inset: -1px;
      border-radius: inherit;
      padding: 1px;
      background: ${theme.color.metalGoldSoft};
      -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    &:hover, &:focus-visible {
      box-shadow: ${theme.elevation.md}, ${theme.glow.soft}, ${theme.glow.inset};
      border-color: transparent;
    }

    &:hover::before, &:focus-visible::before {
      background-position: -20% -20%;
      opacity: 1;
    }

    &:hover::after, &:focus-visible::after {
      opacity: 1;
    }

    &:focus-visible {
      outline: 3px solid ${theme.color.primaryFaded};
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      &::before { display: none; }
    }
  `}
`;
