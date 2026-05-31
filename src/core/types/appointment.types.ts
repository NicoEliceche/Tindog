// src/core/types/appointment.types.ts
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface LocationInfo {
  name: string;
  address: string;
  place_id: string;
  type: 'park' | 'cafe' | 'pet_store';
  coordinates: { lat: number; lng: number };
}

export interface Appointment {
  id: string;
  pet_ids: string[];
  owner_ids: string[];
  location: LocationInfo; // Verified location object
  datetime: string;
  status: AppointmentStatus;
  notes?: string;
}
