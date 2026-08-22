// src/features/pets/screens/PetFormScreenStyled.ts
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { metalGoldText } from '@shared/components/layout/WebScreen';

export const FormWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[8]};
  max-width: 500px;
  margin: 0 auto;
  color: ${({ theme }) => theme.color.text};
  /* Se reserva el alto exacto de la barra inferior, que flota sobre el
     contenido. Antes eran 96 y sobraban 32, que dejaban el boton de guardar
     flotando lejos de la barra en vez de apoyado sobre ella. */
  padding-bottom: calc(64px + env(safe-area-inset-bottom));

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    max-width: ${({ theme }) => theme.layout.shellMaxWidth};
    padding: ${({ theme }) => theme.spacing[10]} ${({ theme }) => theme.layout.contentGutter};
    /* La pantalla se ajusta al alto de la ventana y el desborde se resuelve
       adentro, en la columna del formulario: así la página no scrollea y el
       índice de secciones se queda donde está. */
    height: 100dvh;
    min-height: 0;
    padding-bottom: ${({ theme }) => theme.spacing[6]};
    overflow: hidden;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const HeaderTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: 800;
  ${metalGoldText}
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text};
`;

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[8]};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: grid;
    grid-template-columns: ${({ theme }) => theme.layout.sidebarWidth} 1fr;
    align-items: start;
    gap: ${({ theme }) => theme.spacing[10]};
    /* El índice de secciones queda quieto y sólo scrollea la columna del
       formulario. Con sticky el índice igual se desplazaba hasta engancharse
       en el borde; acá directamente no se mueve, porque la página no crece:
       el alto lo fija el contenedor y el desborde vive dentro de la columna. */
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
    /* Sin sticky: la columna ya no scrollea, así que no hay nada de lo que
       despegarse. Si el índice creciera más que la pantalla, scrollea solo. */
    max-height: 100%;
    overflow-y: auto;
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

export const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
  /* Sin reserva propia: la franja del boton ya cierra la columna y el
     contenedor de la pantalla reserva el alto de la barra. Sumarlo aca
     tambien dejaba al boton flotando lejos de la barra. */

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    /* Única zona que scrollea en escritorio. El min-height en cero es
       necesario: sin él, un hijo de grid no se encoge por debajo de su
       contenido y el overflow nunca se activa. */
    min-height: 0;
    max-height: 100%;
    overflow-y: auto;
    /* Aire para que el último campo no quede pegado al borde inferior. En
       escritorio no hay barra inferior que esquivar. */
    padding-right: ${({ theme }) => theme.spacing[3]};
    padding-bottom: ${({ theme }) => theme.spacing[6]};
    overscroll-behavior: contain;
  }
`;

/** Etiqueta que envuelve un input file oculto: el clic abre el selector. */
export const PhotoUpload = styled.label`
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.radius['2xl']};
  /* Mismo criterio que el cuadro de agregar mascota: en claro el relleno va
     mas firme y la letra usa la tinta oscura, porque el dorado de acentos
     sobre marfil se confunde con el fondo. */
  background: ${({ theme }) => theme.color.actionFill};
  border: 2px dashed ${({ theme }) => theme.color.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.canvasInk};
  cursor: pointer;
  gap: 4px;
  font-size: 12px;
  font-weight: bold;

  &:hover {
    border-color: ${({ theme }) => theme.color.primaryLight};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }

  &:focus-within {
    outline: 2px solid ${({ theme }) => theme.color.primary};
    outline-offset: 2px;
  }

  /* Vista previa de la foto elegida, cubriendo el recuadro. */
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    margin: 0;
  }
`;

/** Aviso bajo el recuadro: formato aceptado o error de validación. */
export const PhotoHint = styled.p<{ $error?: boolean }>`
  margin-top: 8px;
  text-align: center;
  font-size: ${({ theme }) => theme.typography.size.xs};
  color: ${({ theme, $error }) => ($error ? theme.color.error : theme.color.textTertiary)};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    text-align: left;
  }
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  scroll-margin-top: ${({ theme }) => theme.spacing[8]};
`;

export const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.textSecondary};
  text-transform: uppercase;
  margin-left: 4px;
`;

export const InlineLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 1rem;

  ${Label} {
    margin: 0;
  }
`;

export const HelperText = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.color.textTertiary};
  margin-top: 4px;
