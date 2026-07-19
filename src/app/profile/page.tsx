// src/app/profile/page.tsx
'use client';

import React from 'react';
import styled from 'styled-components';
import { Settings, LogOut, ChevronRight, Bell, Shield } from 'lucide-react';
import { withPublicBasePath } from '@core/routing/publicPath';

const ProfileWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing[8]} ${({ theme }) => theme.layout.screenPaddingH};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[8]};
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.primaryFaded};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const Name = styled.h2`
  font-size: ${({ theme }) => theme.typography.size['2xl']};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: ${({ theme }) => theme.radius.xl};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.color.border};
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing[4]};
  gap: ${({ theme }) => theme.spacing[4]};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  span {
    flex: 1;
    font-weight: 500;
  }
`;

export default function ProfilePage() {
  return (
    <ProfileWrapper>
      <ProfileHeader>
        <Avatar>👨‍💻</Avatar>
        <div style={{ textAlign: 'center' }}>
          <Name>Nico Eliceche</Name>
          <p style={{ color: '#636E72', fontSize: '0.9rem' }}>hola@tindog.com</p>
        </div>
      </ProfileHeader>

      <MenuList>
        <MenuItem>
          <Bell size={20} color="#FF6B6B" />
          <span>Notificaciones</span>
          <ChevronRight size={18} color="#D1D5DB" />
        </MenuItem>
        <MenuItem>
          <Shield size={20} color="#FF6B6B" />
          <span>Seguridad</span>
          <ChevronRight size={18} color="#D1D5DB" />
        </MenuItem>
        <MenuItem>
          <Settings size={20} color="#FF6B6B" />
          <span>Configuración</span>
          <ChevronRight size={18} color="#D1D5DB" />
        </MenuItem>
        <MenuItem onClick={() => window.location.replace(withPublicBasePath('/'))}>
          <LogOut size={20} color="#FF4D4D" />
          <span style={{ color: '#FF4D4D' }}>Cerrar Sesión</span>
        </MenuItem>
      </MenuList>
    </ProfileWrapper>
  );
}
