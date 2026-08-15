// src/features/hub/components/FilterBarStyled.ts
import styled from 'styled-components';

export const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[2]};
  align-items: center;
`;

export const SearchField = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[2]};
  flex: 1 1 14rem;
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.spacing[3]};
  border-radius: 999px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  color: ${({ theme }) => theme.color.textTertiary};
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.color.borderFocus};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }

  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: ${({ theme }) => theme.color.text};
    font-size: ${({ theme }) => theme.typography.size.sm};
  }

  input::placeholder {
    color: ${({ theme }) => theme.color.textTertiary};
  }

  /* Chrome dibuja su propia "x" de limpiar que no sigue el tema. */
  input::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
`;

export const Select = styled.select`
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.spacing[3]};
  border-radius: 999px;
  background: ${({ theme }) => theme.color.surface};
  border: 1px solid ${({ theme }) => theme.color.border};
  color: ${({ theme }) => theme.color.textSecondary};
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover, &:focus-visible {
    border-color: ${({ theme }) => theme.color.borderFocus};
    box-shadow: ${({ theme }) => theme.glow.subtle};
  }

  /* El menú nativo se dibuja con los colores del sistema, así que las
     opciones necesitan el fondo explícito o quedan ilegibles en oscuro. */
  option {
    background: ${({ theme }) => theme.color.surface};
    color: ${({ theme }) => theme.color.text};
  }
`;

/** Encabezado de cada grupo mensual dentro de la lista. */
export const MonthHeading = styled.h3`
  margin-top: ${({ theme }) => theme.spacing[2]};
  color: ${({ theme }) => theme.color.textTertiary};
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  text-transform: capitalize;
  letter-spacing: 0.04em;

  &:first-child {
    margin-top: 0;
  }
`;
