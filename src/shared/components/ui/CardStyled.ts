// src/shared/components/ui/CardStyled.ts
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';

export const StyledCard = styled(motion.div)<{ $variant: 'surface' | 'glass'; $padding: string; $interactive: boolean }>`
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ $padding }) => $padding};
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme, $variant }) => ($variant === 'glass' ? theme.color.glass : theme.color.surface)};
  ${({ $variant, theme }) => $variant === 'glass' && css`
    backdrop-filter: blur(18px);
    border-color: ${theme.color.glassBorder};
  `}

  ${({ $interactive, theme }) => $interactive && css`
    cursor: pointer;
    transition: box-shadow 0.2s ease, border-color 0.2s ease;

    &:hover, &:focus-visible {
      box-shadow: ${theme.elevation.md};
      border-color: ${theme.color.borderFocus};
    }

    &:focus-visible {
      outline: 3px solid ${theme.color.primaryFaded};
      outline-offset: 2px;
    }
  `}
`;
