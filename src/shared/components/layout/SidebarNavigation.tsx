// src/shared/components/layout/SidebarNavigation.tsx
'use client';

import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useWebApp } from '@core/providers/WebAppProvider';
import { withPublicBasePath } from '@core/routing/publicPath';
import { BrandLogo } from '@shared/components/ui';
import { logoutCurrentAuthSession } from '@core/data/services/authService';
import { Avatar } from '@shared/components/ui';
import { NAV_ITEMS, SECONDARY_NAV_ITEMS, isSidebarHidden } from './navigation.config';

const Aside = styled.aside`
  display: none;
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: sticky;
    top: 0;
    height: 100dvh;
    padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.spacing[4]};
    border-right: 1px solid ${({ theme }) => theme.color.border};
    background: ${({ theme }) => theme.color.glass};
    backdrop-filter: blur(18px);
    z-index: 1000;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: 0 ${({ theme }) => theme.spacing[2]};
  margin-bottom: ${({ theme }) => theme.spacing[8]};
`;

const LogoImage = styled(BrandLogo)`
  display: block;
  width: 2.5rem;

  img {
    width: 100%;
    height: auto;
    border-radius: 50%;
  }
`;

const LogoText = styled.span`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.extrabold};
  color: ${({ theme }) => theme.color.text};
  letter-spacing: -0.02em;
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
  flex: 1;
`;

const NavLink = styled.button<{ $active: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[3]} ${({ theme }) => theme.spacing[4]};
  border-radius: ${({ theme }) => theme.radius.lg};
  color: ${({ theme, $active }) => ($active ? theme.color.primary : theme.color.textSecondary)};
  background: ${({ theme, $active }) => ($active ? theme.color.primaryFaded : 'transparent')};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};
  font-size: ${({ theme }) => theme.typography.size.base};
  text-align: left;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.color.primaryFaded};
    color: ${({ theme }) => theme.color.primary};
  }

  &::before {
    content: '';
    position: absolute;
    left: -${({ theme }) => theme.spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: ${({ $active }) => ($active ? '1.5rem' : '0')};
    border-radius: ${({ theme }) => theme.radius.full};
    background: ${({ theme }) => theme.color.primary};
    transition: height 0.18s ease;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[2]};
  border-top: 1px solid ${({ theme }) => theme.color.border};
  padding-top: ${({ theme }) => theme.spacing[4]};
`;

const UserCard = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  padding: ${({ theme }) => theme.spacing[2]} ${({ theme }) => theme.spacing[3]};
  border-radius: ${({ theme }) => theme.radius.lg};
  transition: background 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.color.surface};
  }
`;

const UserMeta = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const UserName = styled.span`
  font-size: ${({ theme }) => theme.typography.size.sm};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.color.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.span`
  font-size: ${({ theme }) => theme.typography.size.xs};
  color: ${({ theme }) => theme.color.textTertiary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1]};
`;

const FooterButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding: ${({ theme }) => theme.spacing[2]};
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.color.textTertiary};
  font-size: ${({ theme }) => theme.typography.size.xs};
  font-weight: ${({ theme }) => theme.typography.weight.semibold};

  &:hover {
    background: ${({ theme }) => theme.color.surface};
    color: ${({ theme }) => theme.color.text};
  }
`;

export function SidebarNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useWebApp();

  if (isSidebarHidden(pathname)) return null;

  const handleLogout = async () => {
    await logoutCurrentAuthSession();
    // Al login y no a la landing: quien cierra sesión quiere volver a
    // entrar, y la landing lo obligaría a un paso extra.
    window.location.replace(withPublicBasePath('/login'));
  };

  return (
    <Aside aria-label="Navegación principal">
      <div>
        <Logo href="/discovery">
          <LogoImage alt="Tindog" />
          <LogoText>Tindog</LogoText>
        </Logo>

        <NavList>
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const active = pathname.startsWith(path);
            return (
              <NavLink key={path} $active={active} onClick={() => router.push(path)} aria-current={active ? 'page' : undefined}>
                <Icon size={20} strokeWidth={active ? 2.6 : 2} />
                {label}
              </NavLink>
            );
          })}
        </NavList>

        {/* Secciones de gestión: separadas de la navegación principal
            porque se visitan de a ratos, no en cada sesión. */}
        <NavList>
          {SECONDARY_NAV_ITEMS.map(({ path, label, Icon }) => {
            const active = pathname.startsWith(path);
            return (
              <NavLink key={path} $active={active} onClick={() => router.push(path)} aria-current={active ? 'page' : undefined}>
                <Icon size={20} strokeWidth={active ? 2.6 : 2} />
                {label}
              </NavLink>
            );
          })}
        </NavList>
      </div>

      <Footer>
        <UserCard href="/profile">
          <Avatar src={profile.avatar} name={profile.name} size="md" />
          <UserMeta>
            <UserName>{profile.name}</UserName>
            <UserEmail>{profile.email}</UserEmail>
          </UserMeta>
        </UserCard>
        <FooterActions>
          <FooterButton onClick={() => router.push('/settings')}>
            <Settings size={16} /> Ajustes
          </FooterButton>
          <FooterButton onClick={handleLogout}>
            <LogOut size={16} /> Salir
          </FooterButton>
        </FooterActions>
      </Footer>
    </Aside>
  );
}
