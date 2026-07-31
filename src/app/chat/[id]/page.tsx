import { ChatRoomScreen } from '@/features/chat/screens/ChatRoomScreen';

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: 'chat-1' }, { id: 'chat-2' }, { id: 'chat-3' }];
}

export default async function ChatRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatRoomScreen chatId={id} />;
}
