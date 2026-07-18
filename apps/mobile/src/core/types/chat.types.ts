export interface Conversation {
  id: string;
  ownerName: string;
  petName: string;
  avatar: string;
  lastMessage: string;
  timeLabel: string;
  unread: boolean;
  intent: 'Cita' | 'Cruza' | 'Juego';
}
