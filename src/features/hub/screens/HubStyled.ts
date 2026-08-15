// src/features/hub/screens/HubStyled.ts
// Estilos compartidos por las pantallas de gestión (solicitudes, guardados
// y seguridad): las tres son la misma forma —encabezado, secciones y una
// lista de tarjetas— así que comparten la base en vez de triplicarla.
import styled from 'styled-components';

export const Page = styled.section`
  min-height: 100dvh;
  width: 100%;
  padding: max(16px, env(safe-area-inset-top)) 16px 96px;
  display: flex;
  justify-content: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.layout.contentGutter};
  }
`;

export const Shell = styled.div`
  width: min(100%, 560px);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[5]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    /* Sin techo: son grillas de tarjetas y con más pantalla entran más
       columnas, en vez de dejar franjas vacías a los costados. */
    width: 100%;
  }
`;

export const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h1 {
    color: ${({ theme }) => theme.color.text};
    font-size: 1.6rem;
    font-weight: ${({ theme }) => theme.typography.weight.extrabold};
    letter-spacing: -0.01em;
  }

  p {
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: ${({ theme }) => theme.typography.size.sm};
    line-height: 1.5;
    max-width: 46ch;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    h1 { font-size: 2.1rem; }
  }
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

/**
 * Grilla de tarjetas. El mínimo de columna es amplio a propósito: cada
 * tarjeta lleva miniatura, dos líneas de texto y hasta dos botones en una
 * misma fila. Con columnas angostas al texto le quedaban unas decenas de
 * píxeles y envolvía debajo de los botones. Mejor pocas columnas anchas y
 * legibles que muchas apretadas.
 */
export const Grid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing[3]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fill, minmax(30rem, 1fr));
  }
`;

/**
 * Una sola columna ancha, para listas de decisión como las solicitudes:
 * son pocas filas y cada una se lee de un vistazo, no se comparan entre sí
 * como en una galería.
 */
export const List = styled(Grid)`
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: minmax(0, 46rem);
  }
`;

export const Card = styled.article`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.borderFocus};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }
`;

export const Thumb = styled.div`
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.lg};
  overflow: hidden;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 1px solid ${({ theme }) => theme.color.border};

  img { width: 100%; height: 100%; object-fit: cover; }
`;

export const Copy = styled.div`
  /* Un min-width de cero deja que el texto se encoja hasta desaparecer
     dentro de un flex; con este piso, el contenedor prefiere ceder el
     espacio sobrante antes que aplastar el nombre. */
  min-width: 8rem;
  flex: 1;

  strong {
    display: block;
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.base};
    font-weight: ${({ theme }) => theme.typography.weight.bold};
  }

  p {
    margin-top: 2px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    line-height: 1.45;
  }
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex-shrink: 0;
  /* En pantallas angostas los botones bajan a su propia línea en vez de
     estrujar el texto. */
  flex-wrap: wrap;
  justify-content: flex-end;
`;

export const Action = styled.button<{ $variant?: 'primary' | 'ghost' | 'danger' }>`
  min-height: 38px;
  padding: 0 ${({ theme }) => theme.spacing[4]};
  border-radius: 999px;
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  border: 1px solid transparent;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;

  ${({ theme, $variant }) => {
    if ($variant === 'primary') {
      return `background: ${theme.color.metalGoldSoft}; color: ${theme.color.textInverse}; box-shadow: ${theme.glow.soft};`;
    }
    if ($variant === 'danger') {
      return `background: transparent; color: ${theme.color.error}; border-color: ${theme.color.border};`;
    }
    return `background: ${theme.color.surfaceRaised}; color: ${theme.color.textSecondary}; border-color: ${theme.color.border};`;
  }}

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.color.borderFocus};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const Empty = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.color.surface};
  border: 1px dashed ${({ theme }) => theme.color.border};
  text-align: center;
  color: ${({ theme }) => theme.color.textTertiary};

  svg { opacity: 0.5; }

  p { margin-top: ${({ theme }) => theme.spacing[2]}; font-size: ${({ theme }) => theme.typography.size.sm}; }
`;

/** Bloque informativo con acento dorado, para consejos de seguridad. */
export const Notice = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.xl};
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 1px solid ${({ theme }) => theme.color.borderFocus};

  h3 {
    color: ${({ theme }) => theme.color.primary};
    font-size: ${({ theme }) => theme.typography.size.sm};
    font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  }

  ul { margin-top: ${({ theme }) => theme.spacing[2]}; display: flex; flex-direction: column; gap: 6px; }

  li {
    display: flex;
    gap: 8px;
    color: ${({ theme }) => theme.color.textSecondary};
    font-size: ${({ theme }) => theme.typography.size.xs};
    line-height: 1.5;
  }

  li::before { content: '·'; color: ${({ theme }) => theme.color.primary}; font-weight: 900; }
`;

/** Botón circular de una sola acción, como cancelar una solicitud. */
export const IconAction = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.textTertiary};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.color.border};
  transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.color.error};
    border-color: ${({ theme }) => theme.color.error};
    background: ${({ theme }) => theme.color.surfaceRaised};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.primary};
    outline-offset: 2px;
  }
`;
