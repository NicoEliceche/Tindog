// src/features/matches/screens/MatchesScreenStyled.ts
import styled from 'styled-components';

export const ScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.size['3xl']};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.text};
`;

export const MatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const MatchCard = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.color.border};
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  cursor: pointer;
`;

export const MatchPhoto = styled.img`
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
`;

export const MatchInfo = styled.div`
  padding: ${({ theme }) => theme.spacing[3]};
  text-align: center;
`;

export const MatchName = styled.p`
  font-weight: bold;
  font-size: ${({ theme }) => theme.typography.size.base};
`;
