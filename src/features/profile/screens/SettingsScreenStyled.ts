// src/features/profile/screens/SettingsScreenStyled.ts
import styled from 'styled-components';

export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.color.primary};
  font-weight: 900;
  margin-bottom: 8px;

  /* En escritorio la barra lateral queda visible en ajustes, así que este
     botón sería un segundo camino de vuelta para lo mismo. */
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: 14rem 1fr;
    align-items: start;
    gap: ${({ theme }) => theme.spacing[8]};
  }
`;

export const SectionNav = styled.nav`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: sticky;
    top: ${({ theme }) => theme.spacing[8]};
  }
`;

export const SectionNavLink = styled.a<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  color: ${({ theme, $active }) => ($active ? theme.color.primary : theme.color.textSecondary)};
  background: ${({ theme, $active }) => ($active ? theme.color.primaryFaded : 'transparent')};
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.color.primary};
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
  min-width: 0;
`;

export const Group = styled.section`
  display: grid;
  gap: 7px;
  scroll-margin-top: ${({ theme }) => theme.spacing[8]};

  h2 {
    color: ${({ theme }) => theme.color.text};
    font-size: 1rem;
    font-weight: 900;
  }

  .box {
    overflow: hidden;
    border-radius: 22px;
    background: ${({ theme }) => theme.color.surface};
    border: 1px solid ${({ theme }) => theme.color.border};
  }
`;

export const Row = styled.div`
  min-height: 68px;
  padding: 10px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};

  &:last-child {
    border-bottom: 0;
  }

  > svg {
    color: ${({ theme }) => theme.color.primary};
  }

  .copy {
    flex: 1;
  }

  strong {
    color: ${({ theme }) => theme.color.text};
    font-size: 0.8rem;
  }

  small {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.63rem;
    line-height: 1.4;
  }
`;

export const Appearance = styled.div`
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;

  button {
    min-height: 54px;
    border-radius: 17px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.62rem;
    font-weight: 900;

    &.active {
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
    }
  }
`;

export const Distance = styled(Row)`
  display: block;

  .chips {
    display: flex;
    gap: 8px;
    margin-top: 9px;
  }

  button {
    flex: 1;
    min-height: 38px;
    border-radius: 19px;
    color: ${({ theme }) => theme.color.textSecondary};
    background: ${({ theme }) => theme.color.background};
    font-size: 0.68rem;
    font-weight: 900;

    &.active {
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
    }
  }
`;

export const Action = styled.button<{ $danger?: boolean }>`
  width: 100%;
  min-height: 68px;
  padding: 10px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};

  &:last-child {
    border-bottom: 0;
  }

  > svg:first-child {
    color: ${({ theme, $danger }) => ($danger ? theme.color.error : theme.color.primary)};
  }

  .copy {
    flex: 1;
  }

  strong {
    color: ${({ theme, $danger }) => ($danger ? theme.color.error : theme.color.text)};
    font-size: 0.8rem;
  }

  small {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.63rem;
  }
`;
