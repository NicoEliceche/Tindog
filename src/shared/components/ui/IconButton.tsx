// src/shared/components/ui/IconButton.tsx
'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { motion as motionTokens } from '@core/theme/motion';
import { StyledIconButton } from './IconButtonStyled';

export type IconButtonSize = 'sm' | 'md' | 'lg';
export type IconButtonVariant = 'ghost' | 'filled' | 'outline';

const iconSizeMap: Record<IconButtonSize, number> = { sm: 16, md: 20, lg: 24 };

export interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function IconButton({ icon: Icon, label, onClick, size = 'md', variant = 'ghost', disabled, className, type = 'button' }: IconButtonProps) {
  const reduceMotion = useReducedMotion();

  return (
    <StyledIconButton
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      $size={size}
      $variant={variant}
      className={className}
      whileHover={!reduceMotion && !disabled ? { scale: 1.06 } : undefined}
      whileTap={!reduceMotion && !disabled ? { scale: 0.94 } : undefined}
      transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.standard }}
    >
      <Icon size={iconSizeMap[size]} strokeWidth={2.2} />
    </StyledIconButton>
  );
}
