import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useMemo, useRef, useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pickGalleryPhotos, pickGalleryVideo } from '../../../core/data/services/galleryPicker';
import { MAX_GALLERY_PHOTOS, PHOTO_HINT, VIDEO_HINT } from '../../../core/security/mediaLimits';
import type { PetMedia } from '../../../core/types/pet.types';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import { GoldHeading } from '../../../shared/components/GoldHeading';
import { useToast } from '../../../shared/components/Toast';
import type { Competition, Gender, HealthRecord } from '../../../core/types/pet.types';
import type { PetsStackParamList } from '../../../navigation/types';
import { createStyles } from './PetFormScreen.styles';

const PAPER_OPTIONS = ['Vacunación', 'Microchip', 'Pedigrí', 'Pasaporte'];

/** Foto de reserva cuando se guarda sin elegir imagen, igual que en la web. */
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=500';

export function PetFormScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const toast = useToast();
  const { createPet, updatePet, myPets } = useAppData();
  const route = useRoute<RouteProp<PetsStackParamList, 'PetForm'>>();
  // Con petId la pantalla edita una mascota existente; sin el, da de alta una
  // nueva. Es la misma pantalla porque los campos son exactamente los mismos.
  const editing = myPets.find((pet) => pet.id === route.params?.petId);

  const scrollRef = useRef<ScrollView>(null);

  const [name, setName] = useState(editing?.name ?? '');
  const [breed, setBreed] = useState(editing?.breed ?? '');
  const [age, setAge] = useState(editing ? String(editing.age) : '');
  const [weight, setWeight] = useState(editing?.weight != null ? String(editing.weight) : '');
  const [gender, setGender] = useState<Gender>(editing?.gender ?? 'Macho');
  const [bio, setBio] = useState(editing?.bio ?? '');

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(editing?.health_records ?? []);

  const [lookingForPair, setLookingForPair] = useState(editing?.breeding_preferences?.looking_for_pair ?? false);
  const [terms, setTerms] = useState(editing?.breeding_preferences?.terms ?? '');
  const [lastHeatCycle, setLastHeatCycle] = useState(editing?.breeding_preferences?.last_heat_cycle ?? '');

  const [hasPapers, setHasPapers] = useState(editing?.has_papers ?? false);
  const [paperTypes, setPaperTypes] = useState<string[]>(editing?.paper_types ?? []);

  const [isCompetitor, setIsCompetitor] = useState(editing?.is_competitor ?? false);
  const [competitions, setCompetitions] = useState<Competition[]>(editing?.competitions ?? []);

  const [father, setFather] = useState('');
  const [mother, setMother] = useState('');
  const [coi, setCoi] = useState(String(editing?.coi_percentage ?? 0));

  // Galeria: hasta diez fotos y un video, con los mismos limites que la web.
  const [media, setMedia] = useState<PetMedia[]>(
    editing?.media?.length
      ? editing.media
      : (editing?.photos ?? []).map((url, index) => ({ id: `m-${index}`, kind: 'photo' as const, url })),
  );
  const photos = media.filter((item) => item.kind === 'photo');
  const video = media.find((item) => item.kind === 'video');
  const [error, setError] = useState('');

  const addPhotos = async () => {
    const room = MAX_GALLERY_PHOTOS - photos.length;
    if (room <= 0) {
      toast({ title: 'Galería completa', body: `El máximo es ${MAX_GALLERY_PHOTOS} fotos. Quitá alguna para sumar otra.` });
      return;
    }
    const result = await pickGalleryPhotos(room);
    if (result.error) { toast({ title: 'No pudimos agregarla', body: result.error }); return; }
    if (!result.media.length) return;
    setMedia((current) => [
      ...current,
      ...result.media.map((item, index) => ({ id: `m-${Date.now()}-${index}`, kind: item.kind, url: item.uri })),
    ]);
  };

  const addVideo = async () => {
    const result = await pickGalleryVideo();
    if (result.error) { toast({ title: 'No pudimos agregarlo', body: result.error }); return; }
    const picked = result.media[0];
    if (!picked) return;
    setMedia((current) => [
      ...current.filter((item) => item.kind !== 'video'),
      { id: `v-${Date.now()}`, kind: 'video', url: picked.uri },
    ]);
  };

  const removeMedia = (id: string) => setMedia((current) => current.filter((item) => item.id !== id));

  const togglePaperType = (type: string) => {
    setPaperTypes((current) => current.includes(type)
      ? current.filter((item) => item !== type)
      : [...current, type]);
  };

  const addHealthRecord = () => {
    setHealthRecords((current) => [
      ...current,
      { test_name: '', result: '', date: new Date().toISOString().split('T')[0] },
    ]);
  };

  const updateHealthRecord = (index: number, field: keyof HealthRecord, value: string) => {
    setHealthRecords((current) => current.map((record, idx) => idx === index ? { ...record, [field]: value } : record));
  };

  const addCompetition = () => {
    setCompetitions((current) => [...current, { name: '', year: new Date().getFullYear(), award: '' }]);
  };

  const updateCompetition = (index: number, field: keyof Competition, value: string) => {
    setCompetitions((current) => current.map((competition, idx) => {
      if (idx !== index) return competition;
      if (field === 'year') return { ...competition, year: Number.parseInt(value, 10) || 0 };
      return { ...competition, [field]: value };
    }));
  };

  const handleSubmit = () => {
    // Nombre, raza y edad son los tres campos que la web marca como
    // obligatorios; sin ellos la tarjeta queda incompleta en la lista.
    if (!name.trim() || !breed.trim() || !age.trim()) {
      setError('Completá nombre, raza y edad para guardar el perfil.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const parsedAge = Number.parseInt(age, 10);
    if (Number.isNaN(parsedAge)) {
      setError('La edad tiene que ser un número.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    setError('');
    const draft = {
      name: name.trim(),
      breed: breed.trim(),
      age: parsedAge,
      weight: weight ? Number.parseFloat(weight) : undefined,
      gender,
      bio: bio.trim(),
      // `photos` sigue alimentando las tarjetas; `media` es la galeria.
      photos: photos.length ? photos.map((item) => item.url) : [FALLBACK_PHOTO],
      media,
      has_papers: hasPapers,
      paper_types: hasPapers ? paperTypes : [],
      is_competitor: isCompetitor,
      competitions: isCompetitor ? competitions : [],
      health_records: healthRecords,
      breeding_preferences: {
        looking_for_pair: lookingForPair,
        terms: terms.trim(),
        last_heat_cycle: lastHeatCycle.trim(),
      },
      coi_percentage: Number.parseFloat(coi) || 0,
      is_verified_breeder_pet: editing?.is_verified_breeder_pet ?? false,
    };

    if (editing) {
      updatePet(editing.id, draft);
      toast({ title: 'Perfil actualizado', body: `Guardamos los cambios de ${name.trim()}.` });
    } else {
      createPet(draft);
      toast({ title: 'Perfil guardado', body: `${name.trim()} ya aparece en tus perros.` });
    }
    navigation.goBack();
  };

  const switchTrack = { false: theme.colors.surfaceAlt, true: theme.colors.primaryFaded };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Mismo encabezado que la web: flecha y titulo en linea, sin barra
          ni indice de secciones (la web tampoco lo muestra en el telefono). */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.heading} />
        </Pressable>
        <GoldHeading style={styles.headerTitle}>{editing ? 'Editar mascota' : 'Nueva mascota'}</GoldHeading>
      </View>

      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: 24 }]}
      >
        <View style={styles.mediaGrid}>
          {media.map((item, index) => (
            <View key={item.id} style={styles.mediaTile}>
              <Image source={{ uri: item.url }} style={styles.mediaThumb} />
              {item.kind === 'video' ? (
                <View style={styles.mediaBadge}>
                  <Ionicons name="videocam" size={11} color={theme.colors.primary} />
                  <Text style={styles.mediaBadgeText}>Video</Text>
                </View>
              ) : index === 0 ? (
                <View style={styles.mediaBadge}><Text style={styles.mediaBadgeText}>Portada</Text></View>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.kind === 'video' ? 'Quitar el video' : `Quitar la foto ${index + 1}`}
                onPress={() => removeMedia(item.id)}
                style={styles.removeMedia}
              >
                <Ionicons name="close" size={13} color={theme.colors.text} />
              </Pressable>
            </View>
          ))}

          {photos.length < MAX_GALLERY_PHOTOS ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Elegir fotos de la mascota"
              onPress={addPhotos}
              style={styles.photoUpload}
            >
              <Ionicons name="camera" size={24} color={theme.colors.primary} />
              <Text style={styles.photoEmptyText}>Añadir fotos</Text>
            </Pressable>
          ) : null}

          {!video ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Elegir un video de la mascota"
              onPress={addVideo}
              style={styles.photoUpload}
            >
              <Ionicons name="videocam" size={24} color={theme.colors.primary} />
              <Text style={styles.photoEmptyText}>Añadir video</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.photoHint}>
          {photos.length}/{MAX_GALLERY_PHOTOS} fotos · {PHOTO_HINT}. {VIDEO_HINT}.
        </Text>

        <View style={styles.group}>
          <Text style={styles.label}>Nombre del Perro</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Firulais"
            placeholderTextColor={theme.colors.textMuted}
          />

          <Text style={styles.label}>Raza</Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="Ej: Golden Retriever"
            placeholderTextColor={theme.colors.textMuted}
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Edad</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                placeholder="Ej: 3"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="Ej: 25.5"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.chipRow}>
            {(['Macho', 'Hembra'] as Gender[]).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected: gender === option }}
                onPress={() => setGender(option)}
                style={[styles.chip, gender === option && styles.chipActive]}
              >
                <Text style={[styles.chipText, gender === option && styles.chipTextActive]}>{option}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Biografía</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="Contá algo sobre tu mascota..."
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.group}>
          <Text style={styles.sectionTitle}>Salud y Genética</Text>
          {healthRecords.map((record, index) => (
            <View key={index} style={styles.card}>
              <TextInput
                style={styles.input}
                value={record.test_name}
                onChangeText={(value) => updateHealthRecord(index, 'test_name', value)}
                placeholder="Nombre del Test (Ej: Displasia Cadera)"
                placeholderTextColor={theme.colors.textMuted}
              />
              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <TextInput
                    style={styles.input}
                    value={record.result}
                    onChangeText={(value) => updateHealthRecord(index, 'result', value)}
                    placeholder="Resultado"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                <View style={styles.rowItem}>
                  <TextInput
                    style={styles.input}
                    value={record.date}
                    onChangeText={(value) => updateHealthRecord(index, 'date', value)}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              </View>
            </View>
          ))}
          <Pressable accessibilityRole="button" onPress={addHealthRecord} style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Añadir Test de Salud</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.group}>
          <Text style={styles.sectionTitle}>Citas y Cruza</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>¿Busca pareja para cría?</Text>
            <Switch
              value={lookingForPair}
              onValueChange={setLookingForPair}
              trackColor={switchTrack}
              thumbColor={lookingForPair ? theme.colors.primary : theme.colors.textMuted}
              accessibilityLabel="¿Busca pareja para cría?"
            />
          </View>

          {lookingForPair ? (
            <View style={styles.reveal}>
              <Text style={styles.label}>Términos de la Cruza</Text>
              <TextInput
                style={styles.input}
                value={terms}
                onChangeText={setTerms}
                placeholder="Ej: Se busca macho con pedigrí, acuerdo de cachorro..."
                placeholderTextColor={theme.colors.textMuted}
              />
              {gender === 'Hembra' ? (
                <>
                  <Text style={styles.label}>Último Celo</Text>
                  <TextInput
                    style={styles.input}
                    value={lastHeatCycle}
                    onChangeText={setLastHeatCycle}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.group}>
          <Text style={styles.sectionTitle}>Documentación</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>¿Tiene papeles/certificados?</Text>
            <Switch
              value={hasPapers}
              onValueChange={setHasPapers}
              trackColor={switchTrack}
              thumbColor={hasPapers ? theme.colors.primary : theme.colors.textMuted}
              accessibilityLabel="¿Tiene papeles o certificados?"
            />
          </View>

          {hasPapers ? (
            <View style={styles.chipWrap}>
              {PAPER_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="button"
                  accessibilityState={{ selected: paperTypes.includes(option) }}
                  onPress={() => togglePaperType(option)}
                  style={[styles.chip, paperTypes.includes(option) && styles.chipActive]}
                >
                  <Text style={[styles.chipText, paperTypes.includes(option) && styles.chipTextActive]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.group}>
          <Text style={styles.sectionTitle}>Trayectoria</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>¿Participa en concursos?</Text>
            <Switch
              value={isCompetitor}
              onValueChange={setIsCompetitor}
              trackColor={switchTrack}
              thumbColor={isCompetitor ? theme.colors.primary : theme.colors.textMuted}
              accessibilityLabel="¿Participa en concursos?"
            />
          </View>

          {isCompetitor ? (
            <View style={styles.reveal}>
              {competitions.map((competition, index) => (
                <View key={index} style={styles.card}>
                  <TextInput
                    style={styles.input}
                    value={competition.name}
                    onChangeText={(value) => updateCompetition(index, 'name', value)}
                    placeholder="Nombre del Torneo"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                  <View style={styles.row}>
                    <View style={styles.rowItem}>
                      <TextInput
                        style={styles.input}
                        value={String(competition.year)}
                        onChangeText={(value) => updateCompetition(index, 'year', value)}
                        keyboardType="number-pad"
                        placeholder="Año"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                    </View>
                    <View style={styles.rowItem}>
                      <TextInput
                        style={styles.input}
                        value={competition.award}
                        onChangeText={(value) => updateCompetition(index, 'award', value)}
                        placeholder="Premio (Opcional)"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                    </View>
                  </View>
                </View>
              ))}
              <Pressable accessibilityRole="button" onPress={addCompetition} style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Añadir Competencia</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.group}>
          <Text style={styles.sectionTitle}>Linaje y Árbol Genealógico</Text>
          <TextInput
            style={styles.input}
            value={father}
            onChangeText={setFather}
            placeholder="Nombre del Padre"
            placeholderTextColor={theme.colors.textMuted}
          />
          <TextInput
            style={styles.input}
            value={mother}
            onChangeText={setMother}
            placeholder="Nombre de la Madre"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.label}>Coeficiente de Consanguinidad (COI %)</Text>
          <TextInput
            style={styles.input}
            value={coi}
            onChangeText={setCoi}
            keyboardType="decimal-pad"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={styles.helper}>
            Un COI bajo (menor al 10%) es generalmente preferible para la salud genética.
          </Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      {/* Sin insets.bottom: la barra de pestanas ya reserva el area segura. */}
      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={handleSubmit} style={styles.submit}>
          <Ionicons name="checkmark" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.submitText}>{editing ? 'Actualizar perfil' : 'Guardar perfil'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
