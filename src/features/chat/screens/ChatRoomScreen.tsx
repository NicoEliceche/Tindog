'use client';

import { effectiveStatus, useWebApp, type WebMessage } from '@core/providers/WebAppProvider';
import { ArrowLeft, CalendarDays, Check, ChevronRight, Copy, CornerUpLeft, FileText, Image as ImageIcon, Paperclip, Pencil, Send, ShieldCheck, Smile, Trash2, Video, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { AppointmentBanner, AttachPanel, Attachment, Bubble, BubbleMeta, Composer, ContextBar, EmojiPanel, Header, MessageMenu, MessageRow, Messages, Quote, Safety, Screen } from './ChatRoomScreenStyled';
import { useToast } from '@shared/components/ui';
import {
  DOCUMENT_ACCEPT_ATTRIBUTE, PHOTO_ACCEPT_ATTRIBUTE, VIDEO_ACCEPT_ATTRIBUTE,
  rejectDocument, rejectPhoto, rejectVideo,
} from '@core/security/mediaLimits';
import { EMOJI_GROUPS } from '../data/emojis';
import { uploadChatAttachment } from '@core/data/services/attachmentUpload';

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
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  /** Que tipo de archivo se esta eligiendo, para validar con la regla justa. */
  const pickKind = useRef<'photo' | 'video' | 'document'>('photo');
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

  /** Abre el selector de archivos con el filtro del tipo pedido. */
  const pickFile = (kind: 'photo' | 'video' | 'document') => {
    pickKind.current = kind;
    const input = fileInput.current;
    if (!input) return;
    input.accept = kind === 'photo' ? PHOTO_ACCEPT_ATTRIBUTE
      : kind === 'video' ? VIDEO_ACCEPT_ATTRIBUTE
      : DOCUMENT_ACCEPT_ATTRIBUTE;
    input.value = '';
    input.click();
    setShowAttach(false);
  };

  /**
   * Adjunta el archivo elegido.
   *
   * Se valida acá y no sólo en el servidor porque el aviso tiene que llegar
   * antes de subir: descubrir a los 20 MB que el archivo no servía es una
   * espera perdida. Son las mismas reglas que usa la galería de una mascota.
   */
  const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const kind = pickKind.current;
    const reason = kind === 'photo' ? rejectPhoto(file)
      : kind === 'video' ? rejectVideo(file)
      : rejectDocument(file);
    if (reason) {
      toast({ title: 'No pudimos adjuntarlo', body: reason, tone: 'error' });
      return;
    }
    // Se muestra de una con una referencia local, para no dejar la pantalla
    // quieta mientras sube, y se reemplaza por la definitiva al terminar.
    setUploading(true);
    const { attachment, error } = await uploadChatAttachment({ conversationId: conversation.id, kind, file });
    setUploading(false);

    if (error) {
      toast({ title: 'No pudimos adjuntarlo', body: error, tone: 'error' });
      return;
    }
    if (!attachment) return;

    sendMessage(conversation.id, draft, replyTo?.id, attachment);
    setDraft('');
    setReplyTo(null);
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
            <MessageRow
              key={message.id}
              $mine={mine}
              $system={message.sender === 'system'}
              /* Doble clic responde, igual que arrastrar en el telefono.
                 Va en la fila y no en la burbuja para que tambien funcione
                 en el hueco de al lado, que es donde no molesta al leer. */
              onDoubleClick={() => {
                if (message.sender === 'system' || message.deletedAt) return;
                startReply(message);
              }}
            >
            <Bubble
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
              {message.attachment && !deleted ? (
                <Attachment $mine={mine}>
                  {message.attachment.kind === 'photo' ? (
                    <img src={message.attachment.url} alt={message.attachment.name} />
                  ) : message.attachment.kind === 'video' ? (
                    <video src={message.attachment.url} controls playsInline preload="metadata" />
                  ) : (
                    <a className="doc" href={message.attachment.url} target="_blank" rel="noreferrer">
                      <FileText size={22} />
                      <span className="doc-copy">
                        <strong>{message.attachment.name}</strong>
                        <small>{Math.round(message.attachment.size / 1024)} KB</small>
                      </span>
                    </a>
                  )}
                </Attachment>
              ) : null}

              {deleted || message.body ? (
                <span style={deleted ? { fontStyle: 'italic', opacity: 0.6 } : undefined}>
                  {deleted ? 'Borrado' : message.body}
                </span>
              ) : null}
              {message.sender !== 'system' ? (
                <BubbleMeta $mine={mine}>
                  {message.editedAt && !deleted ? 'editado · ' : ''}
                  {new Date(message.sentAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </BubbleMeta>
              ) : null}
            </Bubble>
            </MessageRow>
          );
        })}
      </Messages>

      {showEmojis ? (
        <EmojiPanel>
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <strong>{group.label}</strong>
              <div className="row">
                {group.emojis.map((emoji) => (
                  <button key={emoji} type="button" onClick={() => setDraft((current) => current + emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </EmojiPanel>
      ) : null}

      {showAttach ? (
        <AttachPanel>
          <button type="button" onClick={() => pickFile('photo')}><ImageIcon size={22} /> Foto</button>
          <button type="button" onClick={() => pickFile('video')}><Video size={22} /> Video</button>
          <button type="button" onClick={() => pickFile('document')}><FileText size={22} /> Documento</button>
        </AttachPanel>
      ) : null}

      <input ref={fileInput} type="file" hidden onChange={onFileChosen} />

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
        <button type="button" className="calendar" aria-label="Emojis" disabled={blocked} onClick={() => { setShowEmojis((v) => !v); setShowAttach(false); }}>
          <Smile size={21} />
        </button>
        <button type="button" className="calendar" aria-label="Adjuntar archivo" disabled={blocked || uploading} onClick={() => { setShowAttach((v) => !v); setShowEmojis(false); }}>
          <Paperclip size={21} />
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
