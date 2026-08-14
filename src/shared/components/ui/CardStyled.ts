// src/shared/components/ui/CardStyled.ts
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

export const StyledCard = styled(motion.div)<{ $variant: 'surface' | 'glass'; $padding: string; $interactive: boolean }>`
  position: relative;
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ $padding }) => $padding};
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme, $variant }) => ($variant === 'glass' ? theme.color.glass : theme.color.surface)};
  overflow: hidden;
  ${({ $variant, theme }) => $variant === 'glass' && css`
    backdrop-filter: blur(18px);
    border-color: ${theme.color.glassBorder};
  `}

  ${({ $interactive, theme }) => $interactive && css`
    cursor: pointer;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(115deg, transparent 40%, ${theme.color.primaryFaded} 50%, transparent 60%);
      background-size: 250% 250%;
      background-position: 120% 120%;
      opacity: 0;
      pointer-events: none;
      transition: background-position 0.6s ease, opacity 0.3s ease;
    }

    &:hover, &:focus-visible {
      box-shadow: ${theme.elevation.md};
      border-color: ${theme.color.borderFocus};
    }

    &:hover::before, &:focus-visible::before {
      background-position: -20% -20%;
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
