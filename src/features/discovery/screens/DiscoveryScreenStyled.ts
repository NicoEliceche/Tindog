// src/features/discovery/screens/DiscoveryScreenStyled.ts
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

export const Page = styled.section`
  min-height: 100dvh;
  width: 100%;
  padding: max(12px, env(safe-area-inset-top)) 16px 84px;
  display: flex;
  justify-content: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 86px 24px 22px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.layout.contentGutter};
  }
`;

export const Shell = styled.div`
  width: min(100%, 440px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 100%;
    max-width: ${({ theme }) => theme.layout.shellMaxWidth};
  }
`;

export const Header = styled.header`
  width: 100%;
  min-height: 82px;
  display: grid;
  /* La columna derecha lleva campana + avatar, por eso es más ancha que la
     izquierda; el 1fr central mantiene la marca centrada en la pantalla. */
  grid-template-columns: 96px 1fr 96px;
  align-items: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr auto 1fr;
    min-height: 0;
    margin-bottom: ${({ theme }) => theme.spacing[4]};
  }
`;

export const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.color.primary};
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 2px;

  small {
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.48rem;
    letter-spacing: 0.8px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    justify-content: center;
  }
`;

export const BrandCopy = styled.div`
  display: contents;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;

    span {
      font-size: 2.1rem;
      letter-spacing: 4px;
    }

    small {
      font-size: 0.9rem;
      letter-spacing: 1.6px;
      font-weight: 800;
    }
  }
`;

/** Campana + avatar, agrupados en la punta derecha del header. */
export const HeaderActions = styled.div`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const Avatar = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 1px solid ${({ theme }) => theme.color.border};
  font-weight: 900;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const DesktopLayout = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: 18rem minmax(0, 30rem) 18rem;
    align-items: start;
    gap: ${({ theme }) => theme.spacing[6]};
  }
`;

export const SidePanel = styled.aside`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing[3]};
    position: sticky;
    top: ${({ theme }) => theme.spacing[8]};
  }
`;

export const SidePanelTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

export const NextPreviewCard = styled.div`
  border-radius: ${({ theme }) => theme.radius.xl};
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  opacity: 0.85;

  img {
    width: 100%;
    height: 9rem;
    object-fit: cover;
  }

  .copy {
    padding: ${({ theme }) => theme.spacing[3]};
  }

  h4 {
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
  }

  p {
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    margin-top: 2px;
  }
`;

export const StatsCard = styled.div`
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.color.primaryFaded};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};

  b {
    color: ${({ theme }) => theme.color.primary};
    font-size: ${({ theme }) => theme.typography.size['2xl']};
    font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  }

  span {
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    font-weight: ${({ theme }) => theme.typography.weight.semibold};
  }
`;

export const CenterColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const CardStack = styled.div`
  position: relative;
  width: 100%;
  height: min(63dvh, 535px);
  min-height: 365px;

  @media (max-height: 720px) {
    height: 58dvh;
    min-height: 335px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: min(64dvh, 600px);
  }
`;

export const UndoButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: ${({ theme }) => theme.spacing[2]};
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: box-shadow 0.2s ease, color 0.2s ease, border-color 0.2s ease;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.color.primary};
    border-color: ${({ theme }) => theme.color.borderFocus};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export const BackdropCard = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: 28px;
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};

  img {
    width: 100%;
    height: 67%;
    object-fit: cover;
    opacity: 0.55;
  }
`;

export const Actions = styled.div`
  width: 100%;
  flex: 1;
  min-height: 82px;
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export const Action = styled.button<{ $primary?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.color.text};
  font-size: 0.62rem;
  font-weight: 900;
  text-transform: uppercase;

  i {
    width: ${({ $primary }) => ($primary ? '62px' : '54px')};
    height: ${({ $primary }) => ($primary ? '62px' : '54px')};
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: ${({ theme, $primary }) => ($primary ? theme.color.textInverse : theme.color.primary)};
    background: ${({ theme, $primary }) => ($primary ? theme.color.metalGoldSoft : theme.color.surface)};
    border: 1px solid ${({ theme }) => theme.color.borderFocus};
    font-style: normal;
    box-shadow: ${({ theme, $primary }) => ($primary ? theme.glow.soft : theme.glow.subtle)},
      ${({ theme }) => theme.glow.inset};
    transition: box-shadow 0.24s ease, transform 0.18s ease;
  }

  &:hover i {
    box-shadow: ${({ theme }) => theme.glow.strong}, ${({ theme }) => theme.glow.inset};
    transform: translateY(-3px) scale(1.05);
  }

  &:active i {
    transform: translateY(0) scale(0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    &:hover i, &:active i { transform: none; }
  }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const Empty = styled.div`
  flex: 1;
  width: 100%;
  display: grid;
  place-items: center;
  text-align: center;
  color: ${({ theme }) => theme.color.textSecondary};

  h2 {
    margin-top: 12px;
    color: ${({ theme }) => theme.color.text};
    font-size: 1.15rem;
    font-weight: 800;
  }

  p {
    margin-top: 4px;
    font-size: 0.85rem;
  }

  .spin {
    color: ${({ theme }) => theme.color.primary};
    animation: ${spin} 1s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .spin { animation-duration: 2.4s; }
  }
`;

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: ${({ theme }) => theme.color.overlay};
`;

export const Modal = styled.div`
  width: min(100%, 420px);
  padding: 24px;
  border-radius: 28px;
  text-align: center;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.borderFocus};

  h2 {
    color: ${({ theme }) => theme.color.primary};
    font-size: 1.7rem;
  }

  p {
    color: ${({ theme }) => theme.color.textSecondary};
    line-height: 1.5;
    margin: 10px 0 18px;
  }

  button {
    min-height: 48px;
    padding: 0 24px;
    border-radius: 999px;
    background: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.textInverse};
    font-weight: 900;
  }
`;
