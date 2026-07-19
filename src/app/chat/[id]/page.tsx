import { ChatRoomScreen } from '@/features/chat/screens/ChatRoomScreen';

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: 'chat-1' }, { id: 'chat-2' }, { id: 'chat-3' }];
}

export default function ChatRoomPage({ params }: { params: { id: string } }) {
  return <ChatRoomScreen chatId={params.id} />;
}
