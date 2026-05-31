// src/features/pets/screens/PetSearchScreenStyled.ts
import styled from 'styled-components';

export const ScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[6]};
`;

export const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.full};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  height: ${({ theme }) => theme.layout.inputHeight};
  gap: ${({ theme }) => theme.spacing[3]};

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.typography.size.base};
    background: transparent;
  }
`;

export const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const ResultCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${({ theme }) => theme.color.surface};
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export const PetAvatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

export const RequestButton = styled.button`
  background: ${({ theme }) => theme.color.accent};
  color: white;
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
`;
