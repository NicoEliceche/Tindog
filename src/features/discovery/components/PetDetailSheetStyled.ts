// src/features/discovery/components/PetDetailSheetStyled.ts
import { motion } from 'framer-motion';
import styled from 'styled-components';

/**
 * La capa deja libre la barra inferior: desde la ficha se sigue navegando,
 * y taparla obligaría a cerrar para ir a otra sección.
 */
export const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  bottom: calc(64px + env(safe-area-inset-bottom));
  z-index: 3500;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 0 24px;
  background: ${({ theme }) => theme.color.overlay};
  backdrop-filter: blur(10px);

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    /* En escritorio no hay barra inferior. */
    bottom: 0;
    display: grid;
    place-items: start center;
    padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  }
`;

export const Sheet = styled(motion.div)`
  position: relative;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: 0 ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]};
  background: ${({ theme }) => theme.color.background};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: min(100%, 44rem);
    min-height: 0;
    border-radius: ${({ theme }) => theme.radius.xl};
    border: 1px solid ${({ theme }) => theme.color.border};
    box-shadow: ${({ theme }) => theme.elevation.lg};
    overflow: hidden;
    padding-bottom: ${({ theme }) => theme.spacing[8]};
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.text};
  background: ${({ theme }) => theme.color.overlay};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const Gallery = styled.div`
  position: relative;
  /* Redondeada en las cuatro puntas, como la tarjeta de Inicio. */
  margin: ${({ theme }) => theme.spacing[3]} 0 0;
  border-radius: 28px;
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]} 0;
  }
`;

export const GalleryTrack = styled.div`
  width: 100%;
  aspect-ratio: 4 / 5;
  max-height: 60dvh;

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  video {
    background: #000;
    object-fit: contain;
  }
`;

export const GalleryNav = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $side }) => ($side === 'left' ? 'left: 10px;' : 'right: 10px;')}
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.text};
  background: ${({ theme }) => theme.color.overlay};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const Dots = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 10px;
  display: flex;
  justify-content: center;
  gap: 6px;
`;

export const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => ($active ? '22px' : '7px')};
  height: 7px;
  border-radius: 99px;
  transition: width 0.2s ease, background 0.2s ease;
  background: ${({ theme, $active }) => ($active ? theme.color.primary : theme.color.textTertiary)};
`;

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: ${({ theme }) => theme.spacing[3]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing[4]} ${({ theme }) => theme.spacing[6]} 0;
  }
`;

export const PetName = styled.h2`
  font-size: 1.9rem;
  font-weight: 900;
  line-height: 1.1;
  background: ${({ theme }) => theme.color.metalGold};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const PetMeta = styled.p`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: ${({ theme }) => theme.typography.size.sm};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 0 ${({ theme }) => theme.spacing[6]};
  }
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

export const Chip = styled.span<{ $tone?: 'primary' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme, $tone }) => ($tone ? theme.color.primary : theme.color.textSecondary)};
  background: ${({ theme, $tone }) => ($tone ? theme.color.primaryFaded : theme.color.surface)};
  border: 1px solid ${({ theme, $tone }) => ($tone ? theme.color.borderFocus : theme.color.border)};
`;

export const Bio = styled.p`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: ${({ theme }) => theme.typography.size.sm};
  line-height: 1.55;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 0 ${({ theme }) => theme.spacing[6]};
  }
`;

export const Divider = styled.hr`
  height: 1px;
  border: 0;
  margin: ${({ theme }) => theme.spacing[2]} 0;
  background: ${({ theme }) => theme.color.metalGold};
  opacity: 0.75;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  }
`;

export const SectionLabel = styled.h3`
  color: ${({ theme }) => theme.color.primary};
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  text-transform: uppercase;
  letter-spacing: 0.08em;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 0 ${({ theme }) => theme.spacing[6]};
  }
`;

export const OwnerRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 0 ${({ theme }) => theme.spacing[6]};
  }
`;

export const OwnerAvatar = styled.div`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 1px solid ${({ theme }) => theme.color.border};
  font-weight: 900;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

export const OwnerCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  strong {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.base};
  }

  strong svg { color: ${({ theme }) => theme.color.success}; }

  span {
    display: flex;
    align-items: center;
    gap: 5px;
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: ${({ theme }) => theme.typography.size.xs};
  }
`;

export const Facts = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 0 ${({ theme }) => theme.spacing[6]};
  }
`;

export const Fact = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin: 0 ${({ theme }) => theme.spacing[6]};
  }
`;

export const FactIcon = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radius.md};
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.primaryFaded};
`;

export const FactCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  small {
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  strong {
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.semibold};
    line-height: 1.4;
  }
`;

export const Lineage = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[2]};

  div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.radius.lg};
    background: ${({ theme }) => theme.color.surface};
    border: 1px solid ${({ theme }) => theme.color.border};
  }

  small {
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
  }

  strong {
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.sm};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin: 0 ${({ theme }) => theme.spacing[6]};
  }
`;
