// src/shared/components/layout/navigation.config.ts
import { CalendarDays, Dog, Home, MessageCircle, User, type LucideIcon } from 'lucide-react';

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
