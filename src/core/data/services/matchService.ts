// src/core/data/services/matchService.ts
import { Pet } from '@core/types/pet.types';

const MOCK_MATCHES: Pet[] = [
  {
    id: 'm1',
    name: 'Luna',
    breed: 'Border Collie',
    gender: 'Hembra',
    age: 2,
    bio: 'Muy activa.',
    photos: ['https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=500'],
    owner_ids: ['u2'],
    personality_traits: ['Inteligente'],
    has_papers: true,
    is_competitor: false,
  }
];

export async function fetchMatches(): Promise<Pet[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_MATCHES), 500));
}
