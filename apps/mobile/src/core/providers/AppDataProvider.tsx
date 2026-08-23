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
  updatePet: (petId: string, draft: NewPetDraft) => void;
  adoptRemotePets: (pets: Pet[]) => void;
  savedPets: SavedPet[];
  savePet: (pet: Pet) => void;
  unsavePet: (petId: string) => void;
  blockedOwners: string[];
  blockOwner: (name: string) => void;
  unblockOwner: (name: string) => void;
  notifications: AppNotification[];
  unreadNotifications: number;
  markNotificationsRead: (notificationId?: string) => void;
  markNotificationUnread: (notificationId: string) => void;
  sendConnectionRequest: (pet: Pet) => ConnectionRequest;
  respondToRequest: (requestId: string, accept: boolean) => void;
  /** Retira una solicitud propia que todavia esta pendiente. */
  cancelRequest: (requestId: string) => void;
  sendMessage: (conversationId: string, body: string) => void;
  scheduleAppointment: (conversationId: string, locationId: string, startAt: string) => Appointment | null;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus) => void;
  addLocationReview: (locationId: string, review: Omit<SafeLocationReview, 'id' | 'createdAt' | 'verifiedAttendance'>) => void;
  updateProfileAvatar: (uri: string) => void;
  updateProfile: (updates: Partial<Pick<AuthUser, 'name' | 'avatar' | 'zone'>>) => void;
}

/**
 * Lo que el formulario de alta puede completar. El resto de campos de `Pet`
 * los deriva `createPet`, para que la pantalla no tenga que inventar un id ni
 * saber a quien pertenece la mascota.
 */
export type NewPetDraft = Omit<Pet, 'id' | 'owner_ids' | 'personality_traits'> & {
  personality_traits?: string[];
};

export type NotificationKind = 'request' | 'message' | 'appointment';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  avatar?: string;
  /** Pantalla a la que lleva el toque sobre la notificacion. */
  target: 'Requests' | 'Messages' | 'Appointments';
  /** Conversacion a abrir, cuando el aviso viene de un mensaje. */
  conversationId?: string;
  read: boolean;
}

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
  // Los avisos no son un estado aparte: se derivan de lo que ya paso en la
  // app, asi no pueden quedar desincronizados con la realidad. Solo se guarda
  // cuales fueron leidos.
  const [readNotifications, setReadNotifications] = useState<string[]>([]);
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

  /** Guarda los cambios de una mascota ya existente. */
  const updatePet = useCallback((petId: string, draft: NewPetDraft) => {
    setMyPets((current) => current.map((pet) => pet.id === petId
      ? { ...pet, ...draft, id: pet.id, owner_ids: pet.owner_ids, personality_traits: draft.personality_traits ?? pet.personality_traits }
      : pet));
  }, []);

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

  /**
   * Retira una solicitud enviada que sigue pendiente.
   *
   * Existia en la web y faltaba aca: sin esto, "Deshacer" devolvia la
   * tarjeta pero la solicitud quedaba viva del otro lado.
   */
  const cancelRequest = (requestId: string) => {
    setRequests((current) => current.map((item) => (
      item.id === requestId && item.status === 'pending'
        ? { ...item, status: 'cancelled' as const }
        : item
    )));
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

  const notifications = useMemo<AppNotification[]>(() => {
    const items: Omit<AppNotification, 'read'>[] = [];

    for (const request of requests) {
      if (request.direction !== 'incoming' || request.status !== 'pending') continue;
      items.push({
        id: `notif-req-${request.id}`,
        kind: 'request',
        title: 'Nueva solicitud de conexion',
        body: `${request.ownerName} quiere conectar a ${request.pet.name} con Firulais.`,
        avatar: request.ownerAvatar,
        target: 'Requests',
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
        target: 'Messages',
        conversationId: chat.id,
      });
    }

    const now = Date.now();
    for (const appointment of appointments) {
      if (appointment.status !== 'scheduled') continue;
      const hours = (new Date(appointment.startAt).getTime() - now) / 3_600_000;
      // Solo avisamos de lo que esta por venir, no de lo que ya paso.
      if (hours < 0 || hours > 72) continue;
      items.push({
        id: `notif-appt-${appointment.id}`,
        kind: 'appointment',
        title: 'Cita proxima',
        body: `Paseo con ${appointment.ownerName} en ${appointment.location.name}.`,
        target: 'Appointments',
      });
    }

    return items.map((item) => ({ ...item, read: readNotifications.includes(item.id) }));
  }, [appointments, conversations, readNotifications, requests]);

  /** Devuelve un aviso a no leido, para poder retomarlo mas tarde. */
  const markNotificationUnread = useCallback((notificationId: string) => {
    setReadNotifications((current) => current.filter((id) => id !== notificationId));
  }, []);

  const unreadNotifications = notifications.filter((item) => !item.read).length;

  /**
   * Marca avisos como leidos. Sin argumento los marca todos, que es lo que
   * hace el boton "Marcar leidas"; con un id marca solo ese.
   */
  const markNotificationsRead = useCallback((notificationId?: string) => {
    setReadNotifications((current) => {
      const ids = notificationId ? [notificationId] : notifications.map((item) => item.id);
      return Array.from(new Set([...current, ...ids]));
    });
  }, [notifications]);

  const value = useMemo<AppDataContextValue>(() => ({
    profile, requests, conversations, messages, appointments, locations, myPets,
    sendConnectionRequest, respondToRequest, cancelRequest, sendMessage, scheduleAppointment, createPet, updatePet, adoptRemotePets,
    savedPets, savePet, unsavePet, blockedOwners, blockOwner, unblockOwner,
    notifications, unreadNotifications, markNotificationsRead, markNotificationUnread,
    updateAppointmentStatus, addLocationReview,
    updateProfileAvatar: (uri) => setProfile((current) => ({ ...current, avatar: uri })),
    updateProfile: (updates) => setProfile((current) => ({ ...current, ...updates })),
  }), [adoptRemotePets, appointments, blockOwner, blockedOwners, conversations, locations, markNotificationsRead,
    markNotificationUnread, messages, myPets, notifications, profile, requests, savePet, savedPets, unblockOwner, unreadNotifications,
    unsavePet, updatePet]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside AppDataProvider');
  return value;
}
