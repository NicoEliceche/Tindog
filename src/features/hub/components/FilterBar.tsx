'use client';

import { Search } from 'lucide-react';
import { Bar, SearchField, Select } from './FilterBarStyled';

export type SortOrder = 'recent' | 'oldest';
/** Ventana temporal del filtro por fecha. */
export type DateRange = 'all' | '7d' | '30d' | '90d';

export interface FilterState {
  query: string;
  range: DateRange;
  order: SortOrder;
}

export const DEFAULT_FILTERS: FilterState = { query: '', range: 'all', order: 'recent' };

/**
 * Devuelve si una fecha entra en la ventana elegida. Vive acá y no en cada
 * pantalla para que solicitudes y guardados filtren con el mismo criterio.
 */
export function withinRange(date: Date, range: DateRange): boolean {
  if (range === 'all') return true;
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  return Date.now() - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

/**
 * Etiqueta de mes en español: "Agosto de 2026".
 *
 * Se capitaliza sólo la inicial y no con `text-transform: capitalize`, que
 * afecta a cada palabra y dejaba "Agosto De 2026".
 */
export function monthLabel(date: Date): string {
  const label = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

interface FilterBarProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  /** Texto del campo de búsqueda, distinto según qué se está filtrando. */
  placeholder: string;
}

export function FilterBar({ value, onChange, placeholder }: FilterBarProps) {
  return (
    <Bar role="search">
      <SearchField>
        <Search size={16} aria-hidden />
        <input
          type="search"
          value={value.query}
          onChange={(event) => onChange({ ...value, query: event.target.value })}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </SearchField>

      <Select
        value={value.range}
        onChange={(event) => onChange({ ...value, range: event.target.value as DateRange })}
        aria-label="Filtrar por fecha"
      >
        <option value="all">Cualquier fecha</option>
        <option value="7d">Últimos 7 días</option>
        <option value="30d">Últimos 30 días</option>
        <option value="90d">Últimos 90 días</option>
      </Select>

      <Select
        value={value.order}
        onChange={(event) => onChange({ ...value, order: event.target.value as SortOrder })}
        aria-label="Ordenar"
      >
        <option value="recent">Más recientes</option>
        <option value="oldest">Más antiguos</option>
      </Select>
    </Bar>
  );
}
