// src/features/appointments/screens/SafeLocationScreenStyled.ts
import styled from 'styled-components';
import { motion } from 'framer-motion';

export const ScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.full};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  height: 56px;
  gap: ${({ theme }) => theme.spacing[3]};
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 1rem;
  }
`;

export const CuratedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
  overflow-y: auto;
  flex: 1;
  padding-bottom: 2rem;
`;

export const LocationCard = styled(motion.div)<{ $selected?: boolean }>`
  background: ${({ $selected, theme }) => $selected ? theme.color.primaryFaded : 'white'};
  border: 2px solid ${({ $selected, theme }) => $selected ? theme.color.primary : theme.color.border};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: ${({ theme }) => theme.spacing[5]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.color.primary};
    transform: translateY(-2px);
  }
`;

export const LocationName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.color.text};
`;

export const Badge = styled.span`
  background: ${({ theme }) => theme.color.success};
  color: white;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Address = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.color.textSecondary};
`;

export const MapPlaceholder = styled.div`
  width: 100%;
  height: 180px;
  background: #eef2f3;
  border-radius: ${({ theme }) => theme.radius.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.9rem;
  border: 1px solid ${({ theme }) => theme.color.border};
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const FloatingButton = styled(motion.button)`
  position: sticky;
  bottom: 1rem;
  background: ${({ theme }) => theme.color.primary};
  color: white;
  height: 56px;
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: 800;
  box-shadow: 0 10px 25px rgba(255, 107, 107, 0.4);
`;
