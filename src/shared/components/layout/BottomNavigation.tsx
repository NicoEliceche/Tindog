// src/shared/components/layout/BottomNavigation.tsx
'use client';

import React from 'react';
import styled from 'styled-components';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Heart, Calendar, Dog, User } from 'lucide-react';

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background: white;
  border-top: 1px solid ${({ theme }) => theme.color.border};
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1000;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    top: 0;
    bottom: auto;
    border-top: none;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
    justify-content: center;
    gap: 3rem;
    
    /* Centrado alineado con el MainContent */
    max-width: 1200px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
`;

const NavItem = styled.button<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${({ theme, $active }) => $active ? theme.color.primary : theme.color.textSecondary};
  transition: all 0.3s ease;
  padding: 0 1rem;

  span {
    font-size: 11px;
    font-weight: ${({ $active }) => $active ? 'bold' : '500'};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: row;
    gap: 8px;
    padding: 0.5rem 1.5rem;
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ theme, $active }) => $active ? theme.color.primaryFaded : 'transparent'};
  }
`;

const NAV_ITEMS = [
  { icon: Search, label: 'Descubrir', path: '/discovery' },
  { icon: Heart, label: 'Matches', path: '/matches' },
  { icon: Calendar, label: 'Agenda', path: '/appointments' },
  { icon: Dog, label: 'Mascotas', path: '/pets' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/' || pathname === '/login') return null;

  return (
    <NavWrapper>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.path);
        const Icon = item.icon;
        return (
          <NavItem 
            key={item.path} 
            $active={isActive} 
            onClick={() => router.push(item.path)}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </NavItem>
        );
      })}
    </NavWrapper>
  );
}
