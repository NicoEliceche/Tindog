// src/features/chat/screens/ChatRoomScreenStyled.ts
import styled, { css } from 'styled-components';

export const Screen = styled.section<{ $panelMode?: boolean }>`
  /* Descuenta la barra inferior, que ahora tambien se ve dentro de una
     conversacion: con 100dvh el campo de escritura quedaba justo debajo. */
  height: calc(100dvh - 64px - env(safe-area-inset-bottom));
  width: min(100%, 760px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.color.background};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    /* En escritorio manda la barra lateral, no la inferior. */
    height: 100dvh;
  }

  ${({ $panelMode }) => $panelMode && css`
    width: 100%;
    margin: 0;
  `}
`;

export const Header = styled.header`
  min-height: 68px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.surface};

  button {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
  }

  img {
    width: 44px;
    height: 44px;
    border-radius: 15px;
    object-fit: cover;
  }

  .copy {
    flex: 1;
  }

  h1 {
    font-size: 0.95rem;
    font-weight: 900;
  }

  p {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.66rem;
  }
`;

export const Safety = styled.div`
  padding: 8px 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: ${({ theme }) => theme.color.textSecondary};
  background: ${({ theme }) => theme.color.primaryFaded};
  font-size: 0.65rem;
  line-height: 1.35;
`;

export const AppointmentBanner = styled.button`
  min-height: 42px;
  padding: 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  color: ${({ theme }) => theme.color.textInverse};
  background: ${({ theme }) => theme.color.primary};

  span {
    flex: 1;
    font-size: 0.7rem;
    font-weight: 900;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const Messages = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 9px;
`;

export const Bubble = styled.div<{ $mine?: boolean; $system?: boolean }>`
  align-self: ${({ $mine, $system }) => ($system ? 'center' : $mine ? 'flex-end' : 'flex-start')};
  max-width: ${({ $system }) => ($system ? '90%' : '82%')};
  padding: ${({ $system }) => ($system ? '9px 12px' : '10px 14px')};
  border-radius: 19px;
  color: ${({ theme, $mine }) => ($mine ? theme.color.textInverse : theme.color.text)};
  /* Los mensajes recibidos usan una superficie elevada propia: en modo claro
     surface es casi idéntico al fondo y hacía que el texto pareciera suelto.
     Suman borde y sombra para que la burbuja se lea como tal. */
  background: ${({ theme, $mine, $system }) => ($system ? theme.color.primaryFaded : $mine ? theme.color.primary : theme.color.surfaceRaised)};
  font-size: ${({ $system }) => ($system ? '.68rem' : '.86rem')};
  line-height: 1.4;
  text-align: ${({ $system }) => ($system ? 'center' : 'left')};

  ${({ $mine, $system, theme }) => !$mine && !$system && css`
    border: 1px solid ${theme.color.border};
    box-shadow: ${theme.elevation.sm};
    border-bottom-left-radius: 6px;
  `}

  ${({ $mine, theme }) => $mine && css`
    box-shadow: ${theme.glow.subtle};
    border-bottom-right-radius: 6px;
  `}
`;

export const Composer = styled.form`
  padding: 9px 10px max(9px, env(safe-area-inset-bottom));
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: ${({ theme }) => theme.color.surface};
  border-top: 1px solid ${({ theme }) => theme.color.border};

  .calendar {
    width: 46px;
    height: 46px;
    flex: 0 0 46px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.primary};
    background: ${({ theme }) => theme.color.primaryFaded};
  }

  .input {
    flex: 1;
    min-height: 46px;
    padding: 4px 5px 4px 14px;
    border-radius: 25px;
    display: flex;
    align-items: center;
    background: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.border};
  }

  input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.color.text};
    /* La caja ya esta centrada, pero la metrica de Inter deja mas aire
       debajo de la linea base que encima y el texto se ve caido. Con una
       altura de linea explicita la tinta queda pareja. */
    line-height: 1.15;
    padding: 0;
  }

  .send {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: ${({ theme }) => theme.color.textInverse};
    background: ${({ theme }) => theme.color.primary};
  }
`;
