// src/shared/components/ui/Card.tsx
'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';
import { motion as motionTokens } from '@core/theme/motion';
import { StyledCard } from './CardStyled';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'glass';
  padding?: string;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, variant = 'surface', padding = '1.5rem', interactive = false, className, onClick }: CardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      $interactive={interactive}
      className={className}
      onClick={onClick}
      role={interactive && onClick ? 'button' : undefined}
      tabIndex={interactive && onClick ? 0 : undefined}
      onKeyDown={interactive && onClick ? (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
      whileHover={interactive && !reduceMotion ? { y: -4 } : undefined}
      whileTap={interactive && !reduceMotion ? { scale: 0.98 } : undefined}
      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.standard }}
    >
      {children}
    </StyledCard>
  );
}
