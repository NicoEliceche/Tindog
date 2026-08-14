// src/shared/components/ui/IconButtonStyled.ts
import { motion } from 'framer-motion';
import styled, { css } from 'styled-components';
import type { IconButtonSize, IconButtonVariant } from './IconButton';

const sizeMap: Record<IconButtonSize, string> = {
  sm: '2.25rem',
  md: '2.75rem',
  lg: '3.25rem',
};

export const StyledIconButton = styled(motion.button)<{ $size: IconButtonSize; $variant: IconButtonVariant }>`
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border-radius: ${({ theme }) => theme.radius.full};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  ${({ theme, $variant }) => $variant === 'filled' && css`
    background: ${theme.color.primary};
    color: ${theme.color.textInverse};
  `}

  ${({ theme, $variant }) => $variant === 'outline' && css`
    background: transparent;
    border: 1px solid ${theme.color.border};
    color: ${theme.color.text};
  `}

  ${({ theme, $variant }) => $variant === 'ghost' && css`
    background: ${theme.color.surface};
    color: ${theme.color.textSecondary};
  `}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
