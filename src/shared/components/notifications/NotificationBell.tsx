'use client';

import { useWebApp, type WebNotificationKind } from '@core/providers/WebAppProvider';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bell, BellOff, CalendarClock, MessageCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Root, BellButton, Badge, Dismiss, Panel, PanelHeader, List, Item, ItemIcon, ItemCopy,
  UnreadDot, EmptyState,
} from './NotificationBellStyled';

const KIND_ICON: Record<WebNotificationKind, typeof Bell> = {
  request: UserPlus,
  message: MessageCircle,
  appointment: CalendarClock,
};

/**
 * Campana de notificaciones con panel desplegable.
 *
 * El panel crece desde el ícono (transform-origin arriba a la derecha), así
 * la animación explica de dónde viene el contenido en lugar de aparecer
 * suelto en la pantalla.
 */
export function NotificationBell() {
  const { notifications, unreadNotifications, markNotificationsRead } = useWebApp();
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  // Al cerrar se dan por vistas. Marcarlas al abrir borraría el resaltado de
  // las nuevas justo cuando el usuario está por leerlas.
  const close = useCallback(() => {
    setOpen(false);
    markNotificationsRead();
  }, [markNotificationsRead]);

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
              // Nace en la campana, no en el centro del panel.
              style={{ transformOrigin: 'top right' }}
            >
              <PanelHeader>
                <h2>Notificaciones</h2>
                <button type="button" onClick={markNotificationsRead} disabled={unreadNotifications === 0}>
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
                      >
                        <Link href={item.href} onClick={close}>
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
          </>
        ) : null}
      </AnimatePresence>
    </Root>
  );
}
