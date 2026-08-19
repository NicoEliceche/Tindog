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
  /* Abajo a la derecha en todos los tamanos, apoyado sobre la barra fija:
     64px de barra, el area segura y 5px de aire. */
  bottom: calc(64px + env(safe-area-inset-bottom) + 5px);
  left: 12px;
  right: 12px;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  pointer-events: none;

  align-items: flex-end;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    left: auto;
    right: ${({ theme }) => theme.spacing[6]};
    width: min(24rem, calc(100vw - 3rem));
  }

  /* En escritorio no hay barra inferior: el aviso baja al borde. */
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    bottom: ${({ theme }) => theme.spacing[6]};
  }
`;

export const Item = styled(motion.div)<{ $tone: 'info' | 'success' | 'error' }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.xl};
  /* Los tonos llevan fondo propio y no solo un borde: el aviso se lee de
     un vistazo sin tener que leer el texto. */
  background: ${({ theme, $tone }) => (
    $tone === 'error' ? theme.color.errorSolid
      : $tone === 'success' ? theme.color.successSolid
        : theme.color.surface
  )};
  border: 1px solid ${({ theme, $tone }) => (
    $tone === 'error' ? theme.color.error
      : $tone === 'success' ? theme.color.success
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
      $tone === 'info' ? theme.color.primary : theme.color.text
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
