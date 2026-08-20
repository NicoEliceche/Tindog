'use client';

import { restoreAuthSession } from '@core/data/services/authService';
import type { Pet } from '@core/types/pet.types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type WebThemeMode = 'dark' | 'light' | 'system';
export type WebAppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface WebPreferences {
  themeMode: WebThemeMode;
  discoveryEnabled: boolean;
  showDistance: boolean;
  maxDistanceKm: number;
  showOnlineStatus: boolean;
  readReceipts: boolean;
  pushMessages: boolean;
  pushRequests: boolean;
  pushAppointments: boolean;
  safetyCheckIns: boolean;
  lostPetAlerts: boolean;
  healthVisibility: 'connections' | 'private';
}

export interface WebConnectionRequest {
  id: string;
  direction: 'incoming' | 'outgoing';
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  ownerName: string;
  pet: Pet;
  avatar: string;
  /** Momento en que se envió, para ordenar y agrupar por mes. */
  createdAt: string;
}
export interface WebConversation { id: string; ownerName: string; petName: string; avatar: string; intent: 'Cita' | 'Cruza' | 'Juego'; lastMessage: string; timeLabel: string; unread: boolean; }
export interface WebMessage { id: string; sender: 'me' | 'them' | 'system'; body: string; sentAt: string; }
export interface WebLocationReview { id: string; authorName: string; rating: number; comment: string; verified: boolean; }
export interface WebSafeLocation { id: string; googlePlaceId: string; name: string; address: string; lat: number; lng: number; rating: number; reviewCount: number; distanceKm: number; tags: string[]; reviews: WebLocationReview[]; }
export interface WebAppointment { id: string; conversationId: string; ownerName: string; petNames: string[]; startAt: string; endAt: string; status: WebAppointmentStatus; location: WebSafeLocation; checkedIn: boolean; reviewSubmitted: boolean; shared: boolean; }

/** Mascota guardada con el momento en que se guardó. */
export interface WebSavedPet { pet: Pet; savedAt: string; }

/**
 * Convierte lo guardado en el navegador al formato actual.
 *
 * La primera versión guardaba la mascota suelta; después se la envolvió para
 * sumarle la fecha, pero sin cambiar la clave de almacenamiento. Quien tenía
 * favoritos de antes recibía la forma vieja y la pantalla fallaba al leer
 * `item.pet`. Se descartan además las entradas que no tengan una mascota
 * utilizable, para que un dato corrupto no rompa la pantalla entera.
 */
function normalizeSaved(raw: unknown): WebSavedPet[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const entry = item as Partial<WebSavedPet> & Partial<Pet>;
    // Formato nuevo: { pet, savedAt }. Formato viejo: la mascota directa.
    const pet = (entry.pet ?? entry) as Pet | undefined;
    if (!pet?.id || !Array.isArray(pet.photos)) return [];
    return [{ pet, savedAt: entry.savedAt ?? new Date().toISOString() }];
  });
}

/** Lo que el formulario puede completar; el resto lo deriva el provider. */
export type NewPetDraft = Omit<Pet, 'id' | 'owner_ids' | 'personality_traits'> & {
  personality_traits?: string[];
};

export type WebNotificationKind = 'request' | 'message' | 'appointment' | 'cancelled';
export interface WebNotification {
  id: string;
  kind: WebNotificationKind;
  title: string;
  body: string;
  avatar?: string;
  /** Ruta a la que lleva el toque sobre la notificación. */
  href: string;
  read: boolean;
}

