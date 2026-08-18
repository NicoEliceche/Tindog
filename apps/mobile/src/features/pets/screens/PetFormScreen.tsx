import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMemo, useRef, useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, TextInput, View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pickProfilePhoto } from '../../../core/data/services/profilePhotoPicker';
import { useAppData } from '../../../core/providers/AppDataProvider';
import { useAppTheme } from '../../../core/providers/AppPreferencesProvider';
import { useToast } from '../../../shared/components/Toast';
import type { Competition, Gender, HealthRecord } from '../../../core/types/pet.types';
import { createStyles } from './PetFormScreen.styles';

/** Mismas secciones y en el mismo orden que el formulario de la web. */
const SECTIONS = [
  { id: 'basic', label: 'Datos básicos' },
  { id: 'health', label: 'Salud' },
  { id: 'breeding', label: 'Cría' },
  { id: 'papers', label: 'Documentación' },
  { id: 'competitions', label: 'Competencias' },
  { id: 'lineage', label: 'Linaje' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

const PAPER_OPTIONS = ['Vacunación', 'Microchip', 'Pedigrí', 'Pasaporte'];

/** Foto de reserva cuando se guarda sin elegir imagen, igual que en la web. */
const FALLBACK_PHOTO = 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=500';

export function PetFormScreen() {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const toast = useToast();
  const { createPet } = useAppData();

  const scrollRef = useRef<ScrollView>(null);
  // Donde arranca cada sección dentro del scroll, medido en el onLayout. Es lo
  // que permite que el índice de arriba salte a la sección: en la web eso lo
  // resuelve el navegador con anchors, acá hay que medirlo a mano.
  const sectionOffsets = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState<SectionId>('basic');

  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<Gender>('Macho');
  const [bio, setBio] = useState('');

  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);

  const [lookingForPair, setLookingForPair] = useState(false);
  const [terms, setTerms] = useState('');
  const [lastHeatCycle, setLastHeatCycle] = useState('');

  const [hasPapers, setHasPapers] = useState(false);
  const [paperTypes, setPaperTypes] = useState<string[]>([]);

  const [isCompetitor, setIsCompetitor] = useState(false);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  const [father, setFather] = useState('');
  const [mother, setMother] = useState('');
  const [coi, setCoi] = useState('0');

  const [photo, setPhoto] = useState('');
  const [error, setError] = useState('');

  const changePhoto = async () => {
    const uri = await pickProfilePhoto();
    if (!uri) {
      toast({ title: 'Foto sin cambios', body: 'Elegí una imagen y permití el acceso a tus fotos.' });
      return;
    }
    setPhoto(uri);
  };

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

  const goToSection = (id: SectionId) => {
    setActiveSection(id);
    const offset = sectionOffsets.current[id];
    if (offset !== undefined) scrollRef.current?.scrollTo({ y: Math.max(offset - 12, 0), animated: true });
  };

  /** Registra dónde arranca cada sección para que el índice pueda saltar ahí. */
  const measure = (id: SectionId) => (event: LayoutChangeEvent) => {
    sectionOffsets.current[id] = event.nativeEvent.layout.y;
  };

  const handleSubmit = () => {
    // Nombre, raza y edad son los tres campos que la web marca como
    // obligatorios; sin ellos la tarjeta queda incompleta en la lista.
    if (!name.trim() || !breed.trim() || !age.trim()) {
      setError('Completá nombre, raza y edad para guardar el perfil.');
      goToSection('basic');
      return;
    }

    const parsedAge = Number.parseInt(age, 10);
    if (Number.isNaN(parsedAge)) {
      setError('La edad tiene que ser un número.');
      goToSection('basic');
      return;
    }

    setError('');
    createPet({
      name: name.trim(),
      breed: breed.trim(),
      age: parsedAge,
      weight: weight ? Number.parseFloat(weight) : undefined,
      gender,
      bio: bio.trim(),
      photos: [photo || FALLBACK_PHOTO],
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
      is_verified_breeder_pet: false,
    });

    toast({ title: 'Perfil guardado', body: `${name.trim()} ya aparece en tus perros.` });
    navigation.goBack();
  };

  const switchTrack = { false: theme.colors.surfaceAlt, true: theme.colors.primaryFaded };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.sectionNav}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionNavContent}>
          {SECTIONS.map((section) => (
            <Pressable
              key={section.id}
              accessibilityRole="button"
              accessibilityState={{ selected: activeSection === section.id }}
              onPress={() => goToSection(section.id)}
              style={[styles.sectionChip, activeSection === section.id && styles.sectionChipActive]}
            >
              <Text style={[styles.sectionChipText, activeSection === section.id && styles.sectionChipTextActive]}>
                {section.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 96 }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Elegir foto de la mascota"
          onPress={changePhoto}
          style={styles.photoUpload}
        >
          {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : (
            <View style={styles.photoEmpty}>
              <Ionicons name="camera" size={32} color={theme.colors.primary} />
              <Text style={styles.photoEmptyText}>Añadir Foto</Text>
            </View>
          )}
        </Pressable>
        <Text style={styles.photoHint}>
          {photo ? 'Tocá la foto para cambiarla.' : 'JPG o PNG, hasta 5 MB.'}
        </Text>

        <View onLayout={measure('basic')} style={styles.group}>
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

        <View onLayout={measure('health')} style={styles.group}>
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

        <View onLayout={measure('breeding')} style={styles.group}>
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

        <View onLayout={measure('papers')} style={styles.group}>
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

        <View onLayout={measure('competitions')} style={styles.group}>
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

        <View onLayout={measure('lineage')} style={styles.group}>
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

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable accessibilityRole="button" onPress={handleSubmit} style={styles.submit}>
          <Ionicons name="checkmark" size={20} color={theme.colors.onPrimary} />
          <Text style={styles.submitText}>Guardar Perfil</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
