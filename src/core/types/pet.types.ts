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

/**
 * Persona a cargo de una mascota. Varias pueden estarlo a la vez -pareja,
 * familia, un cuidador contratado- asi que esto va en una lista, no en un
 * campo suelto. `role` distingue quien puede editar de quien solo coordina.
 */
export interface PetCaregiver {
  id: string;
  name: string;
  avatar?: string;
  /** Area aproximada, nunca el domicilio exacto. */
  zone: string;
  role: 'owner' | 'co_owner' | 'caregiver';
  memberSince?: string;
  bio?: string;
  verified?: boolean;
}

/** Una foto o un video de la galeria. */
export interface PetMedia {
  id: string;
  kind: 'photo' | 'video';
  url: string;
  /** Imagen de portada del video, para no descargarlo hasta que se lo mire. */
  poster?: string;
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
  /** Galeria completa: hasta diez fotos y un video. */
  media?: PetMedia[];
  /** Personas a cargo. La primera con rol owner es el titular. */
  caregivers?: PetCaregiver[];
  /** Si esta cerca de quien mira, para mostrarlo en el detalle. */
  nearby?: boolean;
  distanceKm?: number;
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
