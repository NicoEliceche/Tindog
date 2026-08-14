// src/features/pets/screens/PetSearchScreenStyled.ts
import styled from 'styled-components';

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.text};
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

  svg {
    color: ${({ theme }) => theme.color.textTertiary};
    flex-shrink: 0;
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.typography.size.base};
    background: transparent;
    color: ${({ theme }) => theme.color.text};

    &::placeholder {
      color: ${({ theme }) => theme.color.textTertiary};
    }
  }
`;

export const StatusText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: ${({ theme }) => theme.typography.size.sm};
  padding: ${({ theme }) => theme.spacing[6]} 0;
`;

export const ResultsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${({ theme }) => theme.spacing[5]};
  }
`;

export const ResultCardBody = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing[3]};
  width: 100%;
`;

export const ResultIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  min-width: 0;
`;

export const ResultCopy = styled.div`
  min-width: 0;

  h3 {
    font-size: ${({ theme }) => theme.typography.size.lg};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    color: ${({ theme }) => theme.color.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  p {
    font-size: ${({ theme }) => theme.typography.size.sm};
    color: ${({ theme }) => theme.color.textSecondary};
  }
`;

export const RequestButton = styled.button`
  flex-shrink: 0;
  background: ${({ theme }) => theme.color.primary};
  color: ${({ theme }) => theme.color.textInverse};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
`;
