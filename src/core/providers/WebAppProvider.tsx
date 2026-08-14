'use client';

import { restoreAuthSession } from '@core/data/services/authService';
import type { Pet } from '@core/types/pet.types';
import React, { createContext, useContext, useEffect, useState } from 'react';

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

export interface WebConnectionRequest { id: string; direction: 'incoming' | 'outgoing'; status: 'pending' | 'accepted' | 'declined'; ownerName: string; pet: Pet; avatar: string; }
export interface WebConversation { id: string; ownerName: string; petName: string; avatar: string; intent: 'Cita' | 'Cruza' | 'Juego'; lastMessage: string; timeLabel: string; unread: boolean; }
export interface WebMessage { id: string; sender: 'me' | 'them' | 'system'; body: string; sentAt: string; }
export interface WebLocationReview { id: string; authorName: string; rating: number; comment: string; verified: boolean; }
export interface WebSafeLocation { id: string; googlePlaceId: string; name: string; address: string; lat: number; lng: number; rating: number; reviewCount: number; distanceKm: number; tags: string[]; reviews: WebLocationReview[]; }
export interface WebAppointment { id: string; conversationId: string; ownerName: string; petNames: string[]; startAt: string; endAt: string; status: WebAppointmentStatus; location: WebSafeLocation; checkedIn: boolean; reviewSubmitted: boolean; shared: boolean; }

