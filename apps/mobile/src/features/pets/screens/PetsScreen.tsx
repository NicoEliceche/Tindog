import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMyPets } from '../../../core/data/services/petService';
import type { Pet } from '../../../core/types/pet.types';
import { theme } from '../../../core/theme/tokens';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { BreederBadge } from '../components/BreederBadge';
import { styles } from './PetsScreen.styles';

export function PetsScreen() {
  const insets = useSafeAreaInsets();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPets = useCallback(async () => {
    setLoading(true);
    const result = await fetchMyPets();
    setPets(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  const summary = useMemo(() => {
    const verified = pets.filter((pet) => pet.is_verified_breeder_pet).length;
    const looking = pets.filter((pet) => pet.breeding_preferences?.looking_for_pair).length;
    return { verified, looking };
  }, [pets]);

  const renderPet = ({ item }: { item: Pet }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.photos[0] }}
        style={styles.avatar}
        resizeMode="cover"
        accessibilityLabel={`Foto de ${item.name}`}
      />
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petMeta}>
            {item.breed} · {item.gender} · {item.age} años
          </Text>
          <View style={styles.chipRow}>
            {item.personality_traits.slice(0, 3).map((trait) => (
              <View key={trait} style={styles.chip}>
                <Text style={styles.chipText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.healthRow}>
          <Text style={styles.coiText}>COI {item.coi_percentage ?? 0}%</Text>
          {item.is_verified_breeder_pet ? <BreederBadge /> : null}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={renderPet}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top + theme.spacing.md, theme.spacing.xl) },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.lg }}>
            <View>
              <Text style={styles.title}>Mis perros</Text>
              <Text style={styles.subtitle}>Controla perfiles, salud, documentacion y estado de cruza.</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{pets.length}</Text>
                  <Text style={styles.summaryLabel}>Perfiles</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.verified}</Text>
                  <Text style={styles.summaryLabel}>Verificados</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.looking}</Text>
                  <Text style={styles.summaryLabel}>Buscan cruza</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Dashboard de cria</Text>
          </View>
        }
        ListFooterComponent={
          <View style={{ paddingTop: theme.spacing.lg }}>
            <PrimaryButton label={loading ? 'Actualizando' : 'Actualizar perfiles'} icon="refresh" onPress={loadPets} />
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingVertical: theme.spacing.xxl }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}
