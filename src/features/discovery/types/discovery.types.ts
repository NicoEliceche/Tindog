// src/features/discovery/types/discovery.types.ts
import { Pet } from '@core/types/pet.types';

export interface DiscoveryState {
  deck: Pet[];
  currentIndex: number;
  matches: string[];
}
