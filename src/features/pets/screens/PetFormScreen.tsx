// src/features/pets/screens/PetFormScreen.tsx
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import { createPet } from '@core/data/services/petService';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const FormWrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[8]};
  max-width: 500px;
  margin: 0 auto;
`;

const PhotoUpload = styled.div`
  width: 120px;
  height: 120px;
  border-radius: ${({ theme }) => theme.radius['2xl']};
  background: ${({ theme }) => theme.color.primaryFaded};
  border: 2px dashed ${({ theme }) => theme.color.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.primary};
  margin: 0 auto;
  cursor: pointer;
  gap: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.textSecondary};
  text-transform: uppercase;
  margin-left: 4px;
`;

const Input = styled.input`
  height: 56px;
  background: white;
  border: 2px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 0 ${({ theme }) => theme.spacing[4]};
  font-size: ${({ theme }) => theme.typography.size.base};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.primary};
    box-shadow: 0 0 0 4px ${({ theme }) => theme.color.primaryFaded};
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing[4]};
  background: ${({ theme }) => theme.color.backgroundSecondary || '#f8f9fa'};
  border-radius: ${({ theme }) => theme.radius.lg};
  cursor: pointer;
`;

const Toggle = styled.div<{ active: boolean }>`
  width: 50px;
  height: 28px;
  background: ${({ active, theme }) => active ? theme.color.primary : theme.color.border};
  border-radius: 14px;
  position: relative;
  transition: background 0.3s;

  &::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    background: white;
    border-radius: 50%;
    top: 3px;
    left: ${({ active }) => active ? '25px' : '3px'};
    transition: left 0.3s;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing[2]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const CheckboxItem = styled.div<{ active: boolean }>`
  padding: ${({ theme }) => theme.spacing[3]};
  border: 2px solid ${({ active, theme }) => active ? theme.color.primary : theme.color.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  text-align: center;
  cursor: pointer;
  background: ${({ active, theme }) => active ? theme.color.primaryFaded : 'white'};
  transition: all 0.2s;
`;

const CompetitionCard = styled.div`
  padding: ${({ theme }) => theme.spacing[4]};
  border: 1px solid ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  margin-bottom: ${({ theme }) => theme.spacing[3]};
  background: white;
`;

const HealthCard = styled(CompetitionCard)`
  border-left: 4px solid #4CAF50;
`;

const AddButton = styled.button`
  color: ${({ theme }) => theme.color.primary};
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
`;

