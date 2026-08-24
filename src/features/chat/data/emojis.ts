// src/features/chat/data/emojis.ts

/**
 * Los emojis que ofrece el chat.
 *
 * Es una lista propia y no una biblioteca de selector completo: las que hay
 * pesan entre 300 KB y 2 MB, y arrastran su propio conjunto de imágenes.
 * Sobre una pantalla que ya carga un fondo animado, eso cuesta más de lo que
 * aporta. El teclado del sistema ya da el catálogo completo a quien lo
 * necesite; esto es el acceso rápido a lo que se usa en una conversación
 * entre dueños de perros.
 *
 * El orden dentro de cada grupo va de más a menos usado.
 */
export interface EmojiGroup {
  label: string;
  emojis: string[];
}

export const EMOJI_GROUPS: EmojiGroup[] = [
  {
    label: 'Perros',
    emojis: ['🐶', '🐕', '🦮', '🐩', '🐾', '🦴', '🎾', '🏠', '🥎', '🦺'],
  },
  {
    label: 'Caras',
    emojis: ['😀', '😂', '🥰', '😍', '😊', '😅', '🤗', '🤔', '😴', '😢', '😱', '🙈'],
  },
  {
    label: 'Gestos',
    emojis: ['👍', '👎', '👋', '🙌', '👏', '🤝', '🙏', '💪', '✌️', '🤞'],
  },
  {
    label: 'Cariño',
    emojis: ['❤️', '💛', '💚', '💙', '💜', '🧡', '💖', '✨', '🎉', '🔥'],
  },
  {
    label: 'Encuentro',
    emojis: ['📍', '🗓️', '⏰', '☀️', '🌳', '🚶', '🏃', '🌧️', '❌', '✅'],
  },
];

/** Todos los emojis en una sola lista, para buscar. */
export const ALL_EMOJIS = EMOJI_GROUPS.flatMap((group) => group.emojis);
