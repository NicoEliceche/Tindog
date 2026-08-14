// src/shared/components/notifications/NotificationBellStyled.ts
import { motion } from 'framer-motion';
import styled from 'styled-components';

export const Root = styled.div`
  position: relative;
  display: inline-flex;
`;

export const BellButton = styled.button<{ $open: boolean }>`
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${({ theme, $open }) => ($open ? theme.color.primary : theme.color.textSecondary)};
  background: ${({ theme, $open }) => ($open ? theme.color.primaryFaded : theme.color.surface)};
  border: 1px solid ${({ theme, $open }) => ($open ? theme.color.borderFocus : theme.color.border)};
  transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.color.primary};
    border-color: ${({ theme }) => theme.color.borderFocus};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.primary};
    outline-offset: 2px;
  }
`;

/** Contador de no leídas, anclado al borde del botón. */
export const Badge = styled(motion.span)`
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: ${({ theme }) => theme.color.metalGoldSoft};
  color: ${({ theme }) => theme.color.textInverse};
  border: 2px solid ${({ theme }) => theme.color.background};
  font-size: 0.6rem;
  font-weight: 900;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  box-shadow: ${({ theme }) => theme.glow.soft};
`;

/**
 * Capa que cierra el panel al tocar afuera. Va detrás del panel pero
 * delante del resto para capturar el click en cualquier lado.
 */
export const Dismiss = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2500;
`;

export const Panel = styled(motion.div)`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 2600;
  width: min(360px, calc(100vw - 32px));
  max-height: min(60vh, 460px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.borderFocus};
  box-shadow: ${({ theme }) => theme.elevation.lg}, ${({ theme }) => theme.glow.soft};
`;

export const PanelHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};

  h2 {
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.extrabold};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  button {
    color: ${({ theme }) => theme.color.primary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    transition: opacity 0.2s ease;
  }

  button:hover {
    opacity: 0.75;
  }

  button:disabled {
    color: ${({ theme }) => theme.color.textTertiary};
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const List = styled.ul`
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

export const Item = styled(motion.li)<{ $unread: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme, $unread }) => ($unread ? theme.color.primaryFaded : 'transparent')};
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${({ theme }) => theme.color.surfaceRaised};
  }

  a {
    display: flex;
    align-items: flex-start;
    gap: ${({ theme }) => theme.spacing[3]};
    padding: ${({ theme }) => theme.spacing[4]};
    text-align: left;
    width: 100%;
  }
`;

/** Avatar o, cuando el evento no tiene foto, el ícono del tipo. */
export const ItemIcon = styled.div`
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 1px solid ${({ theme }) => theme.color.border};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const ItemCopy = styled.div`
  min-width: 0;
  flex: 1;

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
    /* Dos líneas como máximo: el detalle completo está en el destino. */
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

export const UnreadDot = styled.span`
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.primary};
  box-shadow: ${({ theme }) => theme.glow.subtle};
`;

export const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  text-align: center;
  color: ${({ theme }) => theme.color.textTertiary};

  svg {
    color: ${({ theme }) => theme.color.textTertiary};
    opacity: 0.5;
  }

  p {
    margin-top: ${({ theme }) => theme.spacing[2]};
    font-size: ${({ theme }) => theme.typography.size.sm};
  }
`;