export function PetFormScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: 'Macho' as 'Macho' | 'Hembra',
    weight: '',
    bio: '',
    has_papers: false,
    paper_types: [] as string[],
    is_competitor: false,
    competitions: [] as { name: string, year: number, award?: string }[],
    health_records: [] as { test_name: string, result: string, date: string }[],
    breeding_preferences: {
      looking_for_pair: false,
      terms: '',
      last_heat_cycle: '',
    },
    lineage: {
      father: '',
      mother: '',
      p_grandfather: '',
      p_grandmother: '',
      m_grandfather: '',
      m_grandmother: '',
    },
    coi_percentage: 0,
    is_verified_breeder_pet: false
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPet({
      ...formData,
      age: parseInt(formData.age),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      photos: ['https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=500'],
    });
    router.push('/pets');
  };

  return (
    <FormWrapper
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Nueva Mascota</h1>
      </div>

      <PhotoUpload>
        <Camera size={32} />
        <span>Añadir Foto</span>
      </PhotoUpload>

      <form 
        onSubmit={handleSubmit} 
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
        </div>

        <FormGroup>
          <Label>Sexo</Label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Macho', 'Hembra'].map((gender) => (
              <CheckboxItem 
                key={gender}
                active={formData.gender === gender}
                onClick={() => setFormData({ ...formData, gender: gender as any })}
                style={{ flex: 1 }}
              >
                {gender}
              </CheckboxItem>
            ))}
          </div>
        </FormGroup>

        <FormGroup>
          <Label>Biografía</Label>
          <Input 
            as="textarea"
            style={{ height: '100px', paddingTop: '12px' }}
            value={formData.bio}
            onChange={(e: any) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Cuenta algo sobre tu mascota..."
          />
        </FormGroup>

        <hr style={{ border: '0', borderTop: '1px solid #eee' }} />

        {/* SECCION SALUD */}
        <FormGroup>
          <Label>Salud y Genética</Label>
          <div style={{ marginTop: '0.5rem' }}>
            {formData.health_records.map((record, idx) => (
              <HealthCard key={idx}>
                <Input 
                  placeholder="Nombre del Test (Ej: Displasia Cadera)" 
                  value={record.test_name} 
                  onChange={(e) => updateHealthRecord(idx, 'test_name', e.target.value)}
                  style={{ height: '40px', marginBottom: '8px', width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Input 
                    placeholder="Resultado" 
                    value={record.result} 
                    onChange={(e) => updateHealthRecord(idx, 'result', e.target.value)}
                    style={{ height: '40px', flex: 1 }}
                  />
                  <Input 
                    type="date"
                    value={record.date} 
                    onChange={(e) => updateHealthRecord(idx, 'date', e.target.value)}
                    style={{ height: '40px', width: '130px' }}
                  />
                </div>
              </HealthCard>
            ))}
            <AddButton type="button" onClick={addHealthRecord}>
              + Añadir Test de Salud
            </AddButton>
          </div>
        </FormGroup>

        <hr style={{ border: '0', borderTop: '1px solid #eee' }} />

        {/* SECCION CRUZA */}
        <FormGroup>
          <Label>Citas y Cruza</Label>
          <SwitchContainer onClick={() => setFormData({ 
            ...formData, 
            breeding_preferences: { ...formData.breeding_preferences, looking_for_pair: !formData.breeding_preferences.looking_for_pair } 
          })}>
            <span>¿Busca pareja para cría?</span>
            <Toggle active={formData.breeding_preferences.looking_for_pair} />
          </SwitchContainer>
          
          {formData.breeding_preferences.looking_for_pair && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ marginTop: '1rem' }}>
                <Label>Términos de la Cruza</Label>
                <Input 
                  placeholder="Ej: Se busca macho con pedigree, acuerdo de cachorro..."
                  value={formData.breeding_preferences.terms}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    breeding_preferences: { ...formData.breeding_preferences, terms: e.target.value } 
                  })}
                  style={{ height: '45px', marginTop: '4px' }}
                />
              </div>
              {formData.gender === 'Hembra' && (
                <div style={{ marginTop: '1rem' }}>
                  <Label>Último Celo</Label>
                  <Input 
                    type="date"
                    value={formData.breeding_preferences.last_heat_cycle}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      breeding_preferences: { ...formData.breeding_preferences, last_heat_cycle: e.target.value } 
                    })}
                    style={{ height: '45px', marginTop: '4px' }}
                  />
                </div>
              )}
            </motion.div>
          )}
        </FormGroup>

        <hr style={{ border: '0', borderTop: '1px solid #eee' }} />

        {/* SECCION PAPELES */}
        <FormGroup>
          <Label>Documentación</Label>
          <SwitchContainer onClick={() => setFormData({ ...formData, has_papers: !formData.has_papers })}>
            <span>¿Tiene papeles/certificados?</span>
            <Toggle active={formData.has_papers} />
          </SwitchContainer>
          
          {formData.has_papers && (
            <CheckboxGroup>
              {PAPER_OPTIONS.map(opt => (
                <CheckboxItem 
                  key={opt} 
                  active={formData.paper_types.includes(opt)}
                  onClick={() => togglePaperType(opt)}
                >
                  {opt}
                </CheckboxItem>
              ))}
            </CheckboxGroup>
          )}
        </FormGroup>

        {/* SECCION COMPETENCIAS */}
        <FormGroup>
          <Label>Trayectoria</Label>
          <SwitchContainer onClick={() => setFormData({ ...formData, is_competitor: !formData.is_competitor })}>
            <span>¿Participa en concursos?</span>
            <Toggle active={formData.is_competitor} />
          </SwitchContainer>

          {formData.is_competitor && (
            <div style={{ marginTop: '1rem' }}>
              {formData.competitions.map((comp, idx) => (
                <CompetitionCard key={idx}>
                  <Input 
                    placeholder="Nombre del Torneo" 
                    value={comp.name} 
                    onChange={(e) => updateCompetition(idx, 'name', e.target.value)}
                    style={{ height: '40px', marginBottom: '8px', width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Input 
                      placeholder="Año" 
                      type="number"
                      value={comp.year} 
                      onChange={(e) => updateCompetition(idx, 'year', parseInt(e.target.value))}
                      style={{ height: '40px', width: '80px' }}
                    />
                    <Input 
                      placeholder="Premio (Opcional)" 
                      value={comp.award} 
                      onChange={(e) => updateCompetition(idx, 'award', e.target.value)}
                      style={{ height: '40px', flex: 1 }}
                    />
                  </div>
                </CompetitionCard>
              ))}
              <AddButton type="button" onClick={addCompetition}>
                + Añadir Competencia
              </AddButton>
            </div>
          )}
        </FormGroup>

        <hr style={{ border: '0', borderTop: '1px solid #eee' }} />

        {/* SECCION LINAJE */}
        <FormGroup>
          <Label>Linaje y Árbol Genealógico</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <Input 
              placeholder="Nombre del Padre" 
              value={formData.lineage.father}
              onChange={(e) => setFormData({ ...formData, lineage: { ...formData.lineage, father: e.target.value }})}
            />
            <Input 
              placeholder="Nombre de la Madre" 
              value={formData.lineage.mother}
              onChange={(e) => setFormData({ ...formData, lineage: { ...formData.lineage, mother: e.target.value }})}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem' }}>
            <Label style={{ margin: 0 }}>Coeficiente de Consanguinidad (COI %)</Label>
            <Input 
              type="number" 
              style={{ height: '40px', width: '80px' }} 
              value={formData.coi_percentage}
              onChange={(e) => setFormData({ ...formData, coi_percentage: parseFloat(e.target.value) })}
            />
          </div>
          <p style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px' }}>
            Un COI bajo (menor al 10%) es generalmente preferible para la salud genética.
          </p>
        </FormGroup>

        <SubmitButton 
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Check size={20} /> Guardar Perfil
        </SubmitButton>
      </form>
    </FormWrapper>
  );
}
