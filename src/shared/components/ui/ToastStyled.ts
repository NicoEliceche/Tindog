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
  /* Centrado: con flex-start el texto de una sola linea quedaba pegado
     arriba, desalineado del icono y del boton de cerrar. */
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.xl};
  /* Los tonos llevan fondo propio y no solo un borde: el aviso se lee de
     un vistazo sin tener que leer el texto. */
  /* Translucido con desenfoque: deja ver el fondo animado por detras sin
     perder legibilidad. CC es 0.80, el punto mas transparente que deja el
     texto por encima de 4.5:1 con un tono dorado detras, ya difuminado por
     el desenfoque. A 0.75 cae a 4.5 y deja de cumplir. */
  background: ${({ theme, $tone }) => (
    $tone === 'error' ? `${theme.color.errorSolid}CC`
      : $tone === 'success' ? `${theme.color.successSolid}CC`
        : `${theme.color.surface}CC`
  )};
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
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
    color: ${({ theme, $tone }) => (
      $tone === 'info' ? theme.color.primary : theme.color.text
    )};
  }
`;

export const Copy = styled.div<{ $tone: 'info' | 'success' | 'error' }>`
  flex: 1;
  min-width: 0;

  strong {
    display: block;
    color: ${({ theme }) => theme.color.text};
    /* Dos pixeles mas que el sm del sistema (13): el aviso es texto suelto
       sobre color y agradece el cuerpo extra. */
    font-size: 0.9375rem;
    font-weight: ${({ theme }) => theme.typography.weight.bold};
  }

  p {
    margin-top: 2px;
    /* Sobre los tonos de color el cuerpo usa el texto principal: con el
       secundario, y el panel al 90%, caia a 3.3:1 sobre el peor fondo. */
    color: ${({ theme, $tone }) => ($tone === 'info' ? theme.color.textSecondary : theme.color.text)};
    /* Dos pixeles mas que el xs del sistema (11). */
    font-size: 0.8125rem;
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
