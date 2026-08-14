// src/shared/components/ui/Avatar.tsx
import React from 'react';
import { StyledAvatar } from './AvatarStyled';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ src, name, size = 'md', ring = false, className }: AvatarProps) {
  return (
    <StyledAvatar $size={size} $ring={ring} className={className}>
      {src ? <img src={src} alt={name} /> : getInitials(name)}
    </StyledAvatar>
  );
}
