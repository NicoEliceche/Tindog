import type { Pet } from './pet.types';

export type ConnectionRequestStatus = 'pending' | 'accepted' | 'declined';
export type ConnectionRequestDirection = 'incoming' | 'outgoing';

export interface ConnectionRequest {
  id: string;
  direction: ConnectionRequestDirection;
  status: ConnectionRequestStatus;
  ownerName: string;
  ownerAvatar: string;
  pet: Pet;
  createdAt: string;
}

export type MessageKind = 'text' | 'appointment' | 'system';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'me' | 'them' | 'system';
  kind: MessageKind;
  body: string;
  sentAt: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  ownerName: string;
  petName: string;
  avatar: string;
  lastMessage: string;
  timeLabel: string;
  unread: boolean;
  intent: 'Cita' | 'Cruza' | 'Juego';
  requestId?: string;
}
