// src/features/profile/screens/ProfileScreenStyled.ts
import styled from 'styled-components';
import { WebCard } from '@shared/components/layout/WebScreen';

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: 20rem 1fr;
    align-items: start;
    gap: ${({ theme }) => theme.spacing[8]};
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    position: sticky;
    top: ${({ theme }) => theme.spacing[8]};
  }
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .settings {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.primary};
    background: ${({ theme }) => theme.color.surface};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    .settings { display: none; }
  }
`;

export const Owner = styled(WebCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const AvatarButton = styled.button`
  width: 94px;
  height: 94px;
  position: relative;
  border-radius: 30px;
  color: ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.primaryFaded};
  font-size: 1.7rem;
  font-weight: 900;

  img {
    width: 100%;
    height: 100%;
    border-radius: 30px;
    object-fit: cover;
  }

  i {
    position: absolute;
    right: -5px;
    bottom: -5px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.textInverse};
    background: ${({ theme }) => theme.color.primary};
    border: 3px solid ${({ theme }) => theme.color.surface};
  }
`;

export const OwnerName = styled.h2`
  margin-top: 11px;
  color: ${({ theme }) => theme.color.text};
  font-size: 1.35rem;
  font-weight: 900;
`;

export const Email = styled.p`
  margin-top: 3px;
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: 0.72rem;
`;

export const Verified = styled.span`
  margin-top: 7px;
  display: flex;
  gap: 4px;
  align-items: center;
  color: ${({ theme }) => theme.color.success};
  font-size: 0.62rem;
  font-weight: 900;
`;

export const Stats = styled.div`
  width: 100%;
  margin-top: 16px;
  padding-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid ${({ theme }) => theme.color.border};

  div {
    text-align: center;
  }

  b {
    display: block;
    font-size: 1.2rem;
  }

  span {
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.6rem;
    font-weight: 800;
  }
`;

export const Section = styled.h2`
  margin-top: 5px;
  color: ${({ theme }) => theme.color.text};
  font-size: 1rem;
  font-weight: 900;
`;

export const Row = styled.button`
  width: 100%;
  min-height: 68px;
  padding: 12px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  border-radius: 20px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  transition: border-color 0.18s ease;

  > svg:first-child {
    color: ${({ theme }) => theme.color.primary};
  }

  div {
    flex: 1;
  }

  strong {
    color: ${({ theme }) => theme.color.text};
    font-size: 0.82rem;
  }

  small {
    display: block;
    margin-top: 3px;
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.65rem;
  }

  &:hover {
    border-color: ${({ theme }) => theme.color.borderFocus};
  }
`;

export const LogoutButton = styled.button`
  min-height: 50px;
  margin-top: 5px;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ theme }) => theme.color.error};
  background: ${({ theme }) => theme.color.errorLight};
  border: 1px solid ${({ theme }) => theme.color.error};
  font-weight: 900;
`;

export const ModalForm = styled.div`
  display: grid;
  gap: 14px;

  h2 {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.color.text};
  }

  input {
    min-height: 48px;
    padding: 0 13px;
    border-radius: 14px;
    outline: 0;
    color: ${({ theme }) => theme.color.text};
    background: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.border};
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .actions button {
    min-height: 42px;
    padding: 0 16px;
    border-radius: 21px;
    font-weight: 900;
  }

  .save {
    color: ${({ theme }) => theme.color.textInverse};
    background: ${({ theme }) => theme.color.primary};
  }
`;
