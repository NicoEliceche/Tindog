// src/features/profile/screens/SettingsScreenStyled.ts
import styled from 'styled-components';

/**
 * Envoltorio de la pantalla. En escritorio se ajusta al alto de la ventana
 * para que el desborde se resuelva dentro de la columna de opciones y el
 * encabezado con el índice de secciones no se mueva.
 */
export const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    /* Se ancla al alto de la ventana y descuenta el margen del contenedor,
       para que la página en sí no scrollee y el desborde quede dentro de la
       columna de opciones. */
    position: sticky;
    top: 0;
    height: calc(100dvh - ${({ theme }) => theme.spacing[12]});
    min-height: 0;
    overflow: hidden;
  }
`;


export const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.color.primary};
  font-weight: 900;
  margin-bottom: 8px;

  /* En escritorio la barra lateral queda visible en ajustes, así que este
     botón sería un segundo camino de vuelta para lo mismo. */
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: 14rem 1fr;
    align-items: start;
    gap: ${({ theme }) => theme.spacing[8]};
    /* Sólo scrollea la columna de opciones: el índice de secciones queda
       quieto, igual que en el alta de mascota. El alto lo fija el layout y
       el desborde se resuelve adentro. */
    flex: 1;
    min-height: 0;
  }
`;

export const SectionNav = styled.nav`
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: sticky;
    top: ${({ theme }) => theme.spacing[8]};
  }
`;

export const SectionNavLink = styled.a<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  color: ${({ theme, $active }) => ($active ? theme.color.primary : theme.color.textSecondary)};
  background: ${({ theme, $active }) => ($active ? theme.color.primaryFaded : 'transparent')};
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.color.primary};
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};
  min-width: 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    /* El min-height en cero es necesario: sin él, un hijo de grid no se
       encoge por debajo de su contenido y el overflow nunca se activa. */
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    padding-right: ${({ theme }) => theme.spacing[3]};
    padding-bottom: ${({ theme }) => theme.spacing[6]};
    overscroll-behavior: contain;
  }
`;

export const Group = styled.section`
  display: grid;
  gap: 7px;
  scroll-margin-top: ${({ theme }) => theme.spacing[8]};

  h2 {
    color: ${({ theme }) => theme.color.text};
    font-size: 1rem;
    font-weight: 900;
  }

  .box {
    overflow: hidden;
    border-radius: 22px;
    background: ${({ theme }) => theme.color.surface};
    border: 1px solid ${({ theme }) => theme.color.border};
  }
`;

export const Row = styled.div`
  min-height: 68px;
  padding: 10px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};

  &:last-child {
    border-bottom: 0;
  }

  > svg {
    color: ${({ theme }) => theme.color.primary};
  }

  .copy {
    flex: 1;
  }

  strong {
    color: ${({ theme }) => theme.color.text};
    font-size: 0.8rem;
  }

  small {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.63rem;
    line-height: 1.4;
  }
`;

export const Appearance = styled.div`
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;

  button {
    min-height: 54px;
    border-radius: 17px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: 0.62rem;
    font-weight: 900;

    &.active {
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
    }
  }
`;

export const Distance = styled(Row)`
  display: block;

  .chips {
    display: flex;
    gap: 8px;
    margin-top: 9px;
  }

  button {
    flex: 1;
    min-height: 38px;
    border-radius: 19px;
    color: ${({ theme }) => theme.color.textSecondary};
    background: ${({ theme }) => theme.color.background};
    font-size: 0.68rem;
    font-weight: 900;

    &.active {
      color: ${({ theme }) => theme.color.textInverse};
      background: ${({ theme }) => theme.color.primary};
    }
  }
`;

export const Action = styled.button<{ $danger?: boolean }>`
  width: 100%;
  min-height: 68px;
  padding: 10px 13px;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  border-bottom: 1px solid ${({ theme }) => theme.color.border};

  &:last-child {
    border-bottom: 0;
  }

  > svg:first-child {
    color: ${({ theme, $danger }) => ($danger ? theme.color.error : theme.color.primary)};
  }

  .copy {
    flex: 1;
  }

  strong {
    color: ${({ theme, $danger }) => ($danger ? theme.color.error : theme.color.text)};
    font-size: 0.8rem;
  }

  small {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textTertiary};
    font-size: 0.63rem;
  }
`;

/** Fondo del diálogo de confirmación de borrado. */
export const ConfirmBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: grid;
  place-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.color.overlay};
`;

export const ConfirmDialog = styled.div`
  width: min(100%, 26rem);
  padding: ${({ theme }) => theme.spacing[6]};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  box-shadow: ${({ theme }) => theme.elevation.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};

  h2 {
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.lg};
    font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  }

  p {
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: ${({ theme }) => theme.typography.size.sm};
    line-height: 1.55;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  li {
    display: flex;
    gap: 8px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    line-height: 1.5;
  }

  li::before {
    content: '·';
    color: ${({ theme }) => theme.color.primary};
    font-weight: 900;
  }

  input {
    min-height: 46px;
    padding: 0 ${({ theme }) => theme.spacing[3]};
    border-radius: ${({ theme }) => theme.radius.lg};
    background: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.border};
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.sm};
    letter-spacing: 0.08em;
  }

  input:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.borderFocus};
  }
`;

export const ConfirmActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[2]};
  justify-content: flex-end;
  flex-wrap: wrap;

  button {
    min-height: 44px;
    padding: 0 ${({ theme }) => theme.spacing[5]};
    border-radius: 999px;
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
    border: 1px solid ${({ theme }) => theme.color.border};
    background: ${({ theme }) => theme.color.surfaceRaised};
    color: ${({ theme }) => theme.color.textSecondary};
  }

  button[data-variant='danger'] {
    background: ${({ theme }) => theme.color.error};
    border-color: ${({ theme }) => theme.color.error};
    color: ${({ theme }) => theme.color.textInverse};
  }

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

/** Mensaje de error dentro del diálogo. */
export const ConfirmError = styled.p`
  color: ${({ theme }) => theme.color.error} !important;
  font-size: ${({ theme }) => theme.typography.size.xs} !important;
`;
