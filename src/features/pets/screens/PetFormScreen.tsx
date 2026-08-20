// src/features/pets/screens/PetFormScreen.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWebApp } from '@core/providers/WebAppProvider';
import { motion } from 'framer-motion';
import { Toggle } from '@shared/components/ui';
import {
  AddButton, BackButton, CardTopInput, CheckboxGroup, CheckboxItem, CheckboxRow,
  CoiInput, CompetitionCard, DateSmallInput, Divider, FieldGrid, FieldRow, Form, FormColumn,
  FormGroup, FormWrapper, HealthCard, Header, HeaderTitle, HelperText, InlineLabelRow,
  Input, Label, Layout, LineageGrid, PhotoUpload, PhotoHint, RevealGroup, SectionBody, SectionNav,
  SectionNavLink, SmallInput, SubmitBar, SubmitButton, SwitchContainer, TextArea, YearInput,
} from './PetFormScreenStyled';

const SECTIONS = [
  { id: 'basic', label: 'Datos básicos' },
  { id: 'health', label: 'Salud' },
  { id: 'breeding', label: 'Cría' },
  { id: 'papers', label: 'Documentación' },
  { id: 'competitions', label: 'Competencias' },
  { id: 'lineage', label: 'Linaje' },
];

export function PetFormScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { myPets, createPet, updatePet } = useWebApp();
  // Con ?petId la pantalla edita una mascota existente; sin el, da de alta
  // una nueva. Es el mismo formulario porque los campos son identicos.
  const editing = myPets.find((pet) => pet.id === params.get('petId'));
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const [formData, setFormData] = useState({
    name: editing?.name ?? '',
    breed: editing?.breed ?? '',
    age: editing ? String(editing.age) : '',
    gender: (editing?.gender ?? 'Macho') as 'Macho' | 'Hembra',
    weight: editing?.weight != null ? String(editing.weight) : '',
    bio: editing?.bio ?? '',
    has_papers: editing?.has_papers ?? false,
    paper_types: (editing?.paper_types ?? []) as string[],
    is_competitor: editing?.is_competitor ?? false,
    competitions: (editing?.competitions ?? []) as { name: string, year: number, award?: string }[],
    health_records: (editing?.health_records ?? []) as { test_name: string, result: string, date: string }[],
    breeding_preferences: {
      looking_for_pair: editing?.breeding_preferences?.looking_for_pair ?? false,
      terms: editing?.breeding_preferences?.terms ?? '',
      last_heat_cycle: editing?.breeding_preferences?.last_heat_cycle ?? '',
    },
    lineage: {
      father: '',
      mother: '',
      p_grandfather: '',
      p_grandmother: '',
      m_grandfather: '',
      m_grandmother: '',
    },
    coi_percentage: editing?.coi_percentage ?? 0,
    is_verified_breeder_pet: editing?.is_verified_breeder_pet ?? false
  });

  const PAPER_OPTIONS = ['Vacunación', 'Microchip', 'Pedigrí', 'Pasaporte'];

  const togglePaperType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      paper_types: prev.paper_types.includes(type)
        ? prev.paper_types.filter(t => t !== type)
        : [...prev.paper_types, type]
    }));
  };

  const addCompetition = () => {
    setFormData(prev => ({
      ...prev,
      competitions: [...prev.competitions, { name: '', year: new Date().getFullYear(), award: '' }]
    }));
  };

  const updateCompetition = (index: number, field: string, value: any) => {
    const newComps = [...formData.competitions];
    newComps[index] = { ...newComps[index], [field]: value };
    setFormData({ ...formData, competitions: newComps });
  };

  const addHealthRecord = () => {
    setFormData(prev => ({
      ...prev,
      health_records: [...prev.health_records, { test_name: '', result: '', date: new Date().toISOString().split('T')[0] }]
    }));
  };

  const updateHealthRecord = (index: number, field: string, value: any) => {
    const newRecords = [...formData.health_records];
    newRecords[index] = { ...newRecords[index], [field]: value };
    setFormData({ ...formData, health_records: newRecords });
  };

  /**
   * Foto de la mascota. Se guarda como data URL en el mock; con backend
   * real acá iría la subida al almacenamiento y se guardaría la URL.
   */
  const [photo, setPhoto] = useState(editing?.photos[0] ?? '');
  const [photoError, setPhotoError] = useState('');
  const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPhotoError('El archivo tiene que ser una imagen.');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError('La imagen no puede superar los 5 MB.');
      return;
    }
    setPhotoError('');
    const reader = new FileReader();
    reader.onload = () => setPhoto(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => setPhotoError('No pudimos leer el archivo. Probá con otro.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const draft = {
      ...formData,
      age: parseInt(formData.age),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      // Sin foto elegida se usa una de reserva para que la tarjeta no quede
      // vacía en la lista.
      photos: [photo || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=500'],
    };
    if (editing) updatePet(editing.id, draft);
    else createPet(draft);
    router.push('/pets');
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );

    Object.values(sectionRefs.current).forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <FormWrapper
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Header>
        <BackButton onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </BackButton>
        <HeaderTitle>{editing ? 'Editar mascota' : 'Nueva mascota'}</HeaderTitle>
      </Header>

      <Layout>
        <SectionNav aria-label="Secciones del formulario">
          {SECTIONS.map((section) => (
            <SectionNavLink
              key={section.id}
              href={`#${section.id}`}
              $active={activeSection === section.id}
            >
              {section.label}
            </SectionNavLink>
          ))}
        </SectionNav>

        <FormColumn>
          <div>
            <PhotoUpload>
              {photo ? <img src={photo} alt="Vista previa de la foto elegida" /> : (<>
                <Camera size={32} />
                <span>Añadir Foto</span>
              </>)}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                aria-label="Elegir foto de la mascota"
              />
            </PhotoUpload>
            <PhotoHint $error={!!photoError}>
              {photoError || (photo ? 'Tocá la foto para cambiarla.' : 'JPG o PNG, hasta 5 MB.')}
            </PhotoHint>
          </div>

          <Form onSubmit={handleSubmit}>
            <FormGroup id="basic" ref={(el) => { sectionRefs.current.basic = el; }}>
              <FieldGrid>
                <FormGroup>
                  <Label>Nombre del Perro</Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Firulais"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Raza</Label>
                  <Input
                    required
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="Ej: Golden Retriever"
                  />
                </FormGroup>
              </FieldGrid>

              <FieldGrid>
                <FormGroup>
                  <Label>Edad</Label>
                  <Input
                    required
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ej: 3"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Ej: 25.5"
                  />
                </FormGroup>
              </FieldGrid>

              <FormGroup>
                <Label>Sexo</Label>
                <CheckboxRow>
                  {['Macho', 'Hembra'].map((gender) => (
                    <CheckboxItem
                      key={gender}
                      $active={formData.gender === gender}
                      onClick={() => setFormData({ ...formData, gender: gender as any })}
                    >
                      {gender}
                    </CheckboxItem>
                  ))}
                </CheckboxRow>
              </FormGroup>

              <FormGroup>
                <Label>Biografía</Label>
                <TextArea
                  value={formData.bio}
                  onChange={(e: any) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Cuenta algo sobre tu mascota..."
                />
              </FormGroup>
            </FormGroup>

            <Divider />

            {/* SECCION SALUD */}
            <FormGroup id="health" ref={(el) => { sectionRefs.current.health = el; }}>
              <Label>Salud y Genética</Label>
              <SectionBody>
                {formData.health_records.map((record, idx) => (
                  <HealthCard key={idx}>
                    <CardTopInput
                      placeholder="Nombre del Test (Ej: Displasia Cadera)"
                      value={record.test_name}
                      onChange={(e) => updateHealthRecord(idx, 'test_name', e.target.value)}
                    />
                    <FieldRow>
                      <SmallInput
                        placeholder="Resultado"
                        value={record.result}
                        onChange={(e) => updateHealthRecord(idx, 'result', e.target.value)}
                      />
                      <DateSmallInput
                        type="date"
                        value={record.date}
                        onChange={(e) => updateHealthRecord(idx, 'date', e.target.value)}
                      />
                    </FieldRow>
                  </HealthCard>
                ))}
                <AddButton type="button" onClick={addHealthRecord}>
                  + Añadir Test de Salud
                </AddButton>
              </SectionBody>
            </FormGroup>

            <Divider />

            {/* SECCION CRUZA */}
            <FormGroup id="breeding" ref={(el) => { sectionRefs.current.breeding = el; }}>
              <Label>Citas y Cruza</Label>
              <SwitchContainer onClick={() => setFormData({
                ...formData,
                breeding_preferences: { ...formData.breeding_preferences, looking_for_pair: !formData.breeding_preferences.looking_for_pair }
              })}>
                <span>¿Busca pareja para cría?</span>
                <Toggle
                  checked={formData.breeding_preferences.looking_for_pair}
                  onChange={(checked) => setFormData({
                    ...formData,
                    breeding_preferences: { ...formData.breeding_preferences, looking_for_pair: checked }
                  })}
                  ariaLabel="¿Busca pareja para cría?"
                />
              </SwitchContainer>

              {formData.breeding_preferences.looking_for_pair && (
                <RevealGroup initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <FormGroup>
                    <Label>Términos de la Cruza</Label>
                    <Input
                      placeholder="Ej: Se busca macho con pedigree, acuerdo de cachorro..."
                      value={formData.breeding_preferences.terms}
                      onChange={(e) => setFormData({
                        ...formData,
                        breeding_preferences: { ...formData.breeding_preferences, terms: e.target.value }
                      })}
                    />
                  </FormGroup>
                  {formData.gender === 'Hembra' && (
                    <FormGroup>
                      <Label>Último Celo</Label>
                      <Input
                        type="date"
                        value={formData.breeding_preferences.last_heat_cycle}
                        onChange={(e) => setFormData({
                          ...formData,
                          breeding_preferences: { ...formData.breeding_preferences, last_heat_cycle: e.target.value }
                        })}
                      />
                    </FormGroup>
                  )}
                </RevealGroup>
              )}
            </FormGroup>

            <Divider />

            {/* SECCION PAPELES */}
            <FormGroup id="papers" ref={(el) => { sectionRefs.current.papers = el; }}>
              <Label>Documentación</Label>
              <SwitchContainer onClick={() => setFormData({ ...formData, has_papers: !formData.has_papers })}>
                <span>¿Tiene papeles/certificados?</span>
                <Toggle
                  checked={formData.has_papers}
                  onChange={(checked) => setFormData({ ...formData, has_papers: checked })}
                  ariaLabel="¿Tiene papeles/certificados?"
                />
              </SwitchContainer>

              {formData.has_papers && (
                <CheckboxGroup>
                  {PAPER_OPTIONS.map(opt => (
                    <CheckboxItem
                      key={opt}
                      $active={formData.paper_types.includes(opt)}
                      onClick={() => togglePaperType(opt)}
                    >
                      {opt}
                    </CheckboxItem>
                  ))}
                </CheckboxGroup>
              )}
            </FormGroup>

            {/* SECCION COMPETENCIAS */}
            <FormGroup id="competitions" ref={(el) => { sectionRefs.current.competitions = el; }}>
              <Label>Trayectoria</Label>
              <SwitchContainer onClick={() => setFormData({ ...formData, is_competitor: !formData.is_competitor })}>
                <span>¿Participa en concursos?</span>
                <Toggle
                  checked={formData.is_competitor}
                  onChange={(checked) => setFormData({ ...formData, is_competitor: checked })}
                  ariaLabel="¿Participa en concursos?"
                />
              </SwitchContainer>

              {formData.is_competitor && (
                <SectionBody>
                  {formData.competitions.map((comp, idx) => (
                    <CompetitionCard key={idx}>
                      <CardTopInput
                        placeholder="Nombre del Torneo"
                        value={comp.name}
                        onChange={(e) => updateCompetition(idx, 'name', e.target.value)}
                      />
                      <FieldRow>
                        <YearInput
                          placeholder="Año"
                          type="number"
                          value={comp.year}
                          onChange={(e) => updateCompetition(idx, 'year', parseInt(e.target.value))}
                        />
                        <SmallInput
                          placeholder="Premio (Opcional)"
                          value={comp.award}
                          onChange={(e) => updateCompetition(idx, 'award', e.target.value)}
                        />
                      </FieldRow>
                    </CompetitionCard>
                  ))}
                  <AddButton type="button" onClick={addCompetition}>
                    + Añadir Competencia
                  </AddButton>
                </SectionBody>
              )}
            </FormGroup>

            <Divider />

            {/* SECCION LINAJE */}
            <FormGroup id="lineage" ref={(el) => { sectionRefs.current.lineage = el; }}>
              <Label>Linaje y Árbol Genealógico</Label>
              <LineageGrid>
                <Input
                  placeholder="Nombre del Padre"
                  value={formData.lineage.father}
                  onChange={(e) => setFormData({ ...formData, lineage: { ...formData.lineage, father: e.target.value } })}
                />
                <Input
                  placeholder="Nombre de la Madre"
                  value={formData.lineage.mother}
                  onChange={(e) => setFormData({ ...formData, lineage: { ...formData.lineage, mother: e.target.value } })}
                />
              </LineageGrid>
              <InlineLabelRow>
                <Label>Coeficiente de Consanguinidad (COI %)</Label>
                <CoiInput
                  type="number"
                  value={formData.coi_percentage}
                  onChange={(e) => setFormData({ ...formData, coi_percentage: parseFloat(e.target.value) })}
                />
              </InlineLabelRow>
              <HelperText>
                Un COI bajo (menor al 10%) es generalmente preferible para la salud genética.
              </HelperText>
            </FormGroup>

            <SubmitBar>
              <SubmitButton
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Check size={20} /> {editing ? 'Actualizar perfil' : 'Guardar perfil'}
              </SubmitButton>
            </SubmitBar>
          </Form>
        </FormColumn>
      </Layout>
    </FormWrapper>
  );
}
