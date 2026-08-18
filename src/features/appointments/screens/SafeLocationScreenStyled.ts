// src/features/appointments/screens/SafeLocationScreenStyled.ts
import styled from 'styled-components';
import { metalGoldText } from '@shared/components/layout/WebScreen';

export const Screen = styled.section`
  min-height: 100dvh;
  width: min(100%, 880px);
  margin: 0 auto;
  /* Deja lugar para la barra inferior, que ahora tambien se ve aca: si no,
     el ultimo bloque quedaba tapado. */
  padding-bottom: calc(18px + 64px + env(safe-area-inset-bottom));
  background: ${({ theme }) => theme.color.background};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 100%;
    max-width: ${({ theme }) => theme.layout.shellMaxWidth};
    padding: 0 ${({ theme }) => theme.layout.contentGutter} ${({ theme }) => theme.spacing[8]};
  }
`;

export const Header = styled.header`
  min-height: 62px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 10px;

  h1 {
    /* Mismo cuerpo que "Panel de mascota", acompanando al ancho para que
       entre al lado de la flecha en los telefonos angostos. */
    font-size: clamp(1.35rem, 6vw, 2.35rem);
    font-weight: 900;
    line-height: 1.1;
    white-space: nowrap;
   ${metalGoldText}
    /* El helper alinea al inicio para que la caja se ajuste al texto; aca la
       fila ya centra verticalmente, asi que se recupera ese centrado. */
    align-self: center;
  }

  button {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing[6]} 0 ${({ theme }) => theme.spacing[4]};
  }
`;

export const DesktopLayout = styled.div`
  display: flex;
  flex-direction: column;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: 1.1fr 1fr;
    align-items: start;
    gap: ${({ theme }) => theme.spacing[6]};
  }
`;

export const MapColumn = styled.div`
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: sticky;
    top: ${({ theme }) => theme.spacing[6]};
  }
`;

export const ContentColumn = styled.div`
  min-width: 0;
`;

export const MapBox = styled.div`
  height: min(33dvh, 290px);
  min-height: 190px;
  position: relative;
  overflow: hidden;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 30% 35%, ${({ theme }) => theme.color.primaryFaded}, transparent 8%),
    linear-gradient(135deg, ${({ theme }) => theme.color.surface}, ${({ theme }) => theme.color.background});
  border-block: 1px solid ${({ theme }) => theme.color.border};

  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    opacity: 0;
    animation: mapFadeIn 0.4s ease forwards;
  }

  @keyframes mapFadeIn {
    to { opacity: 1; }
  }

  .fallback {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    background-image:
      linear-gradient(${({ theme }) => theme.color.border} 1px, transparent 1px),
      linear-gradient(90deg, ${({ theme }) => theme.color.border} 1px, transparent 1px);
    background-size: 32px 32px;
    background-position: center;
    opacity: 0.9;
  }

  .fallback-pin {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    animation: pinDrop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes pinDrop {
    from { opacity: 0; transform: translateY(-16px) scale(0.8); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .fallback-pin-icon {
    width: 3rem;
    height: 3rem;
    border-radius: ${({ theme }) => theme.radius.full};
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.textInverse};
    background: ${({ theme }) => theme.color.primary};
    box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
  }

  .fallback-pin-label {
    padding: 4px 12px;
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ theme }) => theme.color.surface};
    border: 1px solid ${({ theme }) => theme.color.border};
    color: ${({ theme }) => theme.color.text};
    font-size: 0.72rem;
    font-weight: 800;
    white-space: nowrap;
    max-width: 16rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .locate {
    position: absolute;
    right: 13px;
    bottom: 13px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.primary};
    background: ${({ theme }) => theme.color.surface};
    border: 1px solid ${({ theme }) => theme.color.border};
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: min(60dvh, 520px);
    border-radius: ${({ theme }) => theme.radius.xl};
    border: 1px solid ${({ theme }) => theme.color.border};
  }
`;

export const MapSelectionBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.color.glass};
  border: 1px solid ${({ theme }) => theme.color.border};
  backdrop-filter: blur(12px);
  animation: badgeSlideIn 0.3s ease;

  .icon {
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    border-radius: ${({ theme }) => theme.radius.full};
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.textInverse};
    background: ${({ theme }) => theme.color.primary};
  }

  .copy {
    min-width: 0;
  }

  strong {
    display: block;
    color: ${({ theme }) => theme.color.text};
    font-size: 0.82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.68rem;
  }

  @keyframes badgeSlideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const Content = styled.div`
  padding: 14px;
  display: grid;
  gap: 11px;

  h2 {
    font-size: 1.1rem;
    font-weight: 900;
  }

  .warning {
    color: ${({ theme }) => theme.color.warning};
    font-size: 0.66rem;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: 0;
  }
`;

