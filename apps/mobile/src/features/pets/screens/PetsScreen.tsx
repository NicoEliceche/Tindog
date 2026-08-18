import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMyPets } from '../../../core/data/services/petService';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../../core/theme/tokens';
import type { PetsStackParamList, RootStackParamList } from '../../../navigation/types';
import { BreederBadge } from '../components/BreederBadge';

export function PetsScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  // Dos pilas: la de la pestana (alta de mascota, conserva la barra inferior)
  // y la general (panel de una mascota).
  const navigation = useNavigation<NativeStackNavigationProp<PetsStackParamList & RootStackParamList>>();
  const { myPets, adoptRemotePets } = useAppData();
  const [loading, setLoading] = useState(true);

  // El servicio sigue siendo la fuente cuando hay backend, pero la lista se
  // lee del provider: es lo que permite que una mascota recien creada aparezca
  // sin volver a pedirla.
  useEffect(() => { fetchMyPets().then(adoptRemotePets).finally(() => setLoading(false)); }, [adoptRemotePets]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={myPets}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 16, 24) }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={<View style={styles.header}><Text style={styles.title}>Mis perros</Text><Text style={styles.subtitle}>Salud, compatibilidad, documentos y actividad en un solo panel.</Text></View>}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`Abrir panel de ${item.name}`} onPress={() => navigation.navigate('PetProfile', { petId: item.id })} style={({ pressed }) => [styles.card, pressed && { opacity: 0.72 }]}>
            <Image source={{ uri: item.photos[0] }} style={styles.avatar} />
            <View style={styles.cardBody}>
              <View style={styles.nameRow}><Text style={styles.name}>{item.name}</Text>{item.is_verified_breeder_pet ? <BreederBadge /> : null}</View>
              <Text style={styles.meta}>{item.breed} · {item.age} años</Text>
              <View style={styles.chips}>{item.personality_traits.slice(0, 2).map((trait) => <View key={trait} style={styles.chip}><Text style={styles.chipText}>{trait}</Text></View>)}</View>
              <Text style={styles.status}>{item.breeding_preferences?.looking_for_pair ? 'Disponible para conectar' : 'Perfil en pausa'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={theme.colors.textMuted} />
          </Pressable>
        )}
        ListEmptyComponent={loading ? <ActivityIndicator size="large" color={theme.colors.primary} /> : <Text style={styles.subtitle}>Todavía no cargaste mascotas.</Text>}
        ListFooterComponent={<Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar mascota"
          style={styles.addButton}
          onPress={() => navigation.navigate('PetForm')}
        ><Ionicons name="add" size={20} color={theme.colors.primary} /><Text style={styles.addText}>Agregar mascota</Text></Pressable>}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: 'transparent' },
    content: { paddingHorizontal: 16, paddingBottom: 28 },
    header: { marginBottom: 20 },
    title: { color: theme.colors.heading, fontSize: 32, fontWeight: '900' },
    subtitle: { color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 6 },
    card: { minHeight: 126, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: theme.colors.surface, borderRadius: 24, borderWidth: 1, borderColor: theme.colors.border },
    avatar: { width: 88, height: 102, borderRadius: 18, backgroundColor: theme.colors.surfaceAlt },
    cardBody: { flex: 1, alignSelf: 'stretch', justifyContent: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    name: { color: theme.colors.text, fontSize: 20, fontWeight: '900' },
    meta: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: '700', marginTop: 2 },
    chips: { flexDirection: 'row', gap: 5, marginTop: 8 },
    chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 99, backgroundColor: theme.colors.surfaceAlt },
    chipText: { color: theme.colors.textSecondary, fontSize: 10, fontWeight: '800' },
    status: { color: theme.colors.primary, fontSize: 11, fontWeight: '900', marginTop: 8 },
    // Misma tarjeta punteada que en la web: alta, con dorado tenue de fondo
    // y borde discontinuo, en vez de la pastilla dorada solida que era.
    addButton: { minHeight: 128, marginTop: 12, borderRadius: 24, backgroundColor: theme.colors.primaryFaded, borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.primaryBorderStrong, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    addText: { color: theme.colors.primary, fontSize: 15, fontWeight: '900' },
  });
}
