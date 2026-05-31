// src/features/pets/screens/PetListScreenStyled.ts
import styled from 'styled-components';

export const ScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.size['3xl']};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.text};
`;

export const PetGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const PetCard = styled.div`
  background: ${({ theme }) => theme.color.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing[4]};
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const PetAvatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
`;

export const PetInfo = styled.div`
  flex: 1;
`;

export const PetName = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
`;

export const PetBreed = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.color.textSecondary};
`;

export const AddButton = styled.button`
  background: ${({ theme }) => theme.color.primary};
  color: white;
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const SearchBox = styled.div`
  margin-top: ${({ theme }) => theme.spacing[8]};
  background: ${({ theme }) => theme.color.primaryFaded};
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.radius.xl};
  text-align: center;
`;

export const SearchTitle = styled.h4`
  margin-bottom: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.color.primaryDark};
`;
