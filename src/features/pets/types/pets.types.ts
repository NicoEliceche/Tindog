// src/features/pets/types/pets.types.ts
import { Pet } from '@core/types/pet.types';

export interface PetsState {
  myPets: Pet[];
  isLoading: boolean;
  error: string | null;
}
