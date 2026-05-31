// src/features/pets/screens/PetSearchScreen.tsx
'use client';

import React, { useState } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { Pet } from '@core/types/pet.types';
import { searchPets, requestCoOwnership } from '@core/data/services/petService';
import { useRouter } from 'next/navigation';
import {
  ScreenWrapper,
  SearchBar,
  ResultsList,
  ResultCard,
  PetAvatar,
  RequestButton,
} from './PetSearchScreenStyled';
import { PetInfo, PetName, PetBreed } from './PetListScreenStyled';

export function PetSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length > 2) {
      setLoading(true);
      const data = await searchPets(value);
      setResults(data);
      setLoading(false);
    } else {
      setResults([]);
    }
  };

  const handleRequest = async (petId: string) => {
    await requestCoOwnership(petId);
    alert('Solicitud enviada al dueño principal.');
    router.push('/pets');
  };

  return (
    <ScreenWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <ArrowLeft onClick={() => router.back()} style={{ cursor: 'pointer' }} />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Buscar Mascota</h1>
      </div>

      <SearchBar>
        <Search size={20} color="#636E72" />
        <input 
          placeholder="Nombre o raza..." 
          value={query}
          onChange={handleSearch}
        />
      </SearchBar>

      <ResultsList>
        {loading && <p>Buscando...</p>}
        {!loading && results.map((pet) => (
          <ResultCard key={pet.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <PetAvatar src={pet.photos[0]} alt={pet.name} />
              <PetInfo>
                <PetName>{pet.name}</PetName>
                <PetBreed>{pet.breed}</PetBreed>
              </PetInfo>
            </div>
            <RequestButton onClick={() => handleRequest(pet.id)}>
              Solicitar
            </RequestButton>
          </ResultCard>
        ))}
        {!loading && query.length > 2 && results.length === 0 && (
          <p style={{ textAlign: 'center', color: '#636E72' }}>No se encontraron mascotas.</p>
        )}
      </ResultsList>
    </ScreenWrapper>
  );
}
