// src/features/pets/screens/BreedingDashboardScreenStyled.ts
import styled from 'styled-components';
import { metalGoldText } from '@shared/components/layout/WebScreen';

export const Page = styled.section`
  min-height: 100dvh;
  width: min(100%, 720px);
  margin: 0 auto;
  padding: 12px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 13px;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-top: 24px;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    width: 100%;
    max-width: ${({ theme }) => theme.layout.shellMaxWidth};
    padding: ${({ theme }) => theme.spacing[10]} ${({ theme }) => theme.layout.contentGutter};
  }
`;

export const Top = styled.header`
  min-height: 46px;
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;

  h1 {
    text-align: center;
    font-size: 1rem;
    font-weight: 900;
   ${metalGoldText}
  }

  button {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: ${({ theme }) => theme.color.surface};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: auto 1fr auto;
    justify-items: start;

    h1 {
      text-align: left;
      font-size: ${({ theme }) => theme.typography.size.xl};
    }
  }
`;

export const DesktopLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: 1fr 22rem;
    align-items: start;
    gap: ${({ theme }) => theme.spacing[6]};
  }
`;

export const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
  min-width: 0;
`;

export const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: sticky;
    top: ${({ theme }) => theme.spacing[8]};
  }
`;

export const Hero = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    width: 76px;
    height: 76px;
    border-radius: 24px;
    object-fit: cover;
    border: 2px solid ${({ theme }) => theme.color.primary};
  }

  .copy {
    flex: 1;
  }

  small {
    color: ${({ theme }) => theme.color.primary};
    font-size: 0.6rem;
    font-weight: 900;
    letter-spacing: 0.8px;
  }

  h2 {
    color: ${({ theme }) => theme.color.text};
    font-size: 1.7rem;
    line-height: 1.1;
    font-weight: 900;
  }

  p {
    margin-top: 3px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.7rem;
  }

  .verified {
    margin-top: 5px;
    display: flex;
    gap: 4px;
    align-items: center;
    color: ${({ theme }) => theme.color.success};
    font-size: 0.6rem;
    font-weight: 800;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    img {
      width: 96px;
      height: 96px;
    }

    h2 {
      font-size: 2.1rem;
    }
  }
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(4, 1fr);
    gap: ${({ theme }) => theme.spacing[4]};
  }
`;

export const Stat = styled.article`
  min-height: 132px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 22px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};

  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: ${({ theme }) => theme.color.primary};
  }

  .top strong {
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.65rem;
    text-transform: uppercase;
  }

  b {
    color: ${({ theme }) => theme.color.text};
    font-size: 1.7rem;
    font-weight: 900;
  }

  p {
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.62rem;
  }

  @media (max-height: 720px) {
    min-height: 108px;
    padding: 11px;
  }
`;

export const Next = styled.button`
  min-height: 80px;
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  border-radius: 22px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.borderFocus};
  width: 100%;

  .icon {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    border-radius: 15px;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.textInverse};
    background: ${({ theme }) => theme.color.primary};
  }

  .copy {
    flex: 1;
  }

  small {
    color: ${({ theme }) => theme.color.primary};
    font-size: 0.58rem;
    font-weight: 900;
  }

  strong {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.color.text};
    font-size: 0.82rem;
  }

  p {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.64rem;
  }
`;

export const Tip = styled.div`
  min-height: 64px;
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 9px;
  border-radius: 20px;
  color: ${({ theme }) => theme.color.textSecondary};
  background: ${({ theme }) => theme.color.primaryFaded};
  font-size: 0.72rem;
  line-height: 1.4;

  svg {
    color: ${({ theme }) => theme.color.primary};
    flex-shrink: 0;
  }

  @media (max-height: 720px) {
    display: none;
  }
`;
