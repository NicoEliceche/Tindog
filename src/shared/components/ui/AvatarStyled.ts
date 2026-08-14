// src/shared/components/ui/AvatarStyled.ts
import styled, { css } from 'styled-components';
import type { AvatarSize } from './Avatar';

const sizeMap: Record<AvatarSize, string> = {
  sm: '2rem',
  md: '3rem',
  lg: '4.5rem',
};

const fontSizeMap: Record<AvatarSize, string> = {
  sm: '0.75rem',
  md: '1.1rem',
  lg: '1.6rem',
};

export const StyledAvatar = styled.div<{ $size: AvatarSize; $ring: boolean }>`
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border-radius: ${({ theme }) => theme.radius.full};
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.color.primaryFaded};
  color: ${({ theme }) => theme.color.primary};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  font-size: ${({ $size }) => fontSizeMap[$size]};
  position: relative;

  ${({ $ring, theme }) => $ring && css`
    box-shadow: 0 0 0 2px ${theme.color.background}, 0 0 0 4px ${theme.color.primary};
  `}

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
