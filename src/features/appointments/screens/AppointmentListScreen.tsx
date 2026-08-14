'use client';

import { effectiveStatus, type WebAppointmentStatus, useWebApp } from '@core/providers/WebAppProvider';
import { CalendarDays, Check, Clock, MapPin, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { WebContent, WebHeading, WebScreen, WebSubtitle } from '@shared/components/layout/WebScreen';
import { Actions, Card, CardTop, Details, Empty, Grid, Pill, Segment } from './AppointmentListScreenStyled';

const labels: Record<WebAppointmentStatus, string> = { scheduled: 'Agendada', in_progress: 'En progreso', completed: 'Finalizada', cancelled: 'Cancelada' };

export function AppointmentListScreen() {
  const router = useRouter();
  const { appointments, setAppointmentStatus } = useWebApp();
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const visible = appointments.filter((item) => (tab === 'upcoming' ? ['scheduled', 'in_progress'].includes(effectiveStatus(item)) : ['completed', 'cancelled'].includes(item.status)));

  return (
    <WebScreen>
      <WebContent>
        <div>
          <WebHeading>Citas</WebHeading>
          <WebSubtitle>Encuentros agendados, en curso y anteriores.</WebSubtitle>
        </div>

        <Segment>
          <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Próximas</button>
          <button className={tab === 'history' ? 'active' : ''} onClick={() => setTab('history')}>Historial</button>
        </Segment>

        <Grid>
          {visible.map((item) => {
            const status = effectiveStatus(item);
            return (
              <Card key={item.id}>
                <CardTop>
                  <div className="icon">{status === 'cancelled' ? <X /> : status === 'completed' ? <Check /> : <CalendarDays />}</div>
                  <div className="copy">
                    <h2>{item.petNames.join(' + ')}</h2>
                    <p>{item.ownerName}</p>
                  </div>
                  <Pill $status={status}>{labels[status]}</Pill>
                </CardTop>
                <Details>
                  <div><Clock size={16} />{new Date(item.startAt).toLocaleString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  <div><MapPin size={16} />{item.location.name}</div>
                </Details>
                <Actions>
                  <button onClick={() => router.push(`/appointments/location?appointment=${item.id}`)}>Ver punto</button>
                  {status === 'scheduled' ? <button className="danger" onClick={() => setAppointmentStatus(item.id, 'cancelled')}>Cancelar</button> : null}
                  {status === 'in_progress' ? <button className="primary" onClick={() => setAppointmentStatus(item.id, 'completed')}>Finalizar</button> : null}
                  {status === 'completed' && !item.reviewSubmitted ? <button className="primary" onClick={() => router.push(`/appointments/location?appointment=${item.id}&review=1`)}>Dejar reseña</button> : null}
                </Actions>
              </Card>
            );
          })}

          {!visible.length ? (
            <Empty>
              <CalendarDays size={42} />
              <h2>No hay citas en esta sección</h2>
              <p>Las nuevas citas se coordinan desde una conversación aceptada.</p>
            </Empty>
          ) : null}
        </Grid>
      </WebContent>
    </WebScreen>
  );
}
