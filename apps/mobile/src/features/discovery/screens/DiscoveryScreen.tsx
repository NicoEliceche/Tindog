import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchDiscoveryPets } from '../../../core/data/services/petService';
import type { Pet } from '../../../core/types/pet.types';
import { theme } from '../../../core/theme/tokens';
import { IconButton } from '../../../shared/components/IconButton';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { styles } from './DiscoveryScreen.styles';

export function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [likedName, setLikedName] = useState('');

  useEffect(() => {
    let mounted = true;

    fetchDiscoveryPets()
      .then((result) => {
        if (mounted) {
          setPets(result);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const currentPet = pets[0];
  const compatibility = useMemo(() => {
    if (!currentPet) {
      return 0;
    }

    const base = currentPet.breeding_preferences?.looking_for_pair ? 84 : 72;
    const verifiedBonus = currentPet.is_verified_breeder_pet ? 8 : 0;
    return Math.min(base + verifiedBonus, 96);
  }, [currentPet]);

  const handleSwipe = (direction: 'like' | 'skip') => {
    if (!currentPet) {
      return;
    }

    if (direction === 'like' && currentPet.id === '1') {
      setLikedName(currentPet.name);
      setShowMatch(true);
    }

    setPets((previous) => previous.slice(1));
  };

  const reload = async () => {
    setLoading(true);
    const result = await fetchDiscoveryPets();
    setPets(result);
    setLoading(false);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top + theme.spacing.md, theme.spacing.xl) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <IconButton name="options-outline" accessibilityLabel="Abrir filtros" />
          <View style={styles.brandBlock}>
            <Text style={styles.eyebrow}>Tindog</Text>
            <Text style={styles.title}>Descubrir</Text>
          </View>
          <IconButton name="notifications-outline" accessibilityLabel="Abrir notificaciones" />
        </View>

        {loading ? (
          <View style={styles.emptyState} accessibilityRole="progressbar">
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : currentPet ? (
          <>
            <View style={styles.card}>
              <Image
                source={{ uri: currentPet.photos[0] }}
                style={styles.image}
                resizeMode="cover"
                accessibilityLabel={`Foto de ${currentPet.name}`}
              />
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>
                      {currentPet.name}, {currentPet.age}
                    </Text>
                    <Text style={styles.breed}>{currentPet.breed}</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Text style={styles.statPillText}>{compatibility}% match</Text>
                  </View>
                </View>

                <Text style={styles.bio}>{currentPet.bio}</Text>

                <View style={styles.traitRow}>
                  {currentPet.personality_traits.map((trait) => (
                    <View key={trait} style={styles.trait}>
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <IconButton
                name="close"
                accessibilityLabel="Pasar este perfil"
                color={theme.colors.danger}
                backgroundColor={theme.colors.dangerFaded}
                size={34}
                style={styles.actionButtonLarge}
                onPress={() => handleSwipe('skip')}
              />
              <IconButton
                name="star"
                accessibilityLabel="Marcar como favorito"
                color={theme.colors.info}
                backgroundColor={theme.colors.infoFaded}
                size={26}
              />
              <IconButton
                name="heart"
                accessibilityLabel="Dar like a este perfil"
                color={theme.colors.textInverse}
                backgroundColor={theme.colors.primary}
                size={34}
                style={styles.actionButtonLarge}
                onPress={() => handleSwipe('like')}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No quedan perfiles cerca</Text>
            <Text style={styles.emptyText}>Ajusta filtros o vuelve a cargar para explorar nuevos candidatos.</Text>
            <PrimaryButton label="Recargar perfiles" icon="refresh" onPress={reload} />
          </View>
        )}
      </ScrollView>

      <Modal visible={showMatch} transparent animationType="fade" onRequestClose={() => setShowMatch(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>Hay match</Text>
            <Text style={styles.matchText}>
              A {likedName} tambien le interesa conocer a Firulais. Ya puedes iniciar una conversacion.
            </Text>
            <PrimaryButton label="Continuar" icon="chatbubble-ellipses" onPress={() => setShowMatch(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
