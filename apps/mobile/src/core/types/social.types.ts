import type { Pet } from './pet.types';

// 'cancelled' es la que retira quien la envio, y ya existia en la web.
export type ConnectionRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
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

/**
 * Un mensaje del chat.
 *
 * `replyTo`, `editedAt` y `deletedAt` sostienen responder, editar y borrar.
 * Un mensaje borrado conserva su lugar en la conversación y muestra
 * "Borrado" en vez del texto, como en WhatsApp: sacarlo de la lista dejaría
 * huecos raros en una charla que la otra persona ya leyó.
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'me' | 'them' | 'system';
  kind: MessageKind;
  body: string;
  sentAt: string;
  readAt?: string;
  /** Id del mensaje citado, si este responde a otro. */
  replyTo?: string;
  /** Cuándo se editó por última vez; ausente si nunca se tocó. */
  editedAt?: string;
  /** Cuándo se borró. El cuerpo se conserva pero no se muestra. */
  deletedAt?: string;
  /** Archivo adjunto, si el mensaje lleva uno. */
  attachment?: MessageAttachment;
}

/** Un archivo adjunto a un mensaje. */
export interface MessageAttachment {
  kind: 'photo' | 'video' | 'document';
  url: string;
  /** Nombre original, para poder mostrarlo en los documentos. */
  name: string;
  /** Tamaño en bytes, para mostrarlo junto al nombre. */
  size: number;
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
