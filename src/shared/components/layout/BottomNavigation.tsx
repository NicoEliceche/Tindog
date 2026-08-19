'use client';

import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { NAV_ITEMS, isBottomNavHidden } from './navigation.config';

const Nav = styled.nav`
  position: fixed; z-index: 1000; left: 0; right: 0; bottom: 0;
  /* Se estira por debajo del borde para cubrir la franja del area segura en
     telefonos con gesto de inicio, donde antes asomaba el fondo. */
  padding-bottom: max(env(safe-area-inset-bottom), 0px);
  min-height: calc(64px + env(safe-area-inset-bottom)); padding: 6px 6px env(safe-area-inset-bottom);
  display: flex; align-items: flex-start; justify-content: space-around;
  background: ${({ theme }) => theme.color.glass}; border-top: 1px solid ${({ theme }) => theme.color.border}; backdrop-filter: blur(18px);
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    top: 0; bottom: auto; left: 50%; right: auto; transform: translateX(-50%); width: min(100%, 1200px); min-height: 70px; padding: 8px 24px;
    align-items: center; justify-content: center; gap: 18px; border-top: 0; border-bottom: 1px solid ${({ theme }) => theme.color.border};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;
const Item = styled.button<{ $active: boolean }>`
  min-width: 60px; min-height: 52px; padding: 5px 8px; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  color: ${({ theme, $active }) => $active ? theme.color.primary : theme.color.textTertiary};
  background: ${({ theme, $active }) => $active ? theme.color.primaryFaded : 'transparent'};
  span { font-size: 10px; font-weight: 800; }
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) { min-width: 132px; flex-direction: row; gap: 8px; span { font-size: 13px; } }
`;

export function BottomNavigation() {
  const pathname = usePathname(); const router = useRouter();
  if (isBottomNavHidden(pathname)) return null;
  return <Nav aria-label="Navegación principal">{NAV_ITEMS.map(({ path, label, Icon }) => { const active = pathname.startsWith(path); return <Item key={path} $active={active} onClick={() => router.push(path)} aria-current={active ? 'page' : undefined}><Icon size={22} strokeWidth={active ? 2.6 : 2} /><span>{label}</span></Item>; })}</Nav>;
}
