// src/features/appointments/screens/AppointmentListScreenStyled.ts
import styled from 'styled-components';

export const ScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const CalendarCard = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: ${({ theme }) => theme.spacing[4]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const AppointmentItem = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.color.neutral[50]};
  border-left: 4px solid ${({ theme }) => theme.color.primary};
`;

export const DateTimeInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  background: white;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing[2]};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);

  span:first-child {
    font-size: ${({ theme }) => theme.typography.size.xs};
    text-transform: uppercase;
    color: ${({ theme }) => theme.color.primary};
    font-weight: bold;
  }
  span:last-child {
    font-size: ${({ theme }) => theme.typography.size.xl};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
  }
`;

export const AppointmentDetails = styled.div`
  flex: 1;
`;

export const LocationText = styled.p`
  font-size: ${({ theme }) => theme.typography.size.base};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
`;

export const PetTags = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

export const PetTag = styled.span`
  font-size: ${({ theme }) => theme.typography.size.xs};
  background: ${({ theme }) => theme.color.primaryFaded};
  color: ${({ theme }) => theme.color.primaryDark};
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radius.full};
`;
