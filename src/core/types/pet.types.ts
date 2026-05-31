// src/core/types/pet.types.ts
export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  bio: string;
  photos: string[];
  owner_ids: string[];
  personality_traits: string[];
}
