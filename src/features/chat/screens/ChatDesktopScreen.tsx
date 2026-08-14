// src/features/chat/screens/ChatDesktopScreen.tsx
'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { ChatListScreen } from './ChatListScreen';
import { ChatRoomScreen } from './ChatRoomScreen';
import { DesktopShell, ListColumn, RoomColumn, RoomEmptyState } from './ChatDesktopScreenStyled';

export function ChatDesktopScreen() {
  const { conversations } = useWebApp();
  const [selectedId, setSelectedId] = useState<string | undefined>(conversations[0]?.id);

  return (
    <DesktopShell>
      <ListColumn>
        <ChatListScreen panelMode activeId={selectedId} onSelectChat={setSelectedId} />
      </ListColumn>
      <RoomColumn>
        {selectedId ? (
          <ChatRoomScreen chatId={selectedId} panelMode />
        ) : (
          <RoomEmptyState>
            <div>
              <MessageCircle size={40} />
              <h2>Seleccioná una conversación</h2>
              <p>Elegí un chat de la lista para ver los mensajes y coordinar el encuentro.</p>
            </div>
          </RoomEmptyState>
        )}
      </RoomColumn>
    </DesktopShell>
  );
}
