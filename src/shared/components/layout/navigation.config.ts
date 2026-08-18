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

/** Rutas públicas: no hay sesión, así que no va navegación de ningún tipo. */
function isPublicRoute(pathname: string): boolean {
  return pathname === '/' || pathname === '/login';
}

/**
 * Oculta toda la navegación. Sólo aplica a las rutas públicas y a las
 * pantallas inmersivas de teléfono, donde el contenido ocupa todo el alto.
 */
export function isNavHidden(pathname: string): boolean {
  return isPublicRoute(pathname);
}

/**
 * La barra inferior sólo se oculta en las rutas públicas y en el detalle de
 * una mascota.
 *
 * Ajustes, la conversación abierta y el mapa para agendar salieron de la
 * lista: se llega a las tres desde secciones de la barra, y perderla obligaba
 * a usar el gesto de atrás del sistema para ir a cualquier otra parte.
 */
export function isBottomNavHidden(pathname: string): boolean {
  return (
    isPublicRoute(pathname) ||
    /^\/pets\/[^/]+\//.test(pathname)
  );
}

/**
 * La barra lateral de escritorio sólo desaparece en las rutas públicas: hay
 * espacio de sobra y perderla obliga a volver con el navegador. Ajustes y el
 * mapa la conservan.
 */
export function isSidebarHidden(pathname: string): boolean {
  return isPublicRoute(pathname);
}
