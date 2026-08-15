// src/shared/components/layout/navigation.config.ts
import { Bookmark, CalendarDays, Dog, Home, MessageCircle, ShieldCheck, User, UserPlus, type LucideIcon } from 'lucide-react';

export interface NavItem {
  path: string;
  label: string;
  Icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/discovery', label: 'Inicio', Icon: Home },
  { path: '/chat', label: 'Mensajes', Icon: MessageCircle },
  { path: '/appointments', label: 'Citas', Icon: CalendarDays },
  { path: '/pets', label: 'Mis perros', Icon: Dog },
  { path: '/profile', label: 'Perfil', Icon: User },
];

/**
 * Secciones que sólo aparecen en la barra lateral de escritorio.
 *
 * La barra inferior del teléfono ya llega a cinco destinos, que es el techo
 * razonable antes de que los toques empiecen a fallar. Estas tres se
 * alcanzan desde las notificaciones y desde el perfil, donde el contexto
 * las hace obvias, en vez de apretar más una barra que ya está llena.
 */
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { path: '/requests', label: 'Solicitudes', Icon: UserPlus },
  { path: '/saved', label: 'Guardados', Icon: Bookmark },
  { path: '/safety', label: 'Seguridad', Icon: ShieldCheck },
];

export function isNavHidden(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/login' ||
    /^\/chat\/[^/]+$/.test(pathname) ||
    pathname === '/appointments/location' ||
    pathname === '/settings' ||
    /^\/pets\/[^/]+\//.test(pathname)
  );
}
