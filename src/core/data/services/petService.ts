// src/core/data/services/petService.ts
import { client } from '../client/AxiosClient';
import { Pet } from '@core/types/pet.types';

export async function fetchMyPets(): Promise<Pet[]> {
  const { data } = await client.get('/pets');
  return data;
}

export async function createPet(petData: Partial<Pet>): Promise<Pet> {
  const { data } = await client.get('/pets'); // This is a placeholder for actual creation logic in the route
  const response = await client.post('/pets', petData);
  return response.data;
}

export async function searchPets(query: string): Promise<Pet[]> {
  const { data } = await client.get(`/pets?query=${query}`);
  return data;
}

export async function requestCoOwnership(petId: string): Promise<void> {
  await client.post(`/pets/${petId}/co-ownership-request`);
}