const pets: Pet[] = [
  { id: 'luna', name: 'Luna', breed: 'Border Collie', gender: 'Hembra', age: 2, weight: 18, bio: 'Inteligente, activa y fanática del agility. Busca paseos largos y amigos con buena energía.', photos: ['https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u2'], personality_traits: ['Activa', 'Inteligente', 'Sociable'], has_papers: true, paper_types: ['Vacunación', 'Microchip'], is_competitor: true, breeding_preferences: { looking_for_pair: true }, health_records: [{ test_name: 'Displasia', result: 'Libre', date: '2026-04-12' }], coi_percentage: 3.8, is_verified_breeder_pet: true, media: [{ id: 'luna-m1', kind: 'photo', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=900' }, { id: 'luna-m2', kind: 'photo', url: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=900' }, { id: 'luna-m3', kind: 'photo', url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=900' }], caregivers: [{ id: 'u-luna', name: 'Laura Martínez', zone: 'Palermo, Buenos Aires', role: 'owner', memberSince: '2024-03-01', bio: 'Adiestradora de agility. Salgo temprano casi todos los días.', verified: true }], nearby: true, distanceKm: 1.2 },
  { id: 'roco', name: 'Roco', breed: 'Bulldog Francés', gender: 'Macho', age: 4, weight: 12, bio: 'Tranquilo, muy compañero y experto en siestas. Ideal para planes relajados.', photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u3'], personality_traits: ['Tranquilo', 'Cariñoso'], has_papers: true, paper_types: ['Pedigree'], is_competitor: false, breeding_preferences: { looking_for_pair: false }, coi_percentage: 6.1, media: [{ id: 'roco-m1', kind: 'photo', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=900' }, { id: 'roco-m2', kind: 'photo', url: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=900' }], caregivers: [{ id: 'u-roco', name: 'Diego Sosa', zone: 'Villa Crespo, Buenos Aires', role: 'owner', memberSince: '2023-11-12', bio: 'Trabajo desde casa, así que Roco tiene compañía todo el día.', verified: false }], nearby: false, distanceKm: 4.8 },
  { id: 'nala', name: 'Nala', breed: 'Labrador Retriever', gender: 'Hembra', age: 3, weight: 25, bio: 'Dulce, obediente y muy buena con chicos. Le encantan el agua y los juegos de buscar.', photos: ['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u4'], personality_traits: ['Familiar', 'Obediente'], has_papers: false, is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 2.4, media: [{ id: 'nala-m1', kind: 'photo', url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=900' }, { id: 'nala-m2', kind: 'photo', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=900' }, { id: 'nala-m3', kind: 'photo', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=900' }], caregivers: [{ id: 'u-nala', name: 'Sofía Pereyra', zone: 'Caballito, Buenos Aires', role: 'owner', memberSince: '2025-01-20', bio: 'Nos gustan las plazas grandes y los amigos tranquilos.', verified: true }], nearby: true, distanceKm: 2.1 },
  { id: 'thor', name: 'Thor', breed: 'Husky Siberiano', gender: 'Macho', age: 3, weight: 27, bio: 'Incansable y muy vocal. Necesita correr todos los días y un amigo que le siga el ritmo.', photos: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u5'], personality_traits: ['Enérgico', 'Vocal', 'Independiente'], has_papers: true, paper_types: ['Pedigree', 'Vacunación'], is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 5.2 },
  { id: 'kira', name: 'Kira', breed: 'Pastor Alemán', gender: 'Hembra', age: 4, weight: 30, bio: 'Protectora y muy entrenada. Hizo obediencia avanzada y adora tener una tarea que cumplir.', photos: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u6'], personality_traits: ['Protectora', 'Entrenada', 'Leal'], has_papers: true, paper_types: ['Pedigree', 'Microchip'], is_competitor: true, health_records: [{ test_name: 'Displasia', result: 'A', date: '2026-02-20' }], breeding_preferences: { looking_for_pair: true }, coi_percentage: 3.1, is_verified_breeder_pet: true },
  { id: 'simba', name: 'Simba', breed: 'Golden Retriever', gender: 'Macho', age: 2, weight: 29, bio: 'Puro entusiasmo. Saluda a todo el mundo con la cola y nunca suelta su pelota favorita.', photos: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u7'], personality_traits: ['Entusiasta', 'Sociable'], has_papers: true, paper_types: ['Vacunación'], is_competitor: false, breeding_preferences: { looking_for_pair: false }, coi_percentage: 4.7 },
  { id: 'mia', name: 'Mía', breed: 'Beagle', gender: 'Hembra', age: 5, weight: 11, bio: 'Curiosa y guiada por la nariz. Si hay un rastro que seguir, lo va a encontrar.', photos: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u8'], personality_traits: ['Curiosa', 'Rastreadora'], has_papers: false, is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 7.3 },
  { id: 'rocco', name: 'Rocco', breed: 'Boxer', gender: 'Macho', age: 3, weight: 31, bio: 'Payaso de corazón. Juega como cachorro aunque ya sea grandote, y duerme abrazado.', photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u9'], personality_traits: ['Juguetón', 'Cariñoso', 'Payaso'], has_papers: true, paper_types: ['Vacunación', 'Microchip'], is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 5.8 },
  { id: 'lola', name: 'Lola', breed: 'Salchicha', gender: 'Hembra', age: 6, weight: 7, bio: 'Chiquita con carácter enorme. Le encanta enroscarse bajo una manta después de pasear.', photos: ['https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u10'], personality_traits: ['Decidida', 'Mimosa'], has_papers: false, is_competitor: false, breeding_preferences: { looking_for_pair: false }, coi_percentage: 8.4, media: [{ id: 'lola-m1', kind: 'photo', url: 'https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&q=80&w=900' }, { id: 'lola-m2', kind: 'photo', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=900' }], caregivers: [{ id: 'u-lola', name: 'Martín Aguirre', zone: 'Núñez, Buenos Aires', role: 'owner', memberSince: '2024-08-05', bio: 'Lola es chiquita pero manda. Buscamos amigos pacientes.', verified: false }], nearby: false, distanceKm: 6.4 },
  { id: 'zeus', name: 'Zeus', breed: 'Gran Danés', gender: 'Macho', age: 4, weight: 58, bio: 'Gigante gentil. Cree que es perro faldero y no entiende por qué no entra en el sillón.', photos: ['https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u11'], personality_traits: ['Gentil', 'Tranquilo'], has_papers: true, paper_types: ['Pedigree'], is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 4.1, media: [{ id: 'zeus-m1', kind: 'photo', url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=900' }, { id: 'zeus-m2', kind: 'photo', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=900' }], caregivers: [{ id: 'u-zeus', name: 'Carla Benítez', zone: 'Belgrano, Buenos Aires', role: 'owner', memberSince: '2023-06-18', bio: 'Zeus necesita espacio para correr; vamos seguido a los bosques.', verified: true }], nearby: false, distanceKm: 3.3 },
  { id: 'nina', name: 'Nina', breed: 'Border Collie', gender: 'Hembra', age: 2, weight: 17, bio: 'Aprende trucos en minutos y necesita estímulo mental. Campeona de frisbee amateur.', photos: ['https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u12'], personality_traits: ['Brillante', 'Atlética', 'Activa'], has_papers: true, paper_types: ['Pedigree', 'Vacunación'], is_competitor: true, health_records: [{ test_name: 'Ojos', result: 'Normal', date: '2026-05-02' }], breeding_preferences: { looking_for_pair: true }, coi_percentage: 2.9, is_verified_breeder_pet: true, media: [{ id: 'nina-m1', kind: 'photo', url: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=900' }, { id: 'nina-m2', kind: 'photo', url: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=900' }], caregivers: [{ id: 'u-nina', name: 'Julián Ferrer', zone: 'Almagro, Buenos Aires', role: 'owner', memberSince: '2025-04-02', bio: 'Competimos en frisbee amateur los fines de semana.', verified: true }], nearby: true, distanceKm: 0.9 },
];

export const webMyPets: Pet[] = [
  { id: 'firulais', name: 'Firulais', breed: 'Golden Retriever', gender: 'Macho', age: 3, weight: 31, bio: 'Leal, juguetón y muy sociable.', photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=900'], owner_ids: ['me'], personality_traits: ['Juguetón', 'Cariñoso', 'Calmo'], has_papers: true, paper_types: ['Pedigree', 'Microchip', 'Vacunación'], is_competitor: true, health_records: [{ test_name: 'Caderas', result: 'A', date: '2026-01-19' }, { test_name: 'Ojos', result: 'Normal', date: '2026-03-08' }], breeding_preferences: { looking_for_pair: true }, coi_percentage: 4.2, is_verified_breeder_pet: true },
  { id: 'mora', name: 'Mora', breed: 'Caniche Toy', gender: 'Hembra', age: 5, weight: 5, bio: 'Pequeña, curiosa y compañera.', photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=900'], owner_ids: ['me'], personality_traits: ['Curiosa', 'Tranquila'], has_papers: true, paper_types: ['Vacunación'], is_competitor: false, health_records: [{ test_name: 'Cardiológico', result: 'Normal', date: '2026-05-18' }], breeding_preferences: { looking_for_pair: false }, coi_percentage: 1.9 },
];

export const webAllPets: Pet[] = [...pets, ...webMyPets];

const safeLocations: WebSafeLocation[] = [
  { id: 'safe-1', googlePlaceId: 'ChIJdemo-parque-las-heras', name: 'Parque Las Heras · acceso principal', address: 'Av. Las Heras 3100, Palermo', lat: -34.5839, lng: -58.4094, rating: 4.8, reviewCount: 46, distanceKm: 1.2, tags: ['Iluminado', 'Concurrido', 'Pet friendly'], reviews: [{ id: 'r1', authorName: 'Marina', rating: 5, comment: 'Buen movimiento y espacio para una primera presentación.', verified: true }] },
  { id: 'safe-2', googlePlaceId: 'ChIJdemo-plaza-guemes', name: 'Plaza Güemes', address: 'Charcas 3700, Palermo', lat: -34.5884, lng: -58.4182, rating: 4.6, reviewCount: 31, distanceKm: 2.1, tags: ['Comercio cercano', 'Iluminado', 'Accesible'], reviews: [] },
  { id: 'safe-3', googlePlaceId: 'ChIJdemo-barrancas-belgrano', name: 'Barrancas de Belgrano', address: 'Echeverría 1800, Belgrano', lat: -34.5592, lng: -58.4494, rating: 4.7, reviewCount: 58, distanceKm: 4.8, tags: ['Muy concurrido', 'Transporte', 'Pet friendly'], reviews: [] },
];

const defaultPreferences: WebPreferences = { themeMode: 'dark', discoveryEnabled: true, showDistance: true, maxDistanceKm: 25, showOnlineStatus: false, readReceipts: true, pushMessages: true, pushRequests: true, pushAppointments: true, safetyCheckIns: true, lostPetAlerts: true, healthVisibility: 'connections' };
const initialChats: WebConversation[] = [
  { id: 'chat-2', ownerName: 'Carlos Ruiz', petName: 'Roco', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', intent: 'Cita', lastMessage: 'El parque de siempre nos queda perfecto.', timeLabel: 'Ayer', unread: true },
  { id: 'chat-3', ownerName: 'Sofía Pereyra', petName: 'Nala', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300', intent: 'Juego', lastMessage: 'Nala tiene energía para jugar con Firulais.', timeLabel: 'Lun', unread: false },
];
const initialMessages: Record<string, WebMessage[]> = {
  'chat-2': [{ id: 'm1', sender: 'them', body: '¡Hola! Roco se llevó muy bien con el perfil de Firulais.', sentAt: '2026-07-30T15:10:00Z' }, { id: 'm2', sender: 'me', body: 'Podemos organizar una presentación tranquila en un lugar público.', sentAt: '2026-07-30T15:14:00Z' }, { id: 'm3', sender: 'them', body: 'El parque de siempre nos queda perfecto.', sentAt: '2026-07-30T15:18:00Z' }],
  'chat-3': [{ id: 'm4', sender: 'them', body: 'Nala tiene energía para jugar con Firulais.', sentAt: '2026-07-28T18:20:00Z' }],
};

interface WebAppValue {
  preferences: WebPreferences; resolvedTheme: 'dark' | 'light'; updatePreference: <K extends keyof WebPreferences>(key: K, value: WebPreferences[K]) => void;
  /** `zone` es el área aproximada que se muestra a otros: nunca el domicilio. */
  profile: { name: string; email: string; avatar?: string; zone: string };
  updateProfile: (value: Partial<{ name: string; avatar: string; zone: string }>) => void;
  discoveryPets: Pet[]; dismissPet: (id: string) => void; resetDiscovery: () => void;
  /** Devuelve una mascota descartada al frente de la pila (undo del swipe). */
  restorePet: (pet: Pet) => void;
  requests: WebConnectionRequest[]; sendRequest: (pet: Pet) => void; respondRequest: (id: string, accepted: boolean) => void;
  /** Cancela una solicitud enviada: la retira del otro lado y avisa. */
  cancelRequest: (id: string) => void;
  conversations: WebConversation[]; messages: Record<string, WebMessage[]>; sendMessage: (chatId: string, body: string) => void;
  locations: WebSafeLocation[]; appointments: WebAppointment[]; scheduleAppointment: (chatId: string, locationId: string, startAt: string) => WebAppointment | null; setAppointmentStatus: (id: string, status: WebAppointmentStatus) => void; addReview: (locationId: string, rating: number, comment: string) => void;
  /** Derivadas del estado real: solicitudes, chats sin leer y citas próximas. */
  notifications: WebNotification[]; unreadNotifications: number; markNotificationsRead: (notificationId?: string) => void;
  markNotificationUnread: (notificationId: string) => void;
  /** Perfiles guardados desde Discovery para revisarlos después. */
  savedPets: WebSavedPet[]; savePet: (pet: Pet) => void; unsavePet: (id: string) => void; isSaved: (id: string) => boolean;
  myPets: Pet[];
  createPet: (draft: NewPetDraft) => Pet;
  updatePet: (petId: string, draft: NewPetDraft) => void;
  /** Usuarios bloqueados: dejan de aparecer en Discovery. */
  blockedOwners: string[]; blockOwner: (name: string) => void; unblockOwner: (name: string) => void;
}

const WebAppContext = createContext<WebAppValue | null>(null);

// El oscuro pasó a ser el modo base del producto. La clave sube de versión
// para que las preferencias guardadas antes de ese cambio (muchas con
// `themeMode: 'light'`, que era el default viejo) no sigan forzando el claro
// a quien nunca lo eligió a propósito. Quien quiera el claro lo vuelve a
// elegir desde Settings y esa preferencia sí persiste.
const PREFERENCES_STORAGE_KEY = 'tindog.web.preferences.v2';

export function WebAppProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<WebPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!stored) return defaultPreferences;
    try { return { ...defaultPreferences, ...JSON.parse(stored) }; } catch { return defaultPreferences; }
  });
  const [systemDark, setSystemDark] = useState(() => typeof window === 'undefined' || window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [profile, setProfile] = useState<{ name: string; email: string; avatar?: string; zone: string }>({ name: 'Nico Eliceche', email: 'nico@tindog.app', zone: 'Palermo, Buenos Aires' });
  const [discoveryPets, setDiscoveryPets] = useState(pets); const [requests, setRequests] = useState<WebConnectionRequest[]>([
    { id: 'req-1', direction: 'incoming', status: 'pending', ownerName: 'Laura Martínez', pet: pets[0], avatar: pets[0].photos[0], createdAt: '2026-08-11T14:20:00Z' },
    { id: 'req-2', direction: 'incoming', status: 'pending', ownerName: 'Diego Sosa', pet: pets[3], avatar: pets[3].photos[0], createdAt: '2026-07-04T10:05:00Z' },
    { id: 'req-3', direction: 'outgoing', status: 'pending', ownerName: 'Tutor de Nala', pet: pets[2], avatar: pets[2].photos[0], createdAt: '2026-08-09T18:40:00Z' },
    { id: 'req-4', direction: 'outgoing', status: 'accepted', ownerName: 'Tutor de Kira', pet: pets[4], avatar: pets[4].photos[0], createdAt: '2026-06-22T09:15:00Z' },
  ]);
  const [conversations, setConversations] = useState(initialChats); const [messages, setMessages] = useState(initialMessages); const [locations, setLocations] = useState(safeLocations);
  const [appointments, setAppointments] = useState<WebAppointment[]>([
    { id: 'a1', conversationId: 'chat-2', ownerName: 'Carlos Ruiz', petNames: ['Firulais', 'Roco'], startAt: '2026-08-02T18:00:00-03:00', endAt: '2026-08-02T19:00:00-03:00', status: 'scheduled', location: safeLocations[0], checkedIn: false, reviewSubmitted: false, shared: true },
    { id: 'a2', conversationId: 'chat-3', ownerName: 'Sofía Pereyra', petNames: ['Firulais', 'Nala'], startAt: '2026-07-18T15:00:00-03:00', endAt: '2026-07-18T16:00:00-03:00', status: 'completed', location: safeLocations[1], checkedIn: true, reviewSubmitted: false, shared: false },
    { id: 'a3', conversationId: 'chat-3', ownerName: 'Sofía Pereyra', petNames: ['Mora', 'Nala'], startAt: '2026-07-10T11:00:00-03:00', endAt: '2026-07-10T12:00:00-03:00', status: 'cancelled', location: safeLocations[2], checkedIn: false, reviewSubmitted: false, shared: false },
  ]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)'); const sync = () => setSystemDark(media.matches); media.addEventListener('change', sync);
    restoreAuthSession().then((auth) => { const user = auth?.user; if (user) setProfile((current) => ({ ...current, name: user.name, email: user.email, avatar: user.avatar })); }).catch(() => undefined);
    return () => media.removeEventListener('change', sync);
  }, []);
  const updatePreference = <K extends keyof WebPreferences>(key: K, value: WebPreferences[K]) => setPreferences((current) => { const next = { ...current, [key]: value }; window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(next)); return next; });
  const respondRequest = (id: string, accepted: boolean) => { const request = requests.find((item) => item.id === id); setRequests((current) => current.map((item) => item.id === id ? { ...item, status: accepted ? 'accepted' : 'declined' } : item)); if (request && accepted) { const chat: WebConversation = { id: `chat-${Date.now()}`, ownerName: request.ownerName, petName: request.pet.name, avatar: request.avatar, intent: 'Cruza', lastMessage: 'Solicitud aceptada. Ya pueden conversar.', timeLabel: 'Ahora', unread: false }; setConversations((current) => [chat, ...current]); setMessages((current) => ({ ...current, [chat.id]: [{ id: `system-${Date.now()}`, sender: 'system', body: 'Solicitud aceptada. Coordiná el primer encuentro en un lugar público.', sentAt: new Date().toISOString() }] })); } };
  /**
   * Cancela una solicitud enviada.
   *
   * En producción esto viaja al otro usuario: su solicitud recibida pasa a
   * rechazada sola y le llega el aviso. Acá hay un único usuario, así que se
   * marca como cancelada —desaparece de las pendientes de ambos lados— y se
   * deja registro para mostrar el aviso correspondiente.
   */
  const [cancelledNotices, setCancelledNotices] = useState<Array<{ id: string; petName: string; at: string }>>([]);
  const cancelRequest = useCallback((id: string) => {
    setRequests((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        setCancelledNotices((notices) => (
          notices.some((notice) => notice.id === id)
            ? notices
            : [{ id, petName: target.pet.name, at: new Date().toISOString() }, ...notices]
        ));
      }
      return current.map((item) => (item.id === id ? { ...item, status: 'cancelled' as const } : item));
    });
  }, []);

  const scheduleAppointment = (chatId: string, locationId: string, startAt: string) => { const chat = conversations.find((item) => item.id === chatId); const location = locations.find((item) => item.id === locationId); if (!chat || !location) return null; const start = new Date(startAt); const next: WebAppointment = { id: `a-${Date.now()}`, conversationId: chatId, ownerName: chat.ownerName, petNames: ['Firulais', chat.petName], startAt: start.toISOString(), endAt: new Date(start.getTime() + 3600000).toISOString(), status: 'scheduled', location, checkedIn: false, reviewSubmitted: false, shared: false }; setAppointments((current) => [next, ...current]); return next; };
  // Las notificaciones no son un estado aparte: se derivan de lo que ya pasó
  // en la app, así no pueden quedar desincronizadas con la realidad. Sólo se
  // guarda cuáles fueron leídas.
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
  const notifications = useMemo<WebNotification[]>(() => {
    const items: WebNotification[] = [];

    for (const request of requests) {
      if (request.direction !== 'incoming' || request.status !== 'pending') continue;
      items.push({
        id: `notif-req-${request.id}`,
        kind: 'request',
        title: 'Nueva solicitud de conexión',
        body: `${request.ownerName} quiere conectar a ${request.pet.name} con Firulais.`,
        avatar: request.avatar,
        href: '/requests',
        read: false,
      });
    }

    for (const chat of conversations) {
      if (!chat.unread) continue;
      items.push({
        id: `notif-msg-${chat.id}`,
        kind: 'message',
        title: `Mensaje de ${chat.ownerName}`,
        body: chat.lastMessage,
        avatar: chat.avatar,
        href: `/chat/${chat.id}`,
        read: false,
      });
    }

    for (const notice of cancelledNotices) {
      items.push({
        id: `notif-cancel-${notice.id}`,
        kind: 'cancelled',
        title: 'Solicitud cancelada',
        body: `Se canceló la solicitud de conexión con ${notice.petName}.`,
        href: '/requests',
        read: false,
      });
    }

    const now = Date.now();
    for (const appointment of appointments) {
      if (appointment.status !== 'scheduled') continue;
      const start = new Date(appointment.startAt);
      const hours = (start.getTime() - now) / 3_600_000;
      // Sólo avisamos de lo que está por venir, no de lo que ya pasó.
      if (hours < 0 || hours > 72) continue;
      items.push({
        id: `notif-appt-${appointment.id}`,
        kind: 'appointment',
        title: 'Cita próxima',
        body: `Paseo con ${appointment.ownerName} en ${appointment.location.name}.`,
        href: '/appointments',
        read: false,
      });
    }

    return items.map((item) => ({ ...item, read: readNotifications.includes(item.id) }));
  }, [requests, conversations, appointments, cancelledNotices, readNotifications]);

  /** Devuelve un aviso a no leido, para poder retomarlo mas tarde. */
  const markNotificationUnread = useCallback((notificationId: string) => {
    setReadNotifications((current) => current.filter((id) => id !== notificationId));
  }, []);

  const unreadNotifications = notifications.filter((item) => !item.read).length;
  /**
   * Marca avisos como leidos. Sin argumento los marca todos, que es lo que
   * hace el boton "Marcar leidas"; con un id marca solo ese, para cuando se
   * abre un aviso puntual.
   */
  const markNotificationsRead = useCallback((notificationId?: string) => {
    setReadNotifications((current) => {
      const ids = notificationId ? [notificationId] : notifications.map((item) => item.id);
      return Array.from(new Set([...current, ...ids]));
    });
  }, [notifications]);

  // Favoritos y bloqueos. Persisten en el navegador para que sobrevivan a
  // una recarga, como haría el backend real.
  const [savedPets, setSavedPets] = useState<WebSavedPet[]>([]);
  // Las mascotas viven en el provider y no como constante del modulo para que
  // el alta y la edicion se vean en la lista y en el panel sin recargar.
  const [myPets, setMyPets] = useState<Pet[]>(webMyPets);
  const [blockedOwners, setBlockedOwners] = useState<string[]>([]);

  useEffect(() => {
    try {
      const rawSaved = window.localStorage.getItem('tindog.web.saved.v1');
      if (rawSaved) setSavedPets(normalizeSaved(JSON.parse(rawSaved)));
      const rawBlocked = window.localStorage.getItem('tindog.web.blocked.v1');
      if (rawBlocked) setBlockedOwners(JSON.parse(rawBlocked) as string[]);
    } catch { /* almacenamiento no disponible o corrupto: se arranca vacío */ }
  }, []);

  const persistSaved = (next: WebSavedPet[]) => {
    setSavedPets(next);
    try { window.localStorage.setItem('tindog.web.saved.v1', JSON.stringify(next)); } catch { /* ignorado */ }
  };
  const persistBlocked = (next: string[]) => {
    setBlockedOwners(next);
    try { window.localStorage.setItem('tindog.web.blocked.v1', JSON.stringify(next)); } catch { /* ignorado */ }
  };

  const value: WebAppValue = {
    savedPets,
    savePet: (pet) => { if (!savedPets.some((item) => item.pet.id === pet.id)) persistSaved([{ pet, savedAt: new Date().toISOString() }, ...savedPets]); },
    unsavePet: (id) => persistSaved(savedPets.filter((item) => item.pet.id !== id)),
    myPets,
    createPet: (draft) => {
      const pet: Pet = { ...draft, id: `pet-${Date.now()}`, owner_ids: ['me'], personality_traits: draft.personality_traits ?? [] };
      setMyPets((current) => [pet, ...current]);
      return pet;
    },
    updatePet: (petId, draft) => setMyPets((current) => current.map((pet) => pet.id === petId
      ? { ...pet, ...draft, id: pet.id, owner_ids: pet.owner_ids, personality_traits: draft.personality_traits ?? pet.personality_traits }
      : pet)),
    isSaved: (id) => savedPets.some((item) => item.pet.id === id),
    blockedOwners,
    blockOwner: (name) => { if (!blockedOwners.includes(name)) persistBlocked([name, ...blockedOwners]); },
    unblockOwner: (name) => persistBlocked(blockedOwners.filter((item) => item !== name)),
    preferences, resolvedTheme: preferences.themeMode === 'system' ? (systemDark ? 'dark' : 'light') : preferences.themeMode, updatePreference,
    notifications, unreadNotifications, markNotificationsRead, markNotificationUnread,
    profile, updateProfile: (value) => setProfile((current) => ({ ...current, ...value })), discoveryPets, dismissPet: (id) => setDiscoveryPets((current) => current.filter((item) => item.id !== id)), resetDiscovery: () => setDiscoveryPets(pets), restorePet: (pet) => setDiscoveryPets((current) => (current.some((item) => item.id === pet.id) ? current : [pet, ...current])), requests,
    sendRequest: (pet) => { if (!requests.some((item) => item.pet.id === pet.id && item.direction === 'outgoing' && item.status === 'pending')) setRequests((current) => [{ id: `req-${Date.now()}`, direction: 'outgoing', status: 'pending', ownerName: `Tutor de ${pet.name}`, pet, avatar: pet.photos[0], createdAt: new Date().toISOString() }, ...current]); }, respondRequest, cancelRequest,
    conversations, messages, sendMessage: (chatId, body) => { const clean = body.trim(); if (!clean) return; setMessages((current) => ({ ...current, [chatId]: [...(current[chatId] ?? []), { id: `m-${Date.now()}`, sender: 'me', body: clean, sentAt: new Date().toISOString() }] })); setConversations((current) => current.map((item) => item.id === chatId ? { ...item, lastMessage: clean, timeLabel: 'Ahora' } : item)); },
    locations, appointments, scheduleAppointment, setAppointmentStatus: (id, status) => setAppointments((current) => current.map((item) => item.id === id ? { ...item, status, checkedIn: status === 'completed' ? true : item.checkedIn } : item)),
    addReview: (locationId, rating, comment) => { setLocations((current) => current.map((item) => item.id === locationId ? { ...item, reviewCount: item.reviewCount + 1, rating: Number(((item.rating * item.reviewCount + rating) / (item.reviewCount + 1)).toFixed(1)), reviews: [{ id: `r-${Date.now()}`, authorName: profile.name.split(' ')[0], rating, comment, verified: true }, ...item.reviews] } : item)); setAppointments((current) => current.map((item) => item.location.id === locationId && item.status === 'completed' ? { ...item, reviewSubmitted: true } : item)); },
  };
  return <WebAppContext.Provider value={value}>{children}</WebAppContext.Provider>;
}

export function useWebApp() { const value = useContext(WebAppContext); if (!value) throw new Error('useWebApp must be used inside WebAppProvider'); return value; }
export function effectiveStatus(appointment: WebAppointment): WebAppointmentStatus { if (appointment.status !== 'scheduled') return appointment.status; const now = Date.now(); return now >= new Date(appointment.startAt).getTime() && now <= new Date(appointment.endAt).getTime() ? 'in_progress' : 'scheduled'; }