`;

export const Input = styled.input`
  height: 56px;
  background: ${({ theme }) => theme.color.surface};
  color: ${({ theme }) => theme.color.text};
  border: 2px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.size.base};
  transition: all 0.2s;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.color.primaryFaded};
  }

  /* Los textos de ayuda mas largos no entraban: "Nombre de la Madre"
     necesitaba 147px en un campo de 124. Con este cuerpo y el interletrado
     apretado entran los tres peores casos con margen. */
  &::placeholder {
    font-size: 13.5px;
    letter-spacing: -0.3px;
  }
`;

export const TextArea = styled(Input).attrs({ as: 'textarea' })`
  height: 100px;
  padding-top: 12px;
  resize: vertical;

  &::placeholder { font-size: 13.5px; letter-spacing: -0.3px; }
`;

export const SmallInput = styled(Input)`
  height: 40px;
  flex: 1;

  &::placeholder { font-size: 13.5px; letter-spacing: -0.3px; }
`;

export const DateSmallInput = styled(SmallInput)`
  width: 130px;
  flex: none;

  &::placeholder { font-size: 13.5px; letter-spacing: -0.3px; }
`;

export const YearInput = styled(SmallInput)`
  width: 80px;
  flex: none;

  &::placeholder { font-size: 13.5px; letter-spacing: -0.3px; }
`;

export const CoiInput = styled(SmallInput)`
  width: 80px;
  flex: none;

  &::placeholder { font-size: 13.5px; letter-spacing: -0.3px; }
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

export const LineageGrid = styled(FieldGrid)`
  margin-top: 0.5rem;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const RevealGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
`;

export const Divider = styled.hr`
  border: 0;
  border-top: 1px solid ${({ theme }) => theme.color.border};
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  cursor: pointer;
`;

export const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

export const CheckboxRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const CheckboxItem = styled.div<{ $active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing[3]};
  border: 2px solid ${({ $active, theme }) => ($active ? theme.color.primary : theme.color.border)};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  background: ${({ $active, theme }) => ($active ? theme.color.primaryFaded : theme.color.surface)};
  transition: all 0.2s;
`;

export const CompetitionCard = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  background: ${({ theme }) => theme.color.surface};
`;

export const HealthCard = styled(CompetitionCard)`
  border-left: 4px solid #4CAF50;
`;

export const CardTopInput = styled(SmallInput)`
  margin-bottom: 8px;
  width: 100%;

  &::placeholder { font-size: 13.5px; letter-spacing: -0.3px; }
`;

export const AddButton = styled.button`
  color: ${({ theme }) => theme.color.primary};
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

export const SectionBody = styled.div`
  margin-top: 0.5rem;
`;

/**
 * Franja del boton de guardar, igual que en la aplicacion nativa: queda
 * pegada al final del formulario en vez de flotar suelta -medido: terminaba
 * 120px por encima de la barra inferior- y con el mismo relleno arriba y
 * abajo, para que el boton quede centrado dentro de ella.
 */
export const SubmitBar = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing[3]} 0;
  border-top: 1px solid ${({ theme }) => theme.color.border};

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    /* En escritorio no hay barra inferior: la franja no hace falta. */
    border-top: 0;
    padding: 0;
  }
`;

export const SubmitButton = styled(motion.button)`
  width: 100%;
  background: ${({ theme }) => theme.color.primary};
  color: ${({ theme }) => theme.color.textInverse};
  min-height: 56px;
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  font-size: ${({ theme }) => theme.typography.size.lg};
  box-shadow: 0 10px 20px rgba(212, 175, 55, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
`;

/**
 * Galería de la mascota: cada foto es una celda y los cuadros de subida son
 * dos más. Se acomodan solas al ancho disponible en vez de ir en una fila
 * fija, que en el teléfono obligaría a desplazar de costado.
 */
export const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: ${({ theme }) => theme.spacing[2]};
`;

export const MediaTile = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radius['2xl']};
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};

  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

/** Marca "Portada" o "Video" sobre la miniatura. */
export const MediaBadge = styled.span`
  position: absolute;
  left: 6px;
  bottom: 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  color: ${({ theme }) => theme.color.primary};
  background: ${({ theme }) => theme.color.overlay};
  backdrop-filter: blur(6px);
`;

export const RemoveMedia = styled.button`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.color.text};
  background: ${({ theme }) => theme.color.overlay};
  backdrop-filter: blur(6px);
  border: 1px solid ${({ theme }) => theme.color.border};

  &:hover {
    color: ${({ theme }) => theme.color.error};
    border-color: ${({ theme }) => theme.color.error};
  }
`;
