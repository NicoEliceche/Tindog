'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { Check, ChevronRight, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { WebContent, WebHeading, WebScreen, WebSubtitle } from '@shared/components/layout/WebScreen';
import { Chat, Dot, Request, SearchBox, SectionTitle } from './ChatListScreenStyled';
import { MobileOnly } from './ChatDesktopScreenStyled';

export interface ChatListScreenProps {
  panelMode?: boolean;
  activeId?: string;
  onSelectChat?: (chatId: string) => void;
}

export function ChatListScreen({ panelMode = false, activeId, onSelectChat }: ChatListScreenProps) {
  const router = useRouter();
  const { conversations, requests, respondRequest } = useWebApp();
  const [query, setQuery] = useState('');
  const incoming = requests.filter((item) => item.direction === 'incoming' && item.status === 'pending');
  const chats = conversations.filter((item) => `${item.ownerName} ${item.petName}`.toLowerCase().includes(query.toLowerCase()));

  const selectChat = (chatId: string) => {
    if (onSelectChat) onSelectChat(chatId);
    else router.push(`/chat/${chatId}`);
  };

  const body = (
    <>
      {!panelMode && (
        <div>
          <WebHeading>Mensajes</WebHeading>
          <WebSubtitle>El chat se habilita después de aceptar una solicitud.</WebSubtitle>
        </div>
      )}

      <SearchBox>
        <Search size={19} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar conversaciones" />
      </SearchBox>

      {incoming.length ? (
        <>
          <SectionTitle>Solicitudes</SectionTitle>
          {incoming.map((request) => (
            <Request key={request.id}>
              <img src={request.pet.photos[0]} alt={request.pet.name} />
              <div className="copy">
                <h3>{request.ownerName}</h3>
                <p>Quiere conectar con {request.pet.name}</p>
              </div>
              <button aria-label="Rechazar" onClick={() => respondRequest(request.id, false)}><X size={19} /></button>
              <button aria-label="Aceptar" onClick={() => respondRequest(request.id, true)}><Check size={19} /></button>
            </Request>
          ))}
        </>
      ) : null}

      <SectionTitle>Conversaciones</SectionTitle>
      {chats.map((chat) => (
        <Chat key={chat.id} $active={activeId === chat.id} onClick={() => selectChat(chat.id)}>
          <img src={chat.avatar} alt={chat.ownerName} />
          <div className="body">
            <div className="top">
              <h3>{chat.ownerName}</h3>
              <time>{chat.timeLabel}</time>
            </div>
            <strong>{chat.petName} · {chat.intent}</strong>
            <p>{chat.lastMessage}</p>
          </div>
          {chat.unread ? <Dot /> : <ChevronRight size={19} />}
        </Chat>
      ))}
    </>
  );

  if (panelMode) return <>{body}</>;

  return (
    <MobileOnly>
      <WebScreen>
        <WebContent>{body}</WebContent>
      </WebScreen>
    </MobileOnly>
  );
}
