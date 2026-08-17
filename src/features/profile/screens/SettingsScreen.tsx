// src/features/profile/screens/SettingsScreen.tsx
'use client';

import { requestAccountDeletion, type AccountDeletionResult } from '@core/data/services/authService';
import { type WebThemeMode, useWebApp } from '@core/providers/WebAppProvider';
import { Ban, Bell, CalendarDays, CheckCheck, ChevronRight, Download, Heart, MapPin, Megaphone, MessageCircle, Moon, PawPrint, Radio, ShieldCheck, Smartphone, Stethoscope, Sun, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { WebContent, WebHeading, WebScreen, WebSubtitle } from '@shared/components/layout/WebScreen';
import { Toggle as ToggleControl, useToast } from '@shared/components/ui';
import {
  BackButton, Layout, SectionNav, SectionNavLink, Content, Group, Row, Appearance, Distance, Action,
  ConfirmBackdrop, ConfirmDialog, ConfirmActions, ConfirmError, Shell,
} from './SettingsScreenStyled';

const SECTIONS = [
  { id: 'appearance', label: 'Apariencia' },
  { id: 'discovery', label: 'Descubrimiento' },
  { id: 'privacy', label: 'Privacidad' },
  { id: 'notifications', label: 'Notificaciones' },
  { id: 'safety', label: 'Seguridad de citas' },
  { id: 'data', label: 'Tus datos' },
];

export function SettingsScreen() {
  const toast = useToast();
  // Borrado de cuenta. Las tiendas exigen que se pueda hacer desde la app,
  // y pedir que se escriba la palabra evita el toque accidental en algo
  // que no tiene vuelta atrás.
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteScheduled, setDeleteScheduled] = useState<AccountDeletionResult | null>(null);

  const closeConfirm = () => {
    setConfirmingDelete(false);
    setConfirmText('');
    setDeleteError('');
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      setDeleteScheduled(await requestAccountDeletion());
      setConfirmingDelete(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'No pudimos programar la eliminación.');
    } finally {
      setDeleting(false);
    }
  };

  const router = useRouter();
  const { preferences, updatePreference } = useWebApp();
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const push = async (key: 'pushMessages' | 'pushRequests' | 'pushAppointments', value: boolean) => {
    if (!value) return updatePreference(key, false);
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') updatePreference(key, true);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );

    Object.values(sectionRefs.current).forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <WebScreen>
      <WebContent>
        <Shell>
        <div>
          <BackButton onClick={() => router.back()}>← Volver</BackButton>
          <WebHeading>Configuración</WebHeading>
          <WebSubtitle>Controlá qué mostrás, cuándo recibís avisos y cómo protegés tus encuentros.</WebSubtitle>
        </div>

        <Layout>
          <SectionNav aria-label="Secciones de configuración">
            {SECTIONS.map((section) => (
              <SectionNavLink
                key={section.id}
                href={`#${section.id}`}
                $active={activeSection === section.id}
              >
                {section.label}
              </SectionNavLink>
            ))}
          </SectionNav>

          <Content>
            <Group id="appearance" ref={(el) => { sectionRefs.current.appearance = el; }}>
              <h2>Apariencia</h2>
              <div className="box">
                <Appearance>
                  {(['dark', 'light', 'system'] as WebThemeMode[]).map((mode) => {
                    const Icon = mode === 'dark' ? Moon : mode === 'light' ? Sun : Smartphone;
                    return (
                      <button key={mode} className={preferences.themeMode === mode ? 'active' : ''} onClick={() => updatePreference('themeMode', mode)}>
                        <Icon size={18} />
                        {mode === 'dark' ? 'Oscuro' : mode === 'light' ? 'Claro' : 'Sistema'}
                      </button>
                    );
                  })}
                </Appearance>
              </div>
            </Group>

            <Group id="discovery" ref={(el) => { sectionRefs.current.discovery = el; }}>
              <h2>Descubrimiento</h2>
              <div className="box">
                <SettingRow icon={PawPrint} title="Mostrar mi perfil" detail="Al pausarlo conservás chats y citas" value={preferences.discoveryEnabled} onChange={(value) => updatePreference('discoveryEnabled', value)} />
                <SettingRow icon={MapPin} title="Mostrar distancia aproximada" detail="Nunca mostramos tu ubicación exacta" value={preferences.showDistance} onChange={(value) => updatePreference('showDistance', value)} />
                <Distance>
                  <strong>Distancia máxima</strong>
                  <div className="chips">
                    {[10, 25, 50].map((km) => (
                      <button key={km} className={preferences.maxDistanceKm === km ? 'active' : ''} onClick={() => updatePreference('maxDistanceKm', km)}>{km} km</button>
                    ))}
                  </div>
                </Distance>
              </div>
            </Group>

            <Group id="privacy" ref={(el) => { sectionRefs.current.privacy = el; }}>
              <h2>Privacidad</h2>
              <div className="box">
                <SettingRow icon={Radio} title="Estado en línea" detail="Oculto de forma predeterminada" value={preferences.showOnlineStatus} onChange={(value) => updatePreference('showOnlineStatus', value)} />
                <SettingRow icon={CheckCheck} title="Confirmaciones de lectura" detail="También dejarás de ver las de otros" value={preferences.readReceipts} onChange={(value) => updatePreference('readReceipts', value)} />
                <Action onClick={() => updatePreference('healthVisibility', preferences.healthVisibility === 'connections' ? 'private' : 'connections')}>
                  <Stethoscope />
                  <div className="copy"><strong>Visibilidad de salud</strong><small>{preferences.healthVisibility === 'connections' ? 'Sólo conexiones aceptadas' : 'Sólo vos'}</small></div>
                  <ChevronRight />
                </Action>
                <Action onClick={() => toast({ title: 'Sin bloqueos', body: 'No tenés personas bloqueadas.' })}>
                  <Ban />
                  <div className="copy"><strong>Personas bloqueadas</strong><small>Revisá y administrá bloqueos</small></div>
                  <ChevronRight />
                </Action>
              </div>
            </Group>

            <Group id="notifications" ref={(el) => { sectionRefs.current.notifications = el; }}>
              <h2>Notificaciones</h2>
              <div className="box">
                <SettingRow icon={MessageCircle} title="Mensajes" detail="Chats aceptados" value={preferences.pushMessages} onChange={(value) => push('pushMessages', value)} />
                <SettingRow icon={Heart} title="Solicitudes" detail="Conexiones recibidas y aceptadas" value={preferences.pushRequests} onChange={(value) => push('pushRequests', value)} />
                <SettingRow icon={CalendarDays} title="Citas" detail="Recordatorios y cambios" value={preferences.pushAppointments} onChange={(value) => push('pushAppointments', value)} />
                <SettingRow icon={Megaphone} title="Mascotas perdidas" detail="Sólo alertas en tu zona general" value={preferences.lostPetAlerts} onChange={(value) => updatePreference('lostPetAlerts', value)} />
              </div>
            </Group>

            <Group id="safety" ref={(el) => { sectionRefs.current.safety = el; }}>
              <h2>Seguridad de citas</h2>
              <div className="box">
                <SettingRow icon={ShieldCheck} title="Check-in de seguridad" detail="Confirmamos inicio y finalización" value={preferences.safetyCheckIns} onChange={(value) => updatePreference('safetyCheckIns', value)} />
                <Action onClick={() => toast({ title: 'Contacto de confianza', body: 'La agenda se abrirá sólo con tu permiso.' })}>
                  <Users />
                  <div className="copy"><strong>Contacto de confianza</strong><small>Configurá a quién compartir una cita</small></div>
                  <ChevronRight />
                </Action>
              </div>
            </Group>

            <Group id="data" ref={(el) => { sectionRefs.current.data = el; }}>
              <h2>Tus datos</h2>
              <div className="box">
                <Action onClick={() => toast({ title: 'Solicitud registrada', body: 'Te avisaremos cuando la copia esté lista.', tone: 'success' })}>
                  <Download />
                  <div className="copy"><strong>Descargar mis datos</strong><small>Solicitá una copia portable</small></div>
                  <ChevronRight />
                </Action>
                <Action $danger onClick={() => setConfirmingDelete(true)}>
                  <Trash2 />
                  <div className="copy">
                    <strong>Eliminar cuenta</strong>
                    <small>
                      {deleteScheduled
                        ? `Programada para el ${new Date(deleteScheduled.scheduledAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`
                        : 'Incluye un período de recuperación'}
                    </small>
                  </div>
                  <ChevronRight />
                </Action>
              </div>
            </Group>
          </Content>
        </Layout>
        </Shell>

        {confirmingDelete ? (
          <ConfirmBackdrop role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <ConfirmDialog>
              <h2 id="delete-title">Eliminar tu cuenta</h2>
              <p>Esta acción no se puede deshacer una vez cumplido el plazo. Antes de continuar:</p>
              <ul>
                <li>Se eliminan tu perfil, tus mascotas, tus conversaciones y tus citas.</li>
                <li>Tenés un período de recuperación para arrepentirte: si volvés a entrar antes de que venza, la cuenta se restablece.</li>
                <li>Se cierran todas tus otras sesiones ahora mismo.</li>
                <li>Cierta información se conserva el tiempo que exige la ley, como los reportes de seguridad.</li>
              </ul>
              <p>Escribí <strong>ELIMINAR</strong> para confirmar.</p>
              <input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                placeholder="ELIMINAR"
                aria-label="Escribí ELIMINAR para confirmar"
                autoComplete="off"
              />
              {deleteError ? <ConfirmError>{deleteError}</ConfirmError> : null}
              <ConfirmActions>
                <button type="button" onClick={closeConfirm} disabled={deleting}>Cancelar</button>
                <button
                  type="button"
                  data-variant="danger"
                  onClick={confirmDelete}
                  disabled={confirmText.trim().toUpperCase() !== 'ELIMINAR' || deleting}
                >
                  {deleting ? 'Programando…' : 'Eliminar cuenta'}
                </button>
              </ConfirmActions>
            </ConfirmDialog>
          </ConfirmBackdrop>
        ) : null}
      </WebContent>
    </WebScreen>
  );
}

function SettingRow({ icon: Icon, title, detail, value, onChange }: { icon: typeof Bell; title: string; detail: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <Row>
      <Icon size={20} />
      <div className="copy"><strong>{title}</strong><small>{detail}</small></div>
      <ToggleControl checked={value} onChange={onChange} ariaLabel={`${title}: ${value ? 'activado' : 'desactivado'}`} />
    </Row>
  );
}
