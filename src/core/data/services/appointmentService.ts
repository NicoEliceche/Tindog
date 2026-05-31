// src/core/data/services/appointmentService.ts
import { client } from '../client/AxiosClient';
import { Appointment, LocationInfo } from '@core/types/appointment.types';

// MOCK VERIFIED LOCATIONS
const SAFE_PAW_POINTS: LocationInfo[] = [
  {
    name: 'Parque Centenario',
    address: 'Av. Diaz Velez, CABA',
    place_id: 'place_1',
    type: 'park',
    coordinates: { lat: -34.606, lng: -58.435 },
  },
  {
    name: 'Canil Plaza Sicilia',
    address: 'Av. del Libertador, Palermo',
    place_id: 'place_2',
    type: 'park',
    coordinates: { lat: -34.575, lng: -58.412 },
  },
  {
    name: 'Puppies Cafe',
    address: 'Gorriti 4500, Palermo Soho',
    place_id: 'place_3',
    type: 'cafe',
    coordinates: { lat: -34.591, lng: -58.428 },
  }
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    pet_ids: ['p1'],
    owner_ids: ['u-current'],
    location: SAFE_PAW_POINTS[0],
    datetime: '2026-06-15T10:00:00Z',
    status: 'scheduled',
    notes: 'Paseo matutino.',
  }
];

export async function fetchAppointments(petId?: string): Promise<Appointment[]> {
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_APPOINTMENTS), 500));
}

export async function fetchSafePawPoints(query?: string): Promise<LocationInfo[]> {
  // Simulacion de busqueda en API de Google Maps filtrada por Safe Zones
  return new Promise((resolve) => {
    if (!query) return resolve(SAFE_PAW_POINTS);
    const filtered = SAFE_PAW_POINTS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    setTimeout(() => resolve(filtered), 400);
  });
}

export async function createAppointment(data: Partial<Appointment>): Promise<Appointment> {
  const newAppointment: Appointment = {
    id: Math.random().toString(36).substr(2, 9),
    pet_ids: data.pet_ids || [],
    owner_ids: data.owner_ids || ['u-current'],
    location: data.location as LocationInfo,
    datetime: data.datetime || new Date().toISOString(),
    status: 'scheduled',
    notes: data.notes,
  };
  return new Promise((resolve) => setTimeout(() => resolve(newAppointment), 800));
}
