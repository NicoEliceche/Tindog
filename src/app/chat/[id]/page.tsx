import { ChatRoomScreen } from '@/features/chat/screens/ChatRoomScreen';

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  return <ChatRoomScreen chatId={params.id} />;
}
