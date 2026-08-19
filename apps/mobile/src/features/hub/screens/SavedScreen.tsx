import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppData, type SavedPet } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import {
  DEFAULT_FILTERS, FilterBar, monthLabel, withinRange, type FilterState,
} from '../components/FilterBar';
import { useToast } from '../../../shared/components/Toast';
import type { AppTheme } from '../../../core/theme/tokens';

/** Los guardados de un mismo mes van juntos: con varios, la fecha sola no ubica. */
function groupByMonth(items: SavedPet[]): Array<[string, SavedPet[]]> {
  const byMonth = new Map<string, SavedPet[]>();
  for (const item of items) {
    const key = monthLabel(new Date(item.savedAt));
    byMonth.set(key, [...(byMonth.get(key) ?? []), item]);
  }
  return Array.from(byMonth.entries());
}

/**
 * Perfiles apartados desde Inicio.
 *
 * El botón "Guardar" existía en Inicio y prometía poder volver a ver la
 * mascota en favoritos, pero descartaba el perfil sin guardarlo en ningún
 * lado. Esta pantalla es el destino que faltaba.
 */
export function SavedScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { savedPets, unsavePet, sendConnectionRequest } = useAppData();
  const [sent, setSent] = useState<string[]>([]);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const groups = useMemo(() => {
    const needle = filters.query.trim().toLowerCase();
    const visible = savedPets
      .filter((item) => {
        if (!withinRange(new Date(item.savedAt), filters.range)) return false;
        if (!needle) return true;
        return `${item.pet.name} ${item.pet.breed}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => {
        const diff = new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        return filters.order === 'recent' ? diff : -diff;
      });
    return groupByMonth(visible);
  }, [filters, savedPets]);

  const connect = (item: SavedPet) => {
    sendConnectionRequest(item.pet);
    setSent((current) => [...current, item.pet.id]);
    toast({
      title: 'Solicitud enviada',
      body: `El tutor de ${item.pet.name} decide si se abre el chat.`,
    });
  };

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}
      data={groups}
      keyExtractor={([month]) => month}
      ListHeaderComponent={
        <View style={styles.head}>
          <Text style={styles.intro}>
            Los perfiles que apartaste para decidir con calma. Podés enviarles una solicitud o sacarlos de la lista.
          </Text>
          <FilterBar value={filters} onChange={setFilters} placeholder="Buscar por nombre o raza" />
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={30} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>
            Todavía no guardaste ningún perfil. Usá el botón Guardar en Inicio.
          </Text>
        </View>
      }
      renderItem={({ item: [month, items] }) => (
        <View style={styles.group}>
          <Text style={styles.month}>{month}</Text>
          {items.map(({ pet, savedAt }) => (
            <View key={pet.id} style={styles.card}>
              <Image source={{ uri: pet.photos[0] }} style={styles.thumb} />
              <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={1}>{pet.name} · {pet.age}</Text>
                <Text style={styles.detail} numberOfLines={1}>
                  {pet.breed} · guardado el{' '}
                  {new Date(savedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                </Text>
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Enviar solicitud a ${pet.name}`}
                    disabled={sent.includes(pet.id)}
                    onPress={() => connect({ pet, savedAt })}
                    style={[styles.primary, sent.includes(pet.id) && styles.primaryDone]}
                  >
                    <Text style={styles.primaryText}>{sent.includes(pet.id) ? 'Enviada' : 'Conectar'}</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar a ${pet.name} de guardados`}
                    onPress={() => unsavePet(pet.id)}
                    style={styles.ghost}
                  >
                    <Text style={styles.ghostText}>Quitar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    />
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1 },
    content: { padding: 16, paddingTop: 8 },
    head: { gap: 14, marginBottom: 16 },
    intro: { color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19 },
    group: { marginBottom: 20, gap: 9 },
    month: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    card: {
      flexDirection: 'row', gap: 11, padding: 12,
      borderRadius: 20, backgroundColor: theme.colors.surface,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    thumb: { width: 72, height: 88, borderRadius: 16, backgroundColor: theme.colors.surfaceAlt },
    copy: { flex: 1, minWidth: 0, justifyContent: 'center' },
    name: { color: theme.colors.text, fontSize: 15, fontWeight: '900' },
    detail: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 },
    actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
    primary: {
      minHeight: 38, paddingHorizontal: 16, justifyContent: 'center',
      borderRadius: 19, backgroundColor: theme.colors.primary,
    },
    primaryDone: { opacity: 0.5 },
    primaryText: { color: theme.colors.onPrimary, fontSize: 12, fontWeight: '900' },
    ghost: {
      minHeight: 38, paddingHorizontal: 16, justifyContent: 'center',
      borderRadius: 19, borderWidth: 1, borderColor: theme.colors.border,
    },
    ghostText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: '900' },
    empty: {
      alignItems: 'center', gap: 8, padding: 26, borderRadius: 20,
      borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.border,
    },
    emptyText: { color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 19 },
  });
}
