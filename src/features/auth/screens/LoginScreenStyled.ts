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

export const Future = styled.div`
  display: flex;
  justify-content: center;
  gap: 28px;
  color: ${({ theme }) => theme.color.textTertiary};
  font-size: 0.75rem;
  font-weight: 800;
`;
