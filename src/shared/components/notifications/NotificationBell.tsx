'use client';

import { useWebApp, type WebNotificationKind } from '@core/providers/WebAppProvider';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bell, BellOff, CalendarClock, MessageCircle, UserPlus, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Root, BellButton, Badge, Dismiss, Panel, PanelHeader, List, Item, ItemIcon, ItemCopy,
  UnreadDot, EmptyState, ContextMenu,
} from './NotificationBellStyled';

const KIND_ICON: Record<WebNotificationKind, typeof Bell> = {
  request: UserPlus,
  message: MessageCircle,
  appointment: CalendarClock,
  cancelled: XCircle,
};

/**
 * Campana de notificaciones con panel desplegable.
 *
 * El panel crece desde el ícono (transform-origin arriba a la derecha), así
 * la animación explica de dónde viene el contenido en lugar de aparecer
 * suelto en la pantalla.
 */
export function NotificationBell() {
  const { notifications, unreadNotifications, markNotificationsRead, markNotificationUnread } = useWebApp();
  /** Aviso sobre el que se abrio el menu, y donde ponerlo. */
  const [menu, setMenu] = useState<{ id: string; read: boolean; x: number; y: number } | null>(null);
  // El toque largo en el telefono equivale al clic derecho: se mide el tiempo
  // desde que se apoya el dedo y se cancela si se mueve o se suelta antes.
  const pressTimer = useRef<number | undefined>(undefined);

  const openMenu = useCallback((item: { id: string; read: boolean }, x: number, y: number) => {
    setMenu({ id: item.id, read: item.read, x, y });
  }, []);

  const cancelPress = useCallback(() => {
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = undefined;
  }, []);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  // Cerrar el panel no marca nada: haber abierto la campana no significa
  // haber leido los avisos, y se perdia el resaltado de todo lo pendiente.
  // Se marcan al abrir uno, o con el boton "Marcar leidas".
  const close = useCallback(() => { setOpen(false); setMenu(null); }, []);

  // Escape cierra el panel: es lo que espera cualquiera que lo abrió sin querer.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  const toggle = () => {
    if (open) close();
    else setOpen(true);
  };

  return (
    <Root ref={rootRef}>
      <BellButton
        type="button"
        $open={open}
        onClick={toggle}
        aria-label={unreadNotifications > 0 ? `Notificaciones, ${unreadNotifications} sin leer` : 'Notificaciones'}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Bell size={19} />
        {unreadNotifications > 0 ? (
          <Badge
            key="badge"
            // `initial` no puede depender de useReducedMotion: en el servidor
            // siempre es false y en el cliente puede ser true, y esa diferencia
            // rompe la hidratación. El estado inicial es fijo y la preferencia
            // sólo decide la duración del salto.
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 22 }}
          >
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </Badge>
        ) : null}
      </BellButton>

      <AnimatePresence>
        {open ? (
          <>
            <Dismiss onClick={close} />
            <Panel
              key="panel"
              role="dialog"
              aria-label="Notificaciones"
              initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.86, y: reduceMotion ? 0 : -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.92, y: reduceMotion ? 0 : -6 }}
              transition={reduceMotion ? { duration: 0.12 } : { type: 'spring', stiffness: 380, damping: 30 }}
              // Nace en la esquina superior derecha, que es donde está la
              // campana. En pantallas angostas el panel ocupa el ancho del
              // viewport, así que ese punto queda igualmente arriba a la
              // derecha, cerca del ícono.
              style={{ transformOrigin: 'top right' }}
            >
              <PanelHeader>
                <h2>Notificaciones</h2>
                <button type="button" onClick={() => markNotificationsRead()} disabled={unreadNotifications === 0}>
                  Marcar leídas
                </button>
              </PanelHeader>

              {notifications.length > 0 ? (
                <List>
                  {notifications.map((item, index) => {
                    const Icon = KIND_ICON[item.kind];
                    return (
                      <Item
                        key={item.id}
                        $unread={!item.read}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={reduceMotion
                          ? { duration: 0 }
                          : { delay: index * 0.045, duration: 0.28, ease: 'easeOut' }}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          openMenu(item, event.clientX, event.clientY);
                        }}
                        onPointerDown={(event) => {
                          if (event.pointerType === 'mouse') return;
                          const { clientX, clientY } = event;
                          pressTimer.current = window.setTimeout(() => openMenu(item, clientX, clientY), 500);
                        }}
                        onPointerUp={cancelPress}
                        onPointerMove={cancelPress}
                        onPointerCancel={cancelPress}
                      >
                        <Link href={item.href} onClick={() => { markNotificationsRead(item.id); close(); }}>
                          <ItemIcon>
                            {item.avatar ? <img src={item.avatar} alt="" /> : <Icon size={17} />}
                          </ItemIcon>
                          <ItemCopy>
                            <strong>{item.title}</strong>
                            <p>{item.body}</p>
                          </ItemCopy>
                          {!item.read ? <UnreadDot /> : null}
                        </Link>
                      </Item>
                    );
                  })}
                </List>
              ) : (
                <EmptyState>
                  <BellOff size={30} />
                  <p>No tenés notificaciones nuevas.</p>
                </EmptyState>
              )}
            </Panel>

            {menu ? (
              <>
                <Dismiss onClick={() => setMenu(null)} />
                <ContextMenu
                  role="menu"
                  style={{ left: menu.x, top: menu.y }}
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                  transition={{ duration: reduceMotion ? 0 : 0.16 }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      if (menu.read) markNotificationUnread(menu.id);
                      else markNotificationsRead(menu.id);
                      setMenu(null);
                    }}
                  >
                    {menu.read ? 'Marcar como no leída' : 'Marcar como leída'}
                  </button>
                </ContextMenu>
              </>
            ) : null}
          </>
        ) : null}
      </AnimatePresence>
    </Root>
  );
}
