export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: Message;
  updatedAt: string;
}
