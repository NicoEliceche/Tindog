// src/features/appointments/screens/AppointmentListScreenStyled.ts
import styled from 'styled-components';
import type { WebAppointmentStatus } from '@core/providers/WebAppProvider';

export const Segment = styled.div`
  padding: 4px;
  display: flex;
  gap: 4px;
  border-radius: 24px;
  background: ${({ theme }) => theme.color.surface};

  button {
    flex: 1;
    min-height: 40px;
    border-radius: 20px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.78rem;
    font-weight: 900;

    &.active {
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
    }
  }
`;

export const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing[5]};
    align-items: start;
  }
`;

export const Card = styled.article`
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  border-radius: 24px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  .icon {
    width: 44px;
    height: 44px;
    border-radius: 15px;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.primary};
    background: ${({ theme }) => theme.color.primaryFaded};
  }

  .copy {
    flex: 1;
  }

  h2 {
    font-size: 1rem;
    font-weight: 900;
  }

  p {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.72rem;
  }
`;

export const Pill = styled.span<{ $status: WebAppointmentStatus }>`
  padding: 5px 9px;
  border-radius: 999px;
  color: ${({ theme, $status }) => ($status === 'cancelled' ? theme.color.error : $status === 'completed' ? theme.color.success : $status === 'in_progress' ? theme.color.warning : theme.color.primary)};
  background: ${({ theme, $status }) => ($status === 'cancelled' ? theme.color.errorLight : $status === 'completed' ? theme.color.successLight : $status === 'in_progress' ? theme.color.warningLight : theme.color.primaryFaded)};
  font-size: 0.62rem;
  font-weight: 900;
`;

export const Details = styled.div`
  padding: 11px;
  display: grid;
  gap: 7px;
  border-radius: 15px;
  background: ${({ theme }) => theme.color.background};

  div {
    display: flex;
    align-items: center;
    gap: 7px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.75rem;
  }

  svg {
    color: ${({ theme }) => theme.color.primary};
  }
`;

export const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  button {
    min-height: 40px;
    padding: 0 14px;
    border-radius: 20px;
    font-size: 0.72rem;
    font-weight: 900;
    color: ${({ theme }) => theme.color.primary};
    border: 1px solid ${({ theme }) => theme.color.borderFocus};

    &.primary {
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
    }

    &.danger {
      color: ${({ theme }) => theme.color.error};
      border-color: transparent;
    }
  }
`;

export const Empty = styled.div`
  padding: 52px 10px;
  text-align: center;
  color: ${({ theme }) => theme.color.textSecondary};
  grid-column: 1 / -1;

  h2 {
    margin-top: 9px;
    color: ${({ theme }) => theme.color.text};
    font-size: 1.1rem;
  }

  p {
    margin-top: 5px;
    font-size: 0.8rem;
  }
`;
