// src/features/chat/screens/ChatListScreenStyled.ts
import styled from 'styled-components';

export const SearchBox = styled.label`
  min-height: 50px;
  padding: 0 15px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 9px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};

  input {
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.color.text};
  }
`;

export const SectionTitle = styled.h2`
  margin-top: 5px;
  color: ${({ theme }) => theme.color.text};
  font-size: 1rem;
  font-weight: 900;
`;

export const Request = styled.article`
  min-height: 76px;
  padding: 10px;
  border-radius: 21px;
  display: flex;
  align-items: center;
  gap: 9px;
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 1px solid ${({ theme }) => theme.color.borderFocus};

  img {
    width: 50px;
    height: 50px;
    border-radius: 16px;
    object-fit: cover;
  }

  .copy {
    flex: 1;
  }

  h3 {
    color: ${({ theme }) => theme.color.text};
    font-size: 0.9rem;
  }

  p {
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.7rem;
    margin-top: 3px;
  }

  button {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${({ theme }) => theme.color.surface};

    &:last-child {
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
    }
  }
`;

export const Chat = styled.button<{ $active?: boolean }>`
  width: 100%;
  min-height: 86px;
  /* El resalte del activo se dibuja como una pastilla redondeada con su
     propio margen: antes el fondo llegaba a los bordes del botón y el
     brillo quedaba cortado a ras de la columna, como un corte seco. */
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  border-radius: ${({ theme }) => theme.radius.lg};
  border-bottom: 1px solid ${({ theme, $active }) => ($active ? 'transparent' : theme.color.border)};
  background: ${({ theme, $active }) => ($active ? theme.color.primaryFaded : 'transparent')};
  box-shadow: ${({ theme, $active }) => ($active ? theme.glow.subtle : 'none')};
  transition: background 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.color.primaryFaded : theme.color.surfaceRaised)};
  }

  img {
    width: 58px;
    height: 58px;
    border-radius: 20px;
    object-fit: cover;
  }

  .body {
    flex: 1;
    min-width: 0;
  }

  .top {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  h3 {
    color: ${({ theme }) => theme.color.text};
    font-size: 0.95rem;
    font-weight: 900;
  }

  time {
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.65rem;
  }

  strong {
    display: block;
    margin-top: 3px;
    color: ${({ theme }) => theme.color.primary};
    font-size: 0.65rem;
  }

  p {
    margin-top: 4px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const Dot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.primary};
`;
