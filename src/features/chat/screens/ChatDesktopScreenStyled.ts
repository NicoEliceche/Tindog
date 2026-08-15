// src/features/chat/screens/ChatDesktopScreenStyled.ts
import styled from 'styled-components';

export const DesktopShell = styled.div`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: 23rem 1fr;
    height: 100dvh;
    /* Sin techo de ancho: el chat es una superficie de trabajo y aprovecha
       todo el monitor. Con max-width quedaba centrado y el panel activo se
       cortaba contra un borde que no coincidía con nada. */
    width: 100%;
  }
`;

export const ListColumn = styled.div`
  height: 100dvh;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  border-right: 1px solid ${({ theme }) => theme.color.border};
`;

export const RoomColumn = styled.div`
  height: 100dvh;
  min-width: 0;
`;

export const RoomEmptyState = styled.div`
  height: 100dvh;
  width: 100%;
  display: grid;
  place-items: center;
  text-align: center;
  color: ${({ theme }) => theme.color.textSecondary};
  padding: ${({ theme }) => theme.spacing[8]};

  svg {
    color: ${({ theme }) => theme.color.textTertiary};
    margin-bottom: ${({ theme }) => theme.spacing[3]};
  }

  h2 {
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.xl};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    margin-bottom: ${({ theme }) => theme.spacing[2]};
  }

  p {
    font-size: ${({ theme }) => theme.typography.size.sm};
    max-width: 22rem;
  }
`;

export const MobileOnly = styled.div`
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;