const pets: Pet[] = [
  { id: 'luna', name: 'Luna', breed: 'Border Collie', gender: 'Hembra', age: 2, weight: 18, bio: 'Inteligente, activa y fanática del agility. Busca paseos largos y amigos con buena energía.', photos: ['https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u2'], personality_traits: ['Activa', 'Inteligente', 'Sociable'], has_papers: true, paper_types: ['Vacunación', 'Microchip'], is_competitor: true, breeding_preferences: { looking_for_pair: true }, health_records: [{ test_name: 'Displasia', result: 'Libre', date: '2026-04-12' }], coi_percentage: 3.8, is_verified_breeder_pet: true },
  { id: 'roco', name: 'Roco', breed: 'Bulldog Francés', gender: 'Macho', age: 4, weight: 12, bio: 'Tranquilo, muy compañero y experto en siestas. Ideal para planes relajados.', photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u3'], personality_traits: ['Tranquilo', 'Cariñoso'], has_papers: true, paper_types: ['Pedigree'], is_competitor: false, breeding_preferences: { looking_for_pair: false }, coi_percentage: 6.1 },
  { id: 'nala', name: 'Nala', breed: 'Labrador Retriever', gender: 'Hembra', age: 3, weight: 25, bio: 'Dulce, obediente y muy buena con chicos. Le encantan el agua y los juegos de buscar.', photos: ['https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u4'], personality_traits: ['Familiar', 'Obediente'], has_papers: false, is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 2.4 },
  { id: 'thor', name: 'Thor', breed: 'Husky Siberiano', gender: 'Macho', age: 3, weight: 27, bio: 'Incansable y muy vocal. Necesita correr todos los días y un amigo que le siga el ritmo.', photos: ['https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u5'], personality_traits: ['Enérgico', 'Vocal', 'Independiente'], has_papers: true, paper_types: ['Pedigree', 'Vacunación'], is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 5.2 },
  { id: 'kira', name: 'Kira', breed: 'Pastor Alemán', gender: 'Hembra', age: 4, weight: 30, bio: 'Protectora y muy entrenada. Hizo obediencia avanzada y adora tener una tarea que cumplir.', photos: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u6'], personality_traits: ['Protectora', 'Entrenada', 'Leal'], has_papers: true, paper_types: ['Pedigree', 'Microchip'], is_competitor: true, health_records: [{ test_name: 'Displasia', result: 'A', date: '2026-02-20' }], breeding_preferences: { looking_for_pair: true }, coi_percentage: 3.1, is_verified_breeder_pet: true },
  { id: 'simba', name: 'Simba', breed: 'Golden Retriever', gender: 'Macho', age: 2, weight: 29, bio: 'Puro entusiasmo. Saluda a todo el mundo con la cola y nunca suelta su pelota favorita.', photos: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u7'], personality_traits: ['Entusiasta', 'Sociable'], has_papers: true, paper_types: ['Vacunación'], is_competitor: false, breeding_preferences: { looking_for_pair: false }, coi_percentage: 4.7 },
  { id: 'mia', name: 'Mía', breed: 'Beagle', gender: 'Hembra', age: 5, weight: 11, bio: 'Curiosa y guiada por la nariz. Si hay un rastro que seguir, lo va a encontrar.', photos: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u8'], personality_traits: ['Curiosa', 'Rastreadora'], has_papers: false, is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 7.3 },
  { id: 'rocco', name: 'Rocco', breed: 'Boxer', gender: 'Macho', age: 3, weight: 31, bio: 'Payaso de corazón. Juega como cachorro aunque ya sea grandote, y duerme abrazado.', photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u9'], personality_traits: ['Juguetón', 'Cariñoso', 'Payaso'], has_papers: true, paper_types: ['Vacunación', 'Microchip'], is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 5.8 },
  { id: 'lola', name: 'Lola', breed: 'Salchicha', gender: 'Hembra', age: 6, weight: 7, bio: 'Chiquita con carácter enorme. Le encanta enroscarse bajo una manta después de pasear.', photos: ['https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u10'], personality_traits: ['Decidida', 'Mimosa'], has_papers: false, is_competitor: false, breeding_preferences: { looking_for_pair: false }, coi_percentage: 8.4 },
  { id: 'zeus', name: 'Zeus', breed: 'Gran Danés', gender: 'Macho', age: 4, weight: 58, bio: 'Gigante gentil. Cree que es perro faldero y no entiende por qué no entra en el sillón.', photos: ['https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u11'], personality_traits: ['Gentil', 'Tranquilo'], has_papers: true, paper_types: ['Pedigree'], is_competitor: false, breeding_preferences: { looking_for_pair: true }, coi_percentage: 4.1 },
  { id: 'nina', name: 'Nina', breed: 'Border Collie', gender: 'Hembra', age: 2, weight: 17, bio: 'Aprende trucos en minutos y necesita estímulo mental. Campeona de frisbee amateur.', photos: ['https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&q=80&w=900'], owner_ids: ['u12'], personality_traits: ['Brillante', 'Atlética', 'Activa'], has_papers: true, paper_types: ['Pedigree', 'Vacunación'], is_competitor: true, health_records: [{ test_name: 'Ojos', result: 'Normal', date: '2026-05-02' }], breeding_preferences: { looking_for_pair: true }, coi_percentage: 2.9, is_verified_breeder_pet: true },
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
  profile: { name: string; email: string; avatar?: string }; updateProfile: (value: Partial<{ name: string; avatar: string }>) => void;
  discoveryPets: Pet[]; dismissPet: (id: string) => void; resetDiscovery: () => void;
  /** Devuelve una mascota descartada al frente de la pila (undo del swipe). */
  restorePet: (pet: Pet) => void;
  requests: WebConnectionRequest[]; sendRequest: (pet: Pet) => void; respondRequest: (id: string, accepted: boolean) => void;
  conversations: WebConversation[]; messages: Record<string, WebMessage[]>; sendMessage: (chatId: string, body: string) => void;
  locations: WebSafeLocation[]; appointments: WebAppointment[]; scheduleAppointment: (chatId: string, locationId: string, startAt: string) => WebAppointment | null; setAppointmentStatus: (id: string, status: WebAppointmentStatus) => void; addReview: (locationId: string, rating: number, comment: string) => void;
}

const WebAppContext = createContext<WebAppValue | null>(null);

export function WebAppProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<WebPreferences>(() => {
    if (typeof window === 'undefined') return defaultPreferences;
    const stored = window.localStorage.getItem('tindog.web.preferences.v1');
    if (!stored) return defaultPreferences;
    try { return { ...defaultPreferences, ...JSON.parse(stored) }; } catch { return defaultPreferences; }
  });
  const [systemDark, setSystemDark] = useState(() => typeof window === 'undefined' || window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [profile, setProfile] = useState<{ name: string; email: string; avatar?: string }>({ name: 'Nico Eliceche', email: 'nico@tindog.app' });
  const [discoveryPets, setDiscoveryPets] = useState(pets); const [requests, setRequests] = useState<WebConnectionRequest[]>([{ id: 'req-1', direction: 'incoming', status: 'pending', ownerName: 'Laura Martínez', pet: pets[0], avatar: pets[0].photos[0] }]);
  const [conversations, setConversations] = useState(initialChats); const [messages, setMessages] = useState(initialMessages); const [locations, setLocations] = useState(safeLocations);
  const [appointments, setAppointments] = useState<WebAppointment[]>([
    { id: 'a1', conversationId: 'chat-2', ownerName: 'Carlos Ruiz', petNames: ['Firulais', 'Roco'], startAt: '2026-08-02T18:00:00-03:00', endAt: '2026-08-02T19:00:00-03:00', status: 'scheduled', location: safeLocations[0], checkedIn: false, reviewSubmitted: false, shared: true },
    { id: 'a2', conversationId: 'chat-3', ownerName: 'Sofía Pereyra', petNames: ['Firulais', 'Nala'], startAt: '2026-07-18T15:00:00-03:00', endAt: '2026-07-18T16:00:00-03:00', status: 'completed', location: safeLocations[1], checkedIn: true, reviewSubmitted: false, shared: false },
    { id: 'a3', conversationId: 'chat-3', ownerName: 'Sofía Pereyra', petNames: ['Mora', 'Nala'], startAt: '2026-07-10T11:00:00-03:00', endAt: '2026-07-10T12:00:00-03:00', status: 'cancelled', location: safeLocations[2], checkedIn: false, reviewSubmitted: false, shared: false },
  ]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)'); const sync = () => setSystemDark(media.matches); media.addEventListener('change', sync);
    restoreAuthSession().then((auth) => { if (auth?.user) setProfile({ name: auth.user.name, email: auth.user.email, avatar: auth.user.avatar }); }).catch(() => undefined);
    return () => media.removeEventListener('change', sync);
  }, []);
  const updatePreference = <K extends keyof WebPreferences>(key: K, value: WebPreferences[K]) => setPreferences((current) => { const next = { ...current, [key]: value }; window.localStorage.setItem('tindog.web.preferences.v1', JSON.stringify(next)); return next; });
  const respondRequest = (id: string, accepted: boolean) => { const request = requests.find((item) => item.id === id); setRequests((current) => current.map((item) => item.id === id ? { ...item, status: accepted ? 'accepted' : 'declined' } : item)); if (request && accepted) { const chat: WebConversation = { id: `chat-${Date.now()}`, ownerName: request.ownerName, petName: request.pet.name, avatar: request.avatar, intent: 'Cruza', lastMessage: 'Solicitud aceptada. Ya pueden conversar.', timeLabel: 'Ahora', unread: false }; setConversations((current) => [chat, ...current]); setMessages((current) => ({ ...current, [chat.id]: [{ id: `system-${Date.now()}`, sender: 'system', body: 'Solicitud aceptada. Coordiná el primer encuentro en un lugar público.', sentAt: new Date().toISOString() }] })); } };
  const scheduleAppointment = (chatId: string, locationId: string, startAt: string) => { const chat = conversations.find((item) => item.id === chatId); const location = locations.find((item) => item.id === locationId); if (!chat || !location) return null; const start = new Date(startAt); const next: WebAppointment = { id: `a-${Date.now()}`, conversationId: chatId, ownerName: chat.ownerName, petNames: ['Firulais', chat.petName], startAt: start.toISOString(), endAt: new Date(start.getTime() + 3600000).toISOString(), status: 'scheduled', location, checkedIn: false, reviewSubmitted: false, shared: false }; setAppointments((current) => [next, ...current]); return next; };
  const value: WebAppValue = {
    preferences, resolvedTheme: preferences.themeMode === 'system' ? (systemDark ? 'dark' : 'light') : preferences.themeMode, updatePreference,
    profile, updateProfile: (value) => setProfile((current) => ({ ...current, ...value })), discoveryPets, dismissPet: (id) => setDiscoveryPets((current) => current.filter((item) => item.id !== id)), resetDiscovery: () => setDiscoveryPets(pets), restorePet: (pet) => setDiscoveryPets((current) => (current.some((item) => item.id === pet.id) ? current : [pet, ...current])), requests,
    sendRequest: (pet) => { if (!requests.some((item) => item.pet.id === pet.id && item.direction === 'outgoing' && item.status === 'pending')) setRequests((current) => [{ id: `req-${Date.now()}`, direction: 'outgoing', status: 'pending', ownerName: `Tutor de ${pet.name}`, pet, avatar: pet.photos[0] }, ...current]); }, respondRequest,
    conversations, messages, sendMessage: (chatId, body) => { const clean = body.trim(); if (!clean) return; setMessages((current) => ({ ...current, [chatId]: [...(current[chatId] ?? []), { id: `m-${Date.now()}`, sender: 'me', body: clean, sentAt: new Date().toISOString() }] })); setConversations((current) => current.map((item) => item.id === chatId ? { ...item, lastMessage: clean, timeLabel: 'Ahora' } : item)); },
    locations, appointments, scheduleAppointment, setAppointmentStatus: (id, status) => setAppointments((current) => current.map((item) => item.id === id ? { ...item, status, checkedIn: status === 'completed' ? true : item.checkedIn } : item)),
    addReview: (locationId, rating, comment) => { setLocations((current) => current.map((item) => item.id === locationId ? { ...item, reviewCount: item.reviewCount + 1, rating: Number(((item.rating * item.reviewCount + rating) / (item.reviewCount + 1)).toFixed(1)), reviews: [{ id: `r-${Date.now()}`, authorName: profile.name.split(' ')[0], rating, comment, verified: true }, ...item.reviews] } : item)); setAppointments((current) => current.map((item) => item.location.id === locationId && item.status === 'completed' ? { ...item, reviewSubmitted: true } : item)); },
  };
  return <WebAppContext.Provider value={value}>{children}</WebAppContext.Provider>;
}

export function useWebApp() { const value = useContext(WebAppContext); if (!value) throw new Error('useWebApp must be used inside WebAppProvider'); return value; }
export function effectiveStatus(appointment: WebAppointment): WebAppointmentStatus { if (appointment.status !== 'scheduled') return appointment.status; const now = Date.now(); return now >= new Date(appointment.startAt).getTime() && now <= new Date(appointment.endAt).getTime() ? 'in_progress' : 'scheduled'; }