export const DateSlots = styled.div`
  display: flex;
  gap: 7px;
  overflow-x: auto;
  padding-bottom: 2px;

  button {
    min-width: 112px;
    min-height: 54px;
    padding: 7px 10px;
    border-radius: 16px;
    color: ${({ theme }) => theme.color.textSecondary};
    background: ${({ theme }) => theme.color.surface};
    border: 1px solid ${({ theme }) => theme.color.border};
    font-size: 0.7rem;

    strong {
      display: block;
      color: ${({ theme }) => theme.color.text};
    }

    &.active {
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
      border-color: ${({ theme }) => theme.color.primary};

      strong {
        color: ${({ theme }) => theme.color.textInverse};
      }
    }
  }
`;

export const LocationCard = styled.article<{ $selected: boolean }>`
  padding: 13px;
  border-radius: 21px;
  display: grid;
  gap: 8px;
  background: ${({ theme }) => theme.color.surface};
  border: ${({ $selected }) => ($selected ? '2px' : '1px')} solid ${({ theme, $selected }) => ($selected ? theme.color.primary : theme.color.border)};
  cursor: pointer;

  .top {
    display: flex;
    align-items: flex-start;
    gap: 9px;
  }

  .icon {
    width: 38px;
    height: 38px;
    border-radius: 13px;
    display: grid;
    place-items: center;
    color: ${({ theme, $selected }) => ($selected ? theme.color.textInverse : theme.color.primary)};
    background: ${({ theme, $selected }) => ($selected ? theme.color.primary : theme.color.primaryFaded)};
  }

  h3 {
    color: ${({ theme }) => theme.color.text};
    font-size: 0.85rem;
    font-weight: 900;
  }

  p {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.67rem;
  }

  .rating {
    margin-left: auto;
    color: ${({ theme }) => theme.color.primary};
    font-size: 0.75rem;
    font-weight: 900;
  }

  .tags {
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
  }

  .tags span {
    padding: 3px 7px;
    border-radius: 8px;
    color: ${({ theme }) => theme.color.textSecondary};
    background: ${({ theme }) => theme.color.background};
    font-size: 0.58rem;
    font-weight: 800;
  }
`;

export const ReviewArea = styled.div`
  padding: 14px;
  border-radius: 21px;
  display: grid;
  gap: 9px;
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 1px solid ${({ theme }) => theme.color.borderFocus};

  h3 {
    font-size: 0.9rem;
  }

  textarea {
    min-height: 74px;
    padding: 10px;
    resize: vertical;
    color: ${({ theme }) => theme.color.text};
    background: ${({ theme }) => theme.color.surface};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 14px;
    outline: 0;
  }

  .stars {
    display: flex;
    gap: 7px;
  }

  .submit {
    min-height: 42px;
    border-radius: 21px;
    background: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.textInverse};
    font-weight: 900;
  }
`;

export const ReviewItem = styled.div`
  padding: 12px;
  border-radius: 17px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};

  .top {
    display: flex;
    justify-content: space-between;
  }

  h4 {
    font-size: 0.78rem;
  }

  .stars {
    color: ${({ theme }) => theme.color.primary};
  }

  p {
    margin-top: 6px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.72rem;
    line-height: 1.45;
  }

  small {
    display: flex;
    align-items: center;
    gap: 4px;
    color: ${({ theme }) => theme.color.success};
    font-weight: 800;
  }
`;

export const Footer = styled.div`
  position: sticky;
  bottom: 0;
  padding: 10px 14px max(10px, env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme }) => theme.color.glass};
  border-top: 1px solid ${({ theme }) => theme.color.border};
  backdrop-filter: blur(16px);

  .copy {
    flex: 1;
    min-width: 0;
  }

  small {
    color: ${({ theme }) => theme.color.primary};
    font-weight: 900;
  }

  strong {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.72rem;
  }

  button {
    min-height: 46px;
    padding: 0 17px;
    border-radius: 23px;
    color: ${({ theme }) => theme.color.textInverse};
    background: ${({ theme }) => theme.color.primary};
    font-weight: 900;
    font-size: 0.78rem;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

export const DesktopFooter = styled.div`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: ${({ theme }) => theme.spacing[4]};
    padding: ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.radius.xl};
    border: 1px solid ${({ theme }) => theme.color.border};
    background: ${({ theme }) => theme.color.surface};

    .copy {
      flex: 1;
      min-width: 0;
    }

    small {
      color: ${({ theme }) => theme.color.primary};
      font-weight: 900;
    }

    strong {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 0.9rem;
    }

    button {
      min-height: 46px;
      padding: 0 17px;
      border-radius: 23px;
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
      font-weight: 900;
      font-size: 0.78rem;
    }
  }
`;
