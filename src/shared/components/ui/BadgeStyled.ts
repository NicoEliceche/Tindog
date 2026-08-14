// src/shared/components/ui/BadgeStyled.ts
import styled, { type DefaultTheme } from 'styled-components';
import type { BadgeTone, BadgeSize } from './Badge';

const toneColor = (tone: BadgeTone) => ({ theme }: { theme: DefaultTheme }) => ({
  primary: theme.color.primary,
  success: theme.color.success,
  warning: theme.color.warning,
  error:   theme.color.error,
  info:    theme.color.info,
}[tone]);

const toneBackground = (tone: BadgeTone) => ({ theme }: { theme: DefaultTheme }) => ({
  primary: theme.color.primaryFaded,
  success: theme.color.successLight,
  warning: theme.color.warningLight,
  error:   theme.color.errorLight,
  info:    theme.color.infoLight,
}[tone]);

export const StyledBadge = styled.span<{ $tone: BadgeTone; $size: BadgeSize }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35em;
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  white-space: nowrap;
  color: ${(props) => toneColor(props.$tone)(props)};
  background: ${(props) => toneBackground(props.$tone)(props)};
  padding: ${({ $size }) => ($size === 'sm' ? '0.2rem 0.6rem' : '0.35rem 0.85rem')};
  font-size: ${({ theme, $size }) => ($size === 'sm' ? theme.typography.size.xs : theme.typography.size.sm)};
`;
