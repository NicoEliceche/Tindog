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

/**
 * El backend devuelve 401 mientras no haya sesión, y una lista vacía deja la
 * pantalla sin nada que mostrar. Hasta que el ingreso esté conectado de
 * punta a punta, cualquier respuesta que no traiga perros cae a los datos de
 * prueba: es preferible una app con contenido de ejemplo a una app vacía.
 */
function withFallback(remote: Pet[] | undefined, fallback: Pet[]): Pet[] {
  return Array.isArray(remote) && remote.length > 0 ? remote : fallback;
}

export async function fetchDiscoveryPets(): Promise<Pet[]> {
  try {
    return withFallback(await fetchJson<Pet[]>('/api/pets'), discoveryPets);
  } catch {
    return discoveryPets;
  }
}

export async function fetchMyPets(): Promise<Pet[]> {
  try {
    return withFallback(await fetchJson<Pet[]>('/api/pets?owner=me'), myPets);
  } catch {
    return myPets;
  }
}
