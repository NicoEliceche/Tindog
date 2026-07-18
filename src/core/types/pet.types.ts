// src/core/types/pet.types.ts
export interface Competition {
  name: string;
  year: number;
  award?: string;
}

export type Gender = 'Macho' | 'Hembra';

export interface HealthRecord {
  test_name: string;
  result: string;
  date: string;
}

export interface BreedingPreferences {
  looking_for_pair: boolean;
  terms?: string; // e.g., "Stud fee", "Pick of litter"
  last_heat_cycle?: string; // For females
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  gender: Gender;
  age: number;
  weight?: number;
  bio: string;
  photos: string[];
  owner_ids: string[];
  personality_traits: string[];
  has_papers: boolean;
  paper_types?: string[];
  is_competitor: boolean;
  competitions?: Competition[];
  health_records?: HealthRecord[];
  breeding_preferences?: BreedingPreferences;
  
  // Lineage
  father_id?: string;
  mother_id?: string;
  paternal_grandfather_id?: string;
  paternal_grandmother_id?: string;
  maternal_grandfather_id?: string;
  maternal_grandmother_id?: string;
  
  // Advanced Breeding Stats
  coi_percentage?: number; // Coefficient of Inbreeding
  is_verified_breeder_pet?: boolean;
  
  skills?: string[];
}
