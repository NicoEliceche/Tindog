import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';

export type SortOrder = 'recent' | 'oldest';
/** Ventana temporal del filtro por fecha. */
export type DateRange = 'all' | '7d' | '30d' | '90d';

export interface FilterState {
  query: string;
  range: DateRange;
  order: SortOrder;
}

export const DEFAULT_FILTERS: FilterState = { query: '', range: 'all', order: 'recent' };

const RANGE_LABEL: Record<DateRange, string> = {
  all: 'Cualquier fecha',
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
};

const ORDER_LABEL: Record<SortOrder, string> = {
  recent: 'Más recientes',
  oldest: 'Más antiguos',
};

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
 * Etiqueta de mes en español: "Agosto de 2026". Se capitaliza sólo la
 * inicial, porque hacerlo con cada palabra deja "Agosto De 2026".
 */
export function monthLabel(date: Date): string {
  const label = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Selector desplegable. React Native no trae un equivalente al `select` de la
 * web, así que el botón abre una hoja con las opciones.
 */
function Dropdown<T extends string>({ value, options, onSelect, label }: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onSelect: (next: T) => void;
  label: string;
}) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setOpen(true)}
        style={styles.select}
      >
        <Text style={styles.selectText} numberOfLines={1}>{current?.label ?? label}</Text>
        <Ionicons name="chevron-down" size={15} color={theme.colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.sheetTitle}>{label}</Text>
            {options.map((option) => (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                accessibilityState={{ selected: option.value === value }}
                onPress={() => { onSelect(option.value); setOpen(false); }}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              >
                <Text style={[styles.optionText, option.value === value && styles.optionTextActive]}>
                  {option.label}
                </Text>
                {option.value === value ? <Ionicons name="checkmark" size={18} color={theme.colors.primary} /> : null}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

interface FilterBarProps {
  value: FilterState;
  onChange: (next: FilterState) => void;
  /** Texto del campo de búsqueda, distinto según qué se está filtrando. */
  placeholder: string;
}

export function FilterBar({ value, onChange, placeholder }: FilterBarProps) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.bar}>
      {/* El buscador toma la fila entera y los dos filtros van juntos abajo,
          cada uno con la mitad, igual que en la web. */}
      <View style={styles.search}>
        <Ionicons name="search" size={16} color={theme.colors.textMuted} />
        <TextInput
          value={value.query}
          onChangeText={(query) => onChange({ ...value, query })}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          accessibilityLabel={placeholder}
          style={styles.input}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Dropdown
            label="Filtrar por fecha"
            value={value.range}
            options={(Object.keys(RANGE_LABEL) as DateRange[]).map((key) => ({ value: key, label: RANGE_LABEL[key] }))}
            onSelect={(range) => onChange({ ...value, range })}
          />
        </View>
        <View style={styles.half}>
          <Dropdown
            label="Ordenar"
            value={value.order}
            options={(Object.keys(ORDER_LABEL) as SortOrder[]).map((key) => ({ value: key, label: ORDER_LABEL[key] }))}
            onSelect={(order) => onChange({ ...value, order })}
          />
        </View>
      </View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    bar: { gap: 8 },
    search: {
      minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 14, borderRadius: 99,
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    input: { flex: 1, color: theme.colors.text, fontSize: 14 },

    row: { flexDirection: 'row', gap: 8 },
    half: { flex: 1, minWidth: 0 },
    select: {
      minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      gap: 6, paddingHorizontal: 14, borderRadius: 99,
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    selectText: { flex: 1, color: theme.colors.textSecondary, fontSize: 12, fontWeight: '800' },

    backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.overlay },
    sheet: {
      gap: 4, padding: 16, borderRadius: 24,
      backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    sheetTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '900', marginBottom: 6 },
    option: {
      minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 12, borderRadius: 14,
    },
    optionPressed: { backgroundColor: theme.colors.surfaceAlt },
    optionText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '700' },
    optionTextActive: { color: theme.colors.primary, fontWeight: '900' },
  });
}
