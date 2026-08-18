import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { myPets as seededPets } from '../data/mock/pets';
import { connectionRequests as seededRequests, initialAppointments, initialConversations, initialMessages, safeLocations } from '../data/mock/social';
import type { Appointment, AppointmentStatus, SafeLocationReview } from '../types/appointment.types';
import type { AuthUser } from '../types/auth.types';
import type { Pet } from '../types/pet.types';
import type { ChatMessage, ConnectionRequest, Conversation } from '../types/social.types';

interface AppDataContextValue {
  profile: AuthUser;
  requests: ConnectionRequest[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  appointments: Appointment[];
  locations: typeof safeLocations;
  myPets: Pet[];
  createPet: (draft: NewPetDraft) => Pet;
  adoptRemotePets: (pets: Pet[]) => void;
  savedPets: SavedPet[];
  savePet: (pet: Pet) => void;
  unsavePet: (petId: string) => void;
  blockedOwners: string[];
  blockOwner: (name: string) => void;
  unblockOwner: (name: string) => void;
  sendConnectionRequest: (pet: Pet) => ConnectionRequest;
  respondToRequest: (requestId: string, accept: boolean) => void;
  sendMessage: (conversationId: string, body: string) => void;
  scheduleAppointment: (conversationId: string, locationId: string, startAt: string) => Appointment | null;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  addLocationReview: (locationId: string, review: Omit<SafeLocationReview, 'id' | 'createdAt' | 'verifiedAttendance'>) => void;
  updateProfileAvatar: (uri: string) => void;
  updateProfile: (updates: Partial<Pick<AuthUser, 'name' | 'avatar'>>) => void;
}

/**
 * Lo que el formulario de alta puede completar. El resto de campos de `Pet`
 * los deriva `createPet`, para que la pantalla no tenga que inventar un id ni
 * saber a quien pertenece la mascota.
 */
export type NewPetDraft = Omit<Pet, 'id' | 'owner_ids' | 'personality_traits'> & {
  personality_traits?: string[];
};

/** Mascota apartada desde Inicio, con la fecha en que se guardo. */
export interface SavedPet {
  pet: Pet;
  savedAt: string;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ user, children }: PropsWithChildren<{ user: AuthUser }>) {
  const [profile, setProfile] = useState(user);
  const [requests, setRequests] = useState(seededRequests);
  const [conversations, setConversations] = useState(initialConversations);
  const [messages, setMessages] = useState(initialMessages);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [locations, setLocations] = useState(safeLocations);
  const [myPets, setMyPets] = useState<Pet[]>(seededPets);
  const [savedPets, setSavedPets] = useState<SavedPet[]>([]);
  const [blockedOwners, setBlockedOwners] = useState<string[]>([]);

  /**
   * Guardar una mascota para verla despues. El boton existia en Inicio y
   * prometia poder volver a verla en favoritos, pero descartaba el perfil sin
   * guardarlo en ningun lado.
   */
  const savePet = useCallback((pet: Pet) => {
    setSavedPets((current) => current.some((item) => item.pet.id === pet.id)
      ? current
      : [{ pet, savedAt: new Date().toISOString() }, ...current]);
  }, []);

  const unsavePet = useCallback((petId: string) => {
    setSavedPets((current) => current.filter((item) => item.pet.id !== petId));
  }, []);

  const blockOwner = useCallback((name: string) => {
    setBlockedOwners((current) => current.includes(name) ? current : [name, ...current]);
  }, []);

  const unblockOwner = useCallback((name: string) => {
    setBlockedOwners((current) => current.filter((item) => item !== name));
  }, []);

  /**
   * Alta de mascota. Vive en el provider y no en la pantalla porque la lista
   * de "Mis perros" tiene que ver la nueva mascota apenas se guarda, sin
   * volver a pedirla al servicio.
   */
  const createPet = (draft: NewPetDraft): Pet => {
    const pet: Pet = {
      ...draft,
      id: `pet-${Date.now()}`,
      owner_ids: ['me'],
      personality_traits: draft.personality_traits ?? [],
    };
    setMyPets((current) => [pet, ...current]);
    return pet;
  };

  /**
   * Reemplaza la lista con lo que devolvio el servicio, conservando las altas
   * hechas en esta sesion: el servicio todavia responde con datos de prueba y
   * pisaria la mascota recien creada.
   */
  const adoptRemotePets = useCallback((pets: Pet[]) => {
    setMyPets((current) => {
      const locals = current.filter((pet) => pet.id.startsWith('pet-'));
      const remoteIds = new Set(pets.map((pet) => pet.id));
      return [...locals.filter((pet) => !remoteIds.has(pet.id)), ...pets];
    });
  }, []);

  const sendConnectionRequest = (pet: Pet) => {
    const existing = requests.find((request) => request.pet.id === pet.id && request.direction === 'outgoing' && request.status === 'pending');
    if (existing) return existing;
    const request: ConnectionRequest = {
      id: `request-${Date.now()}`,
      direction: 'outgoing',
      status: 'pending',
      ownerName: 'Tutor de ' + pet.name,
      ownerAvatar: pet.photos[0],
      pet,
      createdAt: new Date().toISOString(),
    };
    setRequests((current) => [request, ...current]);
    return request;
  };

  const respondToRequest = (requestId: string, accept: boolean) => {
    const request = requests.find((item) => item.id === requestId);
    if (!request || request.status !== 'pending') return;
    setRequests((current) => current.map((item) => item.id === requestId ? { ...item, status: accept ? 'accepted' : 'declined' } : item));
    if (!accept) return;
    const conversation: Conversation = {
      id: `chat-${Date.now()}`,
      ownerName: request.ownerName,
      petName: request.pet.name,
      avatar: request.ownerAvatar,
      lastMessage: 'Solicitud aceptada. Ya pueden conversar.',
      timeLabel: 'Ahora',
      unread: false,
      intent: 'Cruza',
      requestId,
    };
    setConversations((current) => [conversation, ...current]);
    setMessages((current) => ({
      ...current,
      [conversation.id]: [{ id: `system-${Date.now()}`, conversationId: conversation.id, sender: 'system', kind: 'system', body: 'Solicitud aceptada. Protegé tus datos y coordiná el primer encuentro en un lugar público.', sentAt: new Date().toISOString() }],
    }));
  };

  const sendMessage = (conversationId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const message: ChatMessage = { id: `message-${Date.now()}`, conversationId, sender: 'me', kind: 'text', body: trimmed, sentAt: new Date().toISOString() };
    setMessages((current) => ({ ...current, [conversationId]: [...(current[conversationId] ?? []), message] }));
    setConversations((current) => current.map((item) => item.id === conversationId ? { ...item, lastMessage: trimmed, timeLabel: 'Ahora' } : item));
  };

  const scheduleAppointment = (conversationId: string, locationId: string, startAt: string) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    const location = locations.find((item) => item.id === locationId);
    if (!conversation || !location) return null;
    const start = new Date(startAt);
    const appointment: Appointment = {
      id: `appointment-${Date.now()}`,
      conversationId,
      ownerName: conversation.ownerName,
      petNames: ['Firulais', conversation.petName],
      startAt: start.toISOString(),
      endAt: new Date(start.getTime() + 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      location,
      sharedWithTrustedContact: false,
      checkedIn: false,
      reviewSubmitted: false,
    };
    setAppointments((current) => [appointment, ...current]);
    return appointment;
  };

  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus) => {
    setAppointments((current) => current.map((item) => item.id !== appointmentId ? item : {
      ...item,
      status,
      ...(status === 'cancelled' ? { cancelledAt: new Date().toISOString() } : {}),
      ...(status === 'completed' ? { completedAt: new Date().toISOString(), checkedIn: true } : {}),
    }));
  };

  const addLocationReview = (locationId: string, review: Omit<SafeLocationReview, 'id' | 'createdAt' | 'verifiedAttendance'>) => {
    setLocations((current) => current.map((location) => {
      if (location.id !== locationId) return location;
      const nextReview: SafeLocationReview = { ...review, id: `review-${Date.now()}`, createdAt: new Date().toISOString(), verifiedAttendance: true };
      const count = location.reviewCount + 1;
      return { ...location, reviews: [nextReview, ...location.reviews], reviewCount: count, rating: Number(((location.rating * location.reviewCount + review.rating) / count).toFixed(1)) };
    }));
    setAppointments((current) => current.map((item) => item.location.id === locationId && item.status === 'completed' ? { ...item, reviewSubmitted: true } : item));
  };

  const value = useMemo<AppDataContextValue>(() => ({
    profile, requests, conversations, messages, appointments, locations, myPets,
    sendConnectionRequest, respondToRequest, sendMessage, scheduleAppointment, createPet, adoptRemotePets,
    savedPets, savePet, unsavePet, blockedOwners, blockOwner, unblockOwner,
    updateAppointmentStatus, addLocationReview,
    updateProfileAvatar: (uri) => setProfile((current) => ({ ...current, avatar: uri })),
    updateProfile: (updates) => setProfile((current) => ({ ...current, ...updates })),
  }), [adoptRemotePets, appointments, blockOwner, blockedOwners, conversations, locations, messages, myPets, profile,
    requests, savePet, savedPets, unblockOwner, unsavePet]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside AppDataProvider');
  return value;
}
