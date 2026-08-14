// src/features/discovery/screens/DiscoveryScreenStyled.ts
import styled from 'styled-components';

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
  grid-template-columns: 64px 1fr 64px;
  align-items: center;
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
`;

export const Logo = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 15px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const Avatar = styled.div`
  justify-self: end;
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

export const PetCard = styled.article`
  width: 100%;
  height: min(63dvh, 535px);
  min-height: 365px;
  border-radius: 28px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.borderFocus};
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);

  @media (max-height: 720px) {
    height: 58dvh;
    min-height: 335px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: min(64dvh, 600px);
  }
`;

export const PetImage = styled.img`
  width: 100%;
  height: 67%;
  object-fit: cover;
  background: ${({ theme }) => theme.color.neutral[800]};
`;

export const PetBody = styled.div`
  flex: 1;
  min-height: 0;
  padding: 14px 17px;

  .title-row {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  h2 {
    color: ${({ theme }) => theme.color.primary};
    font-size: 1.75rem;
    font-weight: 900;
  }

  strong {
    color: ${({ theme }) => theme.color.text};
    font-size: 1.2rem;
  }

  .meta {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  p {
    margin-top: 7px;
    color: ${({ theme }) => theme.color.text};
    font-size: 0.88rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    p {
      -webkit-line-clamp: 4;
    }
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
    background: ${({ theme, $primary }) => ($primary ? theme.color.primary : theme.color.surface)};
    border: 1px solid ${({ theme }) => theme.color.borderFocus};
    font-style: normal;
  }
`;

export const Empty = styled.div`
  flex: 1;
  width: 100%;
  display: grid;
  place-items: center;
  text-align: center;
  color: ${({ theme }) => theme.color.textSecondary};

  button {
    margin-top: 14px;
    color: ${({ theme }) => theme.color.primary};
    font-weight: 900;
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
