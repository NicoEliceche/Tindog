// src/core/data/services/petService.ts
import { client } from '../client/AxiosClient';
import { Pet } from '@core/types/pet.types';

// MOCK DATA
const MOCK_MY_PETS: Pet[] = [
  {
    id: 'p1',
    name: 'Firulais',
    breed: 'Golden Retriever',
    age: 3,
    bio: 'El rey de la casa.',
    photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=500'],
    owner_ids: ['u-current'],
    personality_traits: ['Cariñoso'],
  }
];

export async function fetchMyPets(): Promise<Pet[]> {
  // En un entorno real: await client.get('/pets/me');
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_MY_PETS), 500));
}

export async function createPet(petData: Partial<Pet>): Promise<Pet> {
  const newPet: Pet = {
    id: Math.random().toString(36).substr(2, 9),
    name: petData.name || '',
    breed: petData.breed || '',
    age: petData.age || 0,
    bio: petData.bio || '',
    photos: petData.photos || [],
    owner_ids: ['u-current'],
    personality_traits: petData.personality_traits || [],
  };
  // En un entorno real: const { data } = await client.post('/pets', newPet);
  return new Promise((resolve) => setTimeout(() => resolve(newPet), 800));
}

export async function searchPets(query: string): Promise<Pet[]> {
  // Simulación de búsqueda global para co-propiedad
  const allPets: Pet[] = [
    ...MOCK_MY_PETS,
    {
      id: 'p2',
      name: 'Luna',
      breed: 'Border Collie',
      age: 2,
      bio: 'Muy activa.',
      photos: ['https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=500'],
      owner_ids: ['u2'],
      personality_traits: ['Inteligente'],
    }
  ];
  
  return new Promise((resolve) => {
    const results = allPets.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.breed.toLowerCase().includes(query.toLowerCase())
    );
    setTimeout(() => resolve(results), 500);
  });
}

export async function requestCoOwnership(petId: string): Promise<void> {
  // await client.post(`/pets/${petId}/co-ownership-request`);
  return new Promise((resolve) => setTimeout(resolve, 600));
}
