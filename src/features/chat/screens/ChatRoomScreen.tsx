'use client';

import { effectiveStatus, useWebApp } from '@core/providers/WebAppProvider';
import { ArrowLeft, CalendarDays, ChevronRight, Send, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { AppointmentBanner, Bubble, Composer, Header, Messages, Safety, Screen } from './ChatRoomScreenStyled';

export interface ChatRoomScreenProps {
  chatId: string;
  panelMode?: boolean;
  onBack?: () => void;
}

export function ChatRoomScreen({ chatId, panelMode = false, onBack }: ChatRoomScreenProps) {
  const router = useRouter();
  const { conversations, messages, sendMessage, appointments } = useWebApp();
  const conversation = conversations.find((item) => item.id === chatId) ?? conversations[0];
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const data = messages[conversation?.id] ?? [];
  const active = appointments.find((item) => item.conversationId === conversation?.id && ['scheduled', 'in_progress'].includes(effectiveStatus(item)));

  useEffect(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), [data.length]);

  if (!conversation) return null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(conversation.id, draft);
    setDraft('');
  };

  return (
    <Screen $panelMode={panelMode}>
      <Header>
        {!panelMode && (
          <button aria-label="Volver" onClick={() => (onBack ? onBack() : router.back())}><ArrowLeft /></button>
        )}
        <img src={conversation.avatar} alt={conversation.ownerName} />
        <div className="copy">
          <h1>{conversation.ownerName}</h1>
          <p>{conversation.petName} · conexión aceptada</p>
        </div>
        <ShieldCheck color="#78D69A" />
      </Header>

      <Safety>
        <ShieldCheck size={16} />
        Mantené la conversación en Tindog y coordiná el primer encuentro en un lugar público.
      </Safety>

      {active ? (
        <AppointmentBanner onClick={() => router.push(`/appointments/location?appointment=${active.id}`)}>
          <CalendarDays size={18} />
          <span>{new Date(active.startAt).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {active.location.name}</span>
          <ChevronRight size={18} />
        </AppointmentBanner>
      ) : null}

      <Messages ref={listRef}>
        {data.map((message) => (
          <Bubble key={message.id} $mine={message.sender === 'me'} $system={message.sender === 'system'}>{message.body}</Bubble>
        ))}
      </Messages>

      <Composer onSubmit={submit}>
        <button type="button" className="calendar" aria-label="Agendar cita" onClick={() => router.push(`/appointments/location?chat=${conversation.id}`)}>
          <CalendarDays size={21} />
        </button>
        <div className="input">
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Escribí un mensaje…" maxLength={1000} />
          <button className="send" aria-label="Enviar" disabled={!draft.trim()}><Send size={17} /></button>
        </div>
      </Composer>
    </Screen>
  );
}
