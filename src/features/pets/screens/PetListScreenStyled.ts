// src/features/pets/screens/PetListScreenStyled.ts
import styled from 'styled-components';

export const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${({ theme }) => theme.spacing[5]};
  }
`;

export const PetCardBody = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-align: left;

  img {
    width: 88px;
    height: 104px;
    border-radius: 18px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .body {
    flex: 1;
    min-width: 0;
  }

  h2 {
    color: ${({ theme }) => theme.color.text};
    font-size: 1.15rem;
    font-weight: 900;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .meta {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.72rem;
  }

  .chips {
    display: flex;
    gap: 5px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .chips span {
    padding: 4px 8px;
    border-radius: 999px;
    color: ${({ theme }) => theme.color.textSecondary};
    background: ${({ theme }) => theme.color.background};
    font-size: 0.6rem;
    font-weight: 800;
  }

  .status {
    margin-top: 8px;
    color: ${({ theme }) => theme.color.primary};
    font-size: 0.65rem;
    font-weight: 900;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    flex-direction: column;
    align-items: flex-start;

    img {
      width: 100%;
      height: 200px;
    }
  }
`;

export const Verified = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 7px;
  color: ${({ theme }) => theme.color.success};
  font-size: 0.58rem;
  font-weight: 900;
`;

export const AddPetCard = styled.button`
  width: 100%;
  min-height: 128px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px dashed ${({ theme }) => theme.color.border};
  color: ${({ theme }) => theme.color.primary};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  transition: border-color 0.18s ease, background 0.18s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.borderFocus};
    background: ${({ theme }) => theme.color.primaryFaded};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    min-height: 100%;
  }
`;
