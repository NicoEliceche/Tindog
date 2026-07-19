// src/core/data/services/petService.ts
import { client } from '../client/AxiosClient';
import { Pet } from '@core/types/pet.types';

export async function fetchMyPets(): Promise<Pet[]> {
  const { data } = await client.get('/api/pets');
  return data;
}

export async function createPet(petData: Partial<Pet>): Promise<Pet> {
  const response = await client.post('/api/pets', petData);
  return response.data;
}

export async function searchPets(query: string): Promise<Pet[]> {
  const { data } = await client.get(`/api/pets?query=${query}`);
  return data;
}

export async function requestCoOwnership(petId: string): Promise<void> {
  await client.post(`/api/pets/${petId}/co-ownership-request`);
}
