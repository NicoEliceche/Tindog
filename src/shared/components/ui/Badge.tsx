// src/shared/components/ui/Badge.tsx
import React from 'react';
import { StyledBadge } from './BadgeStyled';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
}

export function Badge({ children, tone = 'primary', size = 'md', className }: BadgeProps) {
  return (
    <StyledBadge $tone={tone} $size={size} className={className}>
      {children}
    </StyledBadge>
  );
}
