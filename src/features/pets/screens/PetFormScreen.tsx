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

const SubmitButton = styled(motion.button)`
  background: ${({ theme }) => theme.color.primary};
  color: white;
  height: 56px;
  border-radius: ${({ theme }) => theme.radius.full};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  font-size: 1.1rem;
  box-shadow: 0 10px 20px rgba(255, 107, 107, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export function PetFormScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    bio: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPet({
      ...formData,
      age: parseInt(formData.age),
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
