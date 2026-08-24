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

/**
 * La fila que ocupa un mensaje, de borde a borde.
 *
 * Existe para que el hueco al costado de la burbuja pertenezca a ese
 * mensaje: doble clic ahi responde, que es el equivalente en escritorio del
 * arrastre hacia la derecha del telefono. Sin la fila, ese espacio era del
 * contenedor y no habia forma de saber a que mensaje correspondia.
 */
export const MessageRow = styled.div<{ $mine?: boolean; $system?: boolean }>`
  display: flex;
  justify-content: ${({ $mine, $system }) => ($system ? 'center' : $mine ? 'flex-end' : 'flex-start')};
  /* El doble clic no tiene que dejar texto seleccionado a su paso. */
  user-select: none;

  /* La burbuja si deja copiar su texto a mano. */
  > * { user-select: text; }
`;

export const Bubble = styled.div<{ $mine?: boolean; $system?: boolean }>`
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

/**
 * El mensaje citado, arriba del texto de la burbuja.
 *
 * Mismo recurso que WhatsApp: una franja al costado y el texto original en
 * chico, para saber a que se responde sin salir de la conversacion.
 */
export const Quote = styled.div<{ $mine?: boolean }>`
  border-left: 3px solid ${({ theme, $mine }) => ($mine ? 'rgba(5,5,5,.35)' : theme.color.primary)};
  background: ${({ theme, $mine }) => ($mine ? 'rgba(5,5,5,.08)' : theme.color.primaryFaded)};
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 6px;

  strong {
    display: block;
    color: ${({ theme, $mine }) => ($mine ? 'rgba(5,5,5,.75)' : theme.color.primary)};
    font-size: 0.68rem;
    font-weight: 900;
  }

  span {
    display: block;
    color: ${({ theme, $mine }) => ($mine ? 'rgba(5,5,5,.6)' : theme.color.textSecondary)};
    font-size: 0.72rem;
    margin-top: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

/** La hora, y el "editado" cuando corresponde. */
export const BubbleMeta = styled.small<{ $mine?: boolean }>`
  display: block;
  margin-top: 4px;
  text-align: right;
  font-size: 0.56rem;
  color: ${({ theme, $mine }) => ($mine ? 'rgba(5,5,5,.6)' : theme.color.textTertiary)};
`;

/** Lo que se esta respondiendo o editando, arriba del campo. */
export const ContextBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  background: ${({ theme }) => theme.color.surfaceRaised};
  border-top: 1px solid ${({ theme }) => theme.color.border};

  .accent {
    width: 3px;
    align-self: stretch;
    border-radius: 2px;
    background: ${({ theme }) => theme.color.primary};
  }

  .copy { flex: 1; min-width: 0; }

  strong {
    display: block;
    color: ${({ theme }) => theme.color.primary};
    font-size: 0.72rem;
    font-weight: 900;
  }

  span {
    display: block;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.72rem;
    margin-top: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  button {
    width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: ${({ theme }) => theme.color.textSecondary};
  }
`;

/** Menu del click derecho sobre un mensaje. */
export const MessageMenu = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
  z-index: 4500;
  min-width: 15rem;
  padding: 6px;
  border-radius: 16px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  box-shadow: ${({ theme }) => theme.elevation.lg};

  button {
    width: 100%;
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    border-radius: 11px;
    color: ${({ theme }) => theme.color.text};
    font-size: 0.82rem;
    font-weight: 700;
    text-align: left;
  }

  button:hover { background: ${({ theme }) => theme.color.surfaceRaised}; }
  button.danger { color: ${({ theme }) => theme.color.error}; }
`;

/** Panel de emojis, sobre el campo de escritura. */
export const EmojiPanel = styled.div`
  max-height: 13rem;
  overflow-y: auto;
  padding: 10px 14px;
  background: ${({ theme }) => theme.color.surfaceRaised};
  border-top: 1px solid ${({ theme }) => theme.color.border};

  strong {
    display: block;
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.62rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin: 8px 0 4px;
  }

  strong:first-child { margin-top: 0; }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }

  button {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    font-size: 1.25rem;
    line-height: 1;
  }

  button:hover { background: ${({ theme }) => theme.color.surface}; }
`;

/** Las tres opciones de adjunto. */
export const AttachPanel = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  background: ${({ theme }) => theme.color.surfaceRaised};
  border-top: 1px solid ${({ theme }) => theme.color.border};

  button {
    flex: 1;
    min-height: 74px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 16px;
    color: ${({ theme }) => theme.color.primary};
    background: ${({ theme }) => theme.color.primaryFaded};
    border: 1px solid ${({ theme }) => theme.color.borderFocus};
    font-size: 0.72rem;
    font-weight: 800;
  }
`;

/** Un adjunto dentro de la burbuja. */
export const Attachment = styled.div<{ $mine?: boolean }>`
  margin-bottom: 6px;
  border-radius: 12px;
  overflow: hidden;

  img, video {
    display: block;
    width: 100%;
    max-height: 15rem;
    object-fit: cover;
  }

  .doc {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 10px;
    border-radius: 12px;
    background: ${({ theme, $mine }) => ($mine ? 'rgba(5,5,5,.10)' : theme.color.surface)};
  }

  .doc-copy { min-width: 0; }

  .doc strong {
    display: block;
    font-size: 0.76rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .doc small {
    color: ${({ theme, $mine }) => ($mine ? 'rgba(5,5,5,.6)' : theme.color.textTertiary)};
    font-size: 0.64rem;
  }
`;
