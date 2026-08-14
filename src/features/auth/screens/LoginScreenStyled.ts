// src/features/auth/screens/LoginScreenStyled.ts
import styled from 'styled-components';

export const Screen = styled.section`
  min-height: 100dvh;
  width: 100%;
  padding: max(14px, env(safe-area-inset-top)) 16px max(14px, env(safe-area-inset-bottom));
  display: grid;
  place-items: center;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 10%, rgba(212, 175, 55, 0.13), transparent 28%),
    radial-gradient(circle at 90% 92%, rgba(212, 175, 55, 0.08), transparent 28%),
    ${({ theme }) => theme.color.background};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing[8]};
  }
`;

export const Layout = styled.div`
  width: min(100%, 840px);
  max-height: 100%;
  display: grid;
  gap: 16px;
  align-items: center;

  @media (min-width: 700px) and (orientation: landscape) {
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: min(100%, 1000px);
    grid-template-columns: 1.1fr 1fr;
    gap: ${({ theme }) => theme.spacing[12]};
  }
`;

export const Hero = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  text-align: center;

  .logo {
    width: clamp(128px, 22dvh, 190px);
    aspect-ratio: 1;
    position: relative;
    border-radius: 24%;
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.color.border};
    box-shadow: 0 18px 34px rgba(0, 0, 0, 0.45);
  }

  .logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .band {
    position: absolute;
    inset: auto 0 0;
    min-height: 18%;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.primary};
    background: rgba(5, 5, 5, 0.84);
    border-top: 1px solid ${({ theme }) => theme.color.border};
    border-bottom-right-radius: 50%;
    font-size: 0.82rem;
    font-weight: 900;
    letter-spacing: 3px;
  }

  .kicker {
    color: ${({ theme }) => theme.color.primary};
    font-size: 0.78rem;
    font-weight: 900;
  }

  h1 {
    color: ${({ theme }) => theme.color.text};
    font-size: clamp(1.45rem, 5vw, 1.9rem);
    font-weight: 900;
  }

  p {
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.85rem;
  }

  @media (max-height: 700px) {
    .logo {
      width: 120px;
    }
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    align-items: flex-start;
    text-align: left;
    gap: ${({ theme }) => theme.spacing[4]};

    .logo {
      width: 96px;
    }

    h1 {
      font-size: clamp(2rem, 3vw, 2.6rem);
    }

    p {
      font-size: ${({ theme }) => theme.typography.size.base};
      max-width: 22rem;
    }
  }
`;

export const Card = styled.div`
  padding: clamp(14px, 3dvh, 22px);
  display: grid;
  gap: 13px;
  border-radius: 28px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  box-shadow: ${({ theme }) => theme.elevation.lg};

  h2 {
    color: ${({ theme }) => theme.color.text};
    text-align: center;
    font-size: 1rem;
    font-weight: 900;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing[8]};
    gap: ${({ theme }) => theme.spacing[4]};
  }
`;

export const Google = styled.div`
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.textTertiary};
  font-size: 0.76rem;
  overflow: hidden;
`;

export const GoogleStatus = styled.p`
  min-height: 16px;
  color: ${({ theme }) => theme.color.textTertiary};
  font-size: 0.7rem;
  text-align: center;
`;

export const ErrorMessage = styled.p`
  padding: 9px 11px;
  border-radius: 14px;
  color: ${({ theme }) => theme.color.error};
  background: ${({ theme }) => theme.color.errorLight};
  border: 1px solid ${({ theme }) => theme.color.error};
  font-size: 0.72rem;
  font-weight: 800;
  text-align: center;
`;

export const Auto = styled.p`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 0.72rem;
  text-align: center;
`;

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.color.textTertiary};
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.5px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.color.border};
  }
`;

/** Botones de los métodos alternativos, apilados bajo el de Google. */
export const MethodList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const MethodButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
  min-height: 48px;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  border-radius: 999px;
  color: ${({ theme }) => theme.color.text};
  background: ${({ theme }) => theme.color.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.color.border};
  font-size: 0.85rem;
  font-weight: 700;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.16s ease;

  svg { color: ${({ theme }) => theme.color.primary}; flex-shrink: 0; }

  &:hover {
    border-color: ${({ theme }) => theme.color.borderFocus};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }

  &:active { transform: scale(0.985); }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.primary};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    &:active { transform: none; }
  }
`;

/** Formulario que reemplaza a la lista cuando se elige un método. */
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  input {
    min-height: 48px;
    padding: 0 ${({ theme }) => theme.spacing[4]};
    border-radius: ${({ theme }) => theme.radius.lg};
    color: ${({ theme }) => theme.color.text};
    background: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.border};
    font-size: 0.92rem;
    font-weight: 500;
    letter-spacing: normal;
    text-transform: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  input::placeholder { color: ${({ theme }) => theme.color.textTertiary}; }

  input:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.borderFocus};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }
`;

export const Submit = styled.button`
  min-height: 50px;
  border-radius: 999px;
  background: ${({ theme }) => theme.color.metalGoldSoft};
  color: ${({ theme }) => theme.color.textInverse};
  font-size: 0.9rem;
  font-weight: 900;
  box-shadow: ${({ theme }) => theme.glow.soft};
  transition: box-shadow 0.2s ease, opacity 0.2s ease;

  &:hover:not(:disabled) { box-shadow: ${({ theme }) => theme.glow.strong}; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

export const BackLink = styled.button`
  align-self: center;
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 0.75rem;
  font-weight: 700;

  &:hover { color: ${({ theme }) => theme.color.primary}; }
`;

/** Aviso del código de un solo uso mientras no haya envío real de mails. */
export const CodeHint = styled.p`
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 1px solid ${({ theme }) => theme.color.borderFocus};
  color: ${({ theme }) => theme.color.text};
  font-size: 0.78rem;
  line-height: 1.5;

  b { color: ${({ theme }) => theme.color.primary}; font-size: 1.05rem; letter-spacing: 2px; }
`;

/** Envoltorio del botón de Google: se oculta sin desmontarse. */
export const GoogleSlot = styled.div<{ $hidden: boolean }>`
  display: ${({ $hidden }) => ($hidden ? 'none' : 'flex')};
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;
