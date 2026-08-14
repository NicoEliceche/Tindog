import type { Appointment, SafeLocation } from '../../types/appointment.types';
import type { ChatMessage, ConnectionRequest, Conversation } from '../../types/social.types';
import { discoveryPets } from './pets';

export const safeLocations: SafeLocation[] = [
  {
    id: 'safe-1',
    googlePlaceId: 'ChIJdemo-parque-las-heras',
    name: 'Parque Las Heras · acceso principal',
    address: 'Av. Las Heras 3100, Palermo',
    coordinates: { latitude: -34.5839, longitude: -58.4094 },
    rating: 4.8,
    reviewCount: 46,
    isOpen: true,
    distanceKm: 1.2,
    tags: ['Iluminado', 'Concurrido', 'Pet friendly'],
    reviews: [
      { id: 'review-1', authorName: 'Marina', rating: 5, comment: 'Buen movimiento y espacio para una primera presentación.', createdAt: '2026-07-12', verifiedAttendance: true },
      { id: 'review-2', authorName: 'Pablo', rating: 4, comment: 'Conviene encontrarse cerca del acceso principal.', createdAt: '2026-06-29', verifiedAttendance: true },
    ],
  },
  {
    id: 'safe-2',
    googlePlaceId: 'ChIJdemo-plaza-guemes',
    name: 'Plaza Güemes',
    address: 'Charcas 3700, Palermo',
    coordinates: { latitude: -34.5884, longitude: -58.4182 },
    rating: 4.6,
    reviewCount: 31,
    isOpen: true,
    distanceKm: 2.1,
    tags: ['Comercio cercano', 'Iluminado', 'Accesible'],
    reviews: [],
  },
  {
    id: 'safe-3',
    googlePlaceId: 'ChIJdemo-barrancas-belgrano',
    name: 'Barrancas de Belgrano',
    address: 'Echeverría 1800, Belgrano',
    coordinates: { latitude: -34.5592, longitude: -58.4494 },
    rating: 4.7,
    reviewCount: 58,
    isOpen: true,
    distanceKm: 4.8,
    tags: ['Muy concurrido', 'Transporte', 'Pet friendly'],
    reviews: [],
  },
];

export const connectionRequests: ConnectionRequest[] = [
  {
    id: 'request-in-1',
    direction: 'incoming',
    status: 'pending',
    ownerName: 'Laura Martínez',
    ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    pet: discoveryPets[0],
    createdAt: '2026-07-31T12:20:00.000Z',
  },
];

export const initialConversations: Conversation[] = [
  {
    id: 'chat-2',
    ownerName: 'Carlos Ruiz',
    petName: 'Roco',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    lastMessage: 'El parque de siempre nos queda perfecto.',
    timeLabel: 'Ayer',
    unread: true,
    intent: 'Cita',
  },
  {
    id: 'chat-3',
    ownerName: 'Sofía Pereyra',
    petName: 'Nala',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
    lastMessage: 'Nala tiene energía para jugar con Firulais.',
    timeLabel: 'Lun',
    unread: false,
    intent: 'Juego',
  },
];

export const initialMessages: Record<string, ChatMessage[]> = {
  'chat-2': [
    { id: 'm-1', conversationId: 'chat-2', sender: 'them', kind: 'text', body: '¡Hola! Roco se llevó muy bien con el perfil de Firulais.', sentAt: '2026-07-30T15:10:00.000Z', readAt: '2026-07-30T15:11:00.000Z' },
    { id: 'm-2', conversationId: 'chat-2', sender: 'me', kind: 'text', body: 'Podemos organizar una presentación tranquila en un lugar público.', sentAt: '2026-07-30T15:14:00.000Z', readAt: '2026-07-30T15:15:00.000Z' },
    { id: 'm-3', conversationId: 'chat-2', sender: 'them', kind: 'text', body: 'El parque de siempre nos queda perfecto.', sentAt: '2026-07-30T15:18:00.000Z' },
  ],
  'chat-3': [
    { id: 'm-4', conversationId: 'chat-3', sender: 'them', kind: 'text', body: 'Nala tiene energía para jugar con Firulais.', sentAt: '2026-07-28T18:20:00.000Z', readAt: '2026-07-28T18:30:00.000Z' },
  ],
};

export const initialAppointments: Appointment[] = [
  {
    id: 'appointment-1',
    conversationId: 'chat-2',
    ownerName: 'Carlos Ruiz',
    petNames: ['Firulais', 'Roco'],
    startAt: '2026-08-02T18:00:00-03:00',
    endAt: '2026-08-02T19:00:00-03:00',
    status: 'scheduled',
    location: safeLocations[0],
    sharedWithTrustedContact: true,
    checkedIn: false,
    reviewSubmitted: false,
  },
  {
    id: 'appointment-2',
    conversationId: 'chat-3',
    ownerName: 'Sofía Pereyra',
    petNames: ['Firulais', 'Nala'],
    startAt: '2026-07-18T15:00:00-03:00',
    endAt: '2026-07-18T16:00:00-03:00',
    status: 'completed',
    location: safeLocations[1],
    completedAt: '2026-07-18T16:00:00-03:00',
    sharedWithTrustedContact: false,
    checkedIn: true,
    reviewSubmitted: false,
  },
  {
    id: 'appointment-3',
    conversationId: 'chat-3',
    ownerName: 'Sofía Pereyra',
    petNames: ['Mora', 'Nala'],
    startAt: '2026-07-10T11:00:00-03:00',
    endAt: '2026-07-10T12:00:00-03:00',
    status: 'cancelled',
    location: safeLocations[2],
    cancelledAt: '2026-07-09T20:15:00-03:00',
    sharedWithTrustedContact: false,
    checkedIn: false,
    reviewSubmitted: false,
  },
];
