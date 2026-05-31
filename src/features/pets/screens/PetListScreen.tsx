// src/features/pets/screens/PetListScreen.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Dog } from 'lucide-react';
import { Pet } from '@core/types/pet.types';
import { fetchMyPets } from '@core/data/services/petService';
import { useRouter } from 'next/navigation';
import {
  ScreenWrapper,
  Header,
  Title,
  PetGrid,
  PetCard,
  PetAvatar,
  PetInfo,
  PetName,
  PetBreed,
  AddButton,
  SearchBox,
  SearchTitle,
} from './PetListScreenStyled';

export function PetListScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMyPets().then((data) => {
      setPets(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando tus mascotas...</div>;

  return (
    <ScreenWrapper>
      <Header>
        <Title>Mis Mascotas</Title>
        <AddButton onClick={() => router.push('/pets/add')}>
          <Plus size={20} /> Nuevo
        </AddButton>
      </Header>

      {pets.length > 0 ? (
        <PetGrid>
          {pets.map((pet) => (
            <PetCard key={pet.id}>
              <PetAvatar src={pet.photos[0] || 'https://via.placeholder.com/60'} alt={pet.name} />
              <PetInfo>
                <PetName>{pet.name}</PetName>
                <PetBreed>{pet.breed}</PetBreed>
              </PetInfo>
            </PetCard>
          ))}
        </PetGrid>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#636E72' }}>
          <Dog size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Aún no has agregado ninguna mascota.</p>
        </div>
      )}

      <SearchBox>
        <SearchTitle>¿Buscas un perro que ya existe?</SearchTitle>
        <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#636E72' }}>
          Solicita co-propiedad para compartir la agenda de tu mascota.
        </p>
        <AddButton 
          style={{ background: '#4ECDC4', margin: '0 auto' }}
          onClick={() => router.push('/pets/search')}
        >
          <Search size={18} /> Buscar Perro
        </AddButton>
      </SearchBox>
    </ScreenWrapper>
  );
}
