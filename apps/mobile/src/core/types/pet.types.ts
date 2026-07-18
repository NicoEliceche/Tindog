export type Gender = 'Macho' | 'Hembra';

export interface Competition {
  name: string;
  year: number;
  award?: string;
}

export interface HealthRecord {
  test_name: string;
  result: string;
  date: string;
}

export interface BreedingPreferences {
  looking_for_pair: boolean;
  terms?: string;
  last_heat_cycle?: string;
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
  coi_percentage?: number;
  is_verified_breeder_pet?: boolean;
}
