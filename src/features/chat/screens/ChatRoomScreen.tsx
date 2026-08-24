'use client';

import { effectiveStatus, useWebApp, type WebMessage } from '@core/providers/WebAppProvider';
import { ArrowLeft, CalendarDays, Check, ChevronRight, Copy, CornerUpLeft, Pencil, Send, ShieldCheck, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { AppointmentBanner, Bubble, BubbleMeta, Composer, ContextBar, Header, MessageMenu, Messages, Quote, Safety, Screen } from './ChatRoomScreenStyled';
import { useToast } from '@shared/components/ui';

export interface ChatRoomScreenProps {
  chatId: string;
  panelMode?: boolean;
  onBack?: () => void;
}

export function ChatRoomScreen({ chatId, panelMode = false, onBack }: ChatRoomScreenProps) {
  const router = useRouter();
  const { conversations, messages, sendMessage, editMessage, deleteMessage, appointments, blockedOwners } = useWebApp();
  const toast = useToast();

  /** Mensaje sobre el que se abrió el menú, y dónde ponerlo. */
  const [menu, setMenu] = useState<{ message: WebMessage; x: number; y: number } | null>(null);
  /** Mensaje que se está citando al responder. */
  const [replyTo, setReplyTo] = useState<WebMessage | null>(null);
  /** Mensaje que se está editando; el campo pasa a mostrar su texto. */
  const [editing, setEditing] = useState<WebMessage | null>(null);
  const conversation = conversations.find((item) => item.id === chatId) ?? conversations[0];
  const listRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState('');
  const data = messages[conversation?.id] ?? [];
  const active = appointments.find((item) => item.conversationId === conversation?.id && ['scheduled', 'in_progress'].includes(effectiveStatus(item)));

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [data.length]);

  if (!conversation) return null;

  /** A quien esta bloqueado no se le escribe: el campo queda inhabilitado. */
  const blocked = blockedOwners.includes(conversation.ownerName);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (blocked || !draft.trim()) return;
    if (editing) {
      editMessage(conversation.id, editing.id, draft);
      setEditing(null);
      toast({ title: 'Mensaje editado' });
    } else {
      sendMessage(conversation.id, draft, replyTo?.id);
      setReplyTo(null);
    }
    setDraft('');
  };

  const startReply = (message: WebMessage) => {
    setEditing(null);
    setReplyTo(message);
    setMenu(null);
  };

  const startEdit = (message: WebMessage) => {
    setReplyTo(null);
    setEditing(message);
    setDraft(message.body);
    setMenu(null);
  };

  const copyMessage = async (message: WebMessage) => {
    await navigator.clipboard.writeText(message.body);
    setMenu(null);
    toast({ title: 'Texto copiado' });
  };

  const removeMessage = (message: WebMessage) => {
    deleteMessage(conversation.id, message.id);
    setMenu(null);
    if (replyTo?.id === message.id) setReplyTo(null);
    if (editing?.id === message.id) { setEditing(null); setDraft(''); }
    toast({ title: 'Mensaje borrado' });
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
        {data.map((message) => {
          const quoted = message.replyTo ? data.find((item) => item.id === message.replyTo) : undefined;
          const deleted = Boolean(message.deletedAt);
          const mine = message.sender === 'me';
          return (
            <Bubble
              key={message.id}
              $mine={mine}
              $system={message.sender === 'system'}
              onContextMenu={(event) => {
                if (message.sender === 'system') return;
                event.preventDefault();
                // El menu se abre donde esta el cursor, sin salirse por el
                // borde derecho ni por abajo.
                setMenu({
                  message,
                  x: Math.min(event.clientX, window.innerWidth - 260),
                  y: Math.min(event.clientY, window.innerHeight - 220),
                });
              }}
            >
              {quoted ? (
                <Quote $mine={mine}>
                  <strong>{quoted.sender === 'me' ? 'Vos' : conversation.ownerName}</strong>
                  <span>{quoted.deletedAt ? 'Borrado' : quoted.body}</span>
                </Quote>
              ) : null}
              <span style={deleted ? { fontStyle: 'italic', opacity: 0.6 } : undefined}>
                {deleted ? 'Borrado' : message.body}
              </span>
              {message.sender !== 'system' ? (
                <BubbleMeta $mine={mine}>
                  {message.editedAt && !deleted ? 'editado · ' : ''}
                  {new Date(message.sentAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </BubbleMeta>
              ) : null}
            </Bubble>
          );
        })}
      </Messages>

      {replyTo || editing ? (
        <ContextBar>
          <div className="accent" />
          <div className="copy">
            <strong>{editing ? 'Editando mensaje' : `Respondiendo a ${replyTo?.sender === 'me' ? 'vos' : conversation.ownerName}`}</strong>
            <span>{(editing ?? replyTo)?.body}</span>
          </div>
          <button type="button" aria-label="Cancelar" onClick={() => { setReplyTo(null); setEditing(null); setDraft(''); }}>
            <X size={16} />
          </button>
        </ContextBar>
      ) : null}

      <Composer onSubmit={submit}>
        <button type="button" className="calendar" aria-label="Agendar cita" onClick={() => router.push(`/appointments/location?chat=${conversation.id}`)}>
          <CalendarDays size={21} />
        </button>
        <div className="input">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={blocked}
            placeholder={blocked ? 'Bloqueaste a esta persona' : editing ? 'Editá tu mensaje…' : 'Escribí un mensaje…'}
            maxLength={1000}
          />
          <button className="send" aria-label={editing ? 'Guardar cambios' : 'Enviar'} disabled={blocked || !draft.trim()}>
            {editing ? <Check size={17} /> : <Send size={17} />}
          </button>
        </div>
      </Composer>

      {/* Menú del click derecho. Sólo los mensajes propios se editan o
          borran; los ajenos se pueden responder y copiar. */}
      {menu ? (
        <>
          <div
            role="presentation"
            style={{ position: 'fixed', inset: 0, zIndex: 4400 }}
            onClick={() => setMenu(null)}
            onContextMenu={(event) => { event.preventDefault(); setMenu(null); }}
          />
          <MessageMenu $x={menu.x} $y={menu.y} role="menu">
            <button type="button" onClick={() => startReply(menu.message)}><CornerUpLeft size={16} /> Responder</button>
            <button type="button" onClick={() => void copyMessage(menu.message)}><Copy size={16} /> Copiar texto del mensaje</button>
            {menu.message.sender === 'me' && !menu.message.deletedAt ? (
              <>
                <button type="button" onClick={() => startEdit(menu.message)}><Pencil size={16} /> Editar mensaje</button>
                <button type="button" className="danger" onClick={() => removeMessage(menu.message)}><Trash2 size={16} /> Borrar mensaje</button>
              </>
            ) : null}
          </MessageMenu>
        </>
      ) : null}
    </Screen>
  );
}
