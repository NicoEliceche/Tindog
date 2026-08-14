import { discoveryPets, myPets } from '../mock/pets';
import type { Pet } from '../../types/pet.types';
import { getStoredAuthToken } from './authTokenStorage';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

async function fetchJson<T>(path: string): Promise<T> {
  if (!apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const token = await getStoredAuthToken();
  const response = await fetch(`${apiUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchDiscoveryPets(): Promise<Pet[]> {
  try {
    return await fetchJson<Pet[]>('/api/pets');
  } catch {
    return discoveryPets;
  }
}

export async function fetchMyPets(): Promise<Pet[]> {
  try {
    return await fetchJson<Pet[]>('/api/pets?owner=me');
  } catch {
    return myPets;
  }
}
