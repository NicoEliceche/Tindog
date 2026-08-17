// src/features/profile/screens/ProfileScreen.tsx
'use client';

import { logoutCurrentAuthSession } from '@core/data/services/authService';
import { useWebApp } from '@core/providers/WebAppProvider';
import { withPublicBasePath } from '@core/routing/publicPath';
import { Camera, ChevronRight, Edit3, Lock, LogOut, Mail, MapPin, Settings, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useRef, useState } from 'react';
import { WebContent, WebHeading, WebScreen } from '@shared/components/layout/WebScreen';
import { Modal } from '@shared/components/ui';
import {
  Layout, LeftColumn, RightColumn, Header, Owner, AvatarButton, OwnerName, Email, Verified, Stats,
  Section, Row, LogoutButton, ModalForm,
} from './ProfileScreenStyled';

export function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useWebApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 5_000_000) return;
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' && updateProfile({ avatar: reader.result });
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    await logoutCurrentAuthSession();
    // Al login y no a la landing: quien cierra sesión quiere volver a
    // entrar, y la landing lo obligaría a un paso extra.
    window.location.replace(withPublicBasePath('/login'));
  };

  const [editingZone, setEditingZone] = useState(false);
  const [zone, setZone] = useState(profile.zone);

  const handleSaveZone = () => {
    const clean = zone.trim();
    if (clean.length >= 3) updateProfile({ zone: clean });
    setEditingZone(false);
  };

  const handleSaveName = () => {
    if (name.trim().length >= 2) updateProfile({ name: name.trim() });
    setEditing(false);
  };

  return (
    <WebScreen>
      <WebContent>
        <Layout>
          <LeftColumn>
            <Header>
              <WebHeading>Perfil</WebHeading>
              <button className="settings" onClick={() => router.push('/settings')} aria-label="Configuración">
                <Settings />
              </button>
            </Header>

            <Owner>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
              <AvatarButton onClick={() => fileRef.current?.click()} aria-label="Cambiar foto">
                {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : profile.name.slice(0, 2).toUpperCase()}
                <i><Camera size={16} /></i>
              </AvatarButton>
              <OwnerName>{profile.name}</OwnerName>
              <Email>{profile.email}</Email>
              <Verified><ShieldCheck size={14} /> Cuenta Google verificada</Verified>
              <Stats>
                <div><b>2</b><span>Perros</span></div>
                <div><b>8</b><span>Conexiones</span></div>
                <div><b>4.9</b><span>Reputación</span></div>
              </Stats>
            </Owner>
          </LeftColumn>

          <RightColumn>
            <Section>Datos personales</Section>
            <Row onClick={() => { setName(profile.name); setEditing(true); }}>
              <User />
              <div><strong>Nombre visible</strong><small>{profile.name}</small></div>
              <Edit3 size={18} />
            </Row>
            <Row>
              <Mail />
              <div><strong>Email</strong><small>{profile.email} · administrado por Google</small></div>
              <Lock size={16} />
            </Row>
            <Row onClick={() => { setZone(profile.zone); setEditingZone(true); }}>
              <MapPin />
              <div><strong>Zona general</strong><small>{profile.zone} · nunca mostramos tu domicilio</small></div>
              <ChevronRight size={18} />
            </Row>

            <Section>Cuenta</Section>
            <Row onClick={() => router.push('/settings')}>
              <Settings />
              <div><strong>Privacidad y configuración</strong><small>Apariencia, avisos, descubrimiento y seguridad</small></div>
              <ChevronRight size={18} />
            </Row>
            <LogoutButton onClick={handleLogout}>
              <LogOut size={20} /> Cerrar sesión
            </LogoutButton>
          </RightColumn>
        </Layout>
      </WebContent>

      <Modal open={editingZone} onClose={() => setEditingZone(false)} title="Editar zona general">
        <ModalForm>
          <p>Es el área aproximada que ven otros usuarios. Nunca mostramos tu domicilio exacto.</p>
          <input
            value={zone}
            onChange={(event) => setZone(event.target.value)}
            placeholder="Barrio, ciudad"
            aria-label="Zona general"
          />
          <div className="actions">
            <button onClick={() => setEditingZone(false)}>Cancelar</button>
            <button className="save" onClick={handleSaveZone}>Guardar</button>
          </div>
        </ModalForm>
      </Modal>

      <Modal open={editing} onClose={() => setEditing(false)} title="Editar nombre visible">
        <ModalForm>
          <input value={name} onChange={(event) => setName(event.target.value)} maxLength={60} autoFocus />
          <div className="actions">
            <button onClick={() => setEditing(false)}>Cancelar</button>
            <button className="save" onClick={handleSaveName}>Guardar</button>
          </div>
        </ModalForm>
      </Modal>
    </WebScreen>
  );
}
