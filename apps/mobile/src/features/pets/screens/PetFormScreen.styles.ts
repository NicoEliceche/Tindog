import { StyleSheet } from 'react-native';
import type { AppTheme } from '../../../core/theme/tokens';

export function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent' },

    // El indice de secciones queda fijo arriba del scroll, igual que la
    // columna sticky de la web: en el telefono no hay lugar para una columna,
    // asi que se resuelve como una fila de chips que se desplaza sola.
    sectionNav: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceOverlay,
    },
    sectionNavContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    sectionChip: {
      minHeight: 34,
      paddingHorizontal: 14,
      justifyContent: 'center',
      borderRadius: 99,
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionChipActive: {
      backgroundColor: theme.colors.primaryFaded,
      borderColor: theme.colors.primaryBorderStrong,
    },
    sectionChipText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '800' },
    sectionChipTextActive: { color: theme.colors.primary },

    content: { paddingHorizontal: 16, paddingTop: 18 },

    photoUpload: {
      alignSelf: 'center',
      width: 148,
      height: 148,
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
      borderStyle: 'dashed',
    },
    photo: { width: '100%', height: '100%' },
    photoEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
    photoEmptyText: { color: theme.colors.primary, fontSize: 12, fontWeight: '800' },
    photoHint: {
      color: theme.colors.textMuted,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 18,
    },

    group: { gap: 8 },
    sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '900', marginBottom: 2 },
    label: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '800', marginTop: 6 },
    helper: { color: theme.colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 4 },
    error: { color: theme.colors.danger, fontSize: 13, fontWeight: '800', marginTop: 16 },

    input: {
      minHeight: 48,
      paddingHorizontal: 13,
      paddingVertical: 12,
      borderRadius: 14,
      color: theme.colors.text,
      fontSize: 15,
      backgroundColor: theme.colors.backgroundAlt,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: { minHeight: 104, textAlignVertical: 'top' },

    row: { flexDirection: 'row', gap: 10 },
    rowItem: { flex: 1 },

    chipRow: { flexDirection: 'row', gap: 8 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    chip: {
      minHeight: 44,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 99,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    chipActive: {
      backgroundColor: theme.colors.primaryFaded,
      borderColor: theme.colors.primaryBorderStrong,
    },
    chipText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '800' },
    chipTextActive: { color: theme.colors.primary },

    card: {
      gap: 10,
      padding: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    addButton: {
      minHeight: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      marginTop: 2,
      backgroundColor: theme.colors.primaryFaded,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
      borderStyle: 'dashed',
    },
    addButtonText: { color: theme.colors.primary, fontSize: 13, fontWeight: '900' },

    switchRow: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 14,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    switchLabel: { flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '800' },
    reveal: { gap: 8, marginTop: 4 },

    divider: { height: 1, backgroundColor: theme.colors.borderSubtle, marginVertical: 22 },

    // Guardar queda anclado abajo y fuera del scroll: en la web el boton se
    // alcanza bajando, pero en el telefono un formulario de seis secciones
    // dejaba el guardado demasiado lejos.
    footer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surfaceOverlay,
    },
    submit: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 26,
      backgroundColor: theme.colors.primary,
    },
    submitText: { color: theme.colors.onPrimary, fontSize: 15, fontWeight: '900' },
  });
}
