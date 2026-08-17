// src/features/pets/screens/PetSearchScreen.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { webAllPets } from '@core/providers/WebAppProvider';
import { requestCoOwnership } from '@core/data/services/petService';
import { useRouter } from 'next/navigation';
import { WebContent, WebScreen } from '@shared/components/layout/WebScreen';
import { Avatar, Card, IconButton , useToast} from '@shared/components/ui';
import {
  Header, Title, SearchBar, StatusText, ResultsGrid, ResultCardBody, ResultIdentity, ResultCopy, RequestButton,
} from './PetSearchScreenStyled';

export function PetSearchScreen() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (query.trim().length <= 2) return [];
    const normalized = query.trim().toLowerCase();
    return webAllPets.filter((pet) => pet.name.toLowerCase().includes(normalized) || pet.breed.toLowerCase().includes(normalized));
  }, [query]);

  const handleRequest = async (petId: string) => {
    setRequestingId(petId);
    try {
      await requestCoOwnership(petId);
      toast({ title: 'Solicitud enviada', body: 'El dueño principal recibió tu mensaje.', tone: 'success' });
      router.push('/pets');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <WebScreen>
      <WebContent>
        <Header>
          <IconButton icon={ArrowLeft} label="Volver" onClick={() => router.back()} />
          <Title>Buscar Mascota</Title>
        </Header>

        <SearchBar>
          <Search size={20} />
          <input
            placeholder="Nombre o raza..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </SearchBar>

        <ResultsGrid>
          {results.map((pet) => (
            <Card key={pet.id} padding="1rem">
              <ResultCardBody>
                <ResultIdentity>
                  <Avatar src={pet.photos[0]} name={pet.name} size="md" />
                  <ResultCopy>
                    <h3>{pet.name}</h3>
                    <p>{pet.breed}</p>
                  </ResultCopy>
                </ResultIdentity>
                <RequestButton disabled={requestingId === pet.id} onClick={() => handleRequest(pet.id)}>
                  {requestingId === pet.id ? 'Enviando…' : 'Solicitar'}
                </RequestButton>
              </ResultCardBody>
            </Card>
          ))}
        </ResultsGrid>

        {query.trim().length > 2 && results.length === 0 ? (
          <StatusText>No se encontraron mascotas.</StatusText>
        ) : null}
      </WebContent>
    </WebScreen>
  );
}
