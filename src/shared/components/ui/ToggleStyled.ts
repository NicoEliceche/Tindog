// src/shared/components/ui/ToggleStyled.ts
import styled from 'styled-components';

export const ToggleWrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  cursor: pointer;
`;

export const ToggleLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  color: ${({ theme }) => theme.color.text};
`;

export const ToggleTrack = styled.button<{ $checked: boolean }>`
  position: relative;
  width: 3rem;
  height: 1.75rem;
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ theme, $checked }) => ($checked ? theme.color.primary : theme.color.neutral[700])};
  transition: background 0.2s ease;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const ToggleThumb = styled.span<{ $checked: boolean }>`
  position: absolute;
  top: 0.1875rem;
  left: ${({ $checked }) => ($checked ? 'calc(100% - 1.5625rem)' : '0.1875rem')};
  width: 1.375rem;
  height: 1.375rem;
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ theme }) => theme.color.textInverse};
  transition: left 0.2s ease;
`;
