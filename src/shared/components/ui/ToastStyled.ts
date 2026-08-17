// src/shared/components/ui/ToastStyled.ts
import { motion } from 'framer-motion';
import styled from 'styled-components';

/**
 * Los avisos se apilan sobre el contenido. En el teléfono aparecen arriba,
 * lejos del pulgar y de la barra inferior; desde sm bajan a la esquina
 * inferior derecha, que es donde se los busca en escritorio.
 */
export const Stack = styled.div`
  position: fixed;
  top: max(12px, env(safe-area-inset-top));
  left: 12px;
  right: 12px;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  pointer-events: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    top: auto;
    left: auto;
    bottom: ${({ theme }) => theme.spacing[6]};
    right: ${({ theme }) => theme.spacing[6]};
    width: min(24rem, calc(100vw - 3rem));
  }
`;

export const Item = styled(motion.div)<{ $tone: 'info' | 'success' | 'error' }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme, $tone }) => (
    $tone === 'error' ? theme.color.error
      : $tone === 'success' ? theme.color.borderFocus
        : theme.color.border
  )};
  box-shadow: ${({ theme }) => theme.elevation.lg}, ${({ theme }) => theme.glow.subtle};
  /* El contenedor no recibe eventos para no tapar la pantalla; cada aviso sí,
     porque se puede cerrar. */
  pointer-events: auto;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: ${({ theme, $tone }) => (
      $tone === 'error' ? theme.color.error : theme.color.primary
    )};
  }
`;

export const Copy = styled.div`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
  }

  p {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    line-height: 1.45;
  }
`;

export const Close = styled.button`
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.textTertiary};
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.color.text};
    background: ${({ theme }) => theme.color.surfaceRaised};
  }
`;
