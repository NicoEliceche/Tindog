'use client';

import { effectiveStatus, type WebAppointmentStatus, useWebApp } from '@core/providers/WebAppProvider';
import { CalendarDays, Check, Clock, MapPin, Star, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { WebContent, WebHeading, WebScreen, WebSubtitle } from '@shared/components/layout/WebScreen';
import { Modal, useToast } from '@shared/components/ui';
import { Actions, Card, CardTop, ConfirmBody, Details, Empty, Grid, Pill, ReviewBody, Segment, Stars } from './AppointmentListScreenStyled';

const labels: Record<WebAppointmentStatus, string> = { scheduled: 'Agendada', in_progress: 'En progreso', completed: 'Finalizada', cancelled: 'Cancelada' };

export function AppointmentListScreen() {
  const router = useRouter();
  const { appointments, setAppointmentStatus, addReview } = useWebApp();
  const toast = useToast();
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  // Cancelar es irreversible, asi que se confirma antes. Antes bastaba un
  // clic para deshacer una cita ya coordinada con otra persona.
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  // Resena de un encuentro terminado. Antes este boton abria el mapa, lo
  // mismo que "Ver punto": dos botones distintos con el mismo efecto.
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const closeReview = () => { setReviewing(null); setRating(5); setComment(''); };

  const submitReview = () => {
    const appointment = appointments.find((item) => item.id === reviewing);
    if (appointment) {
      addReview(appointment.location.id, rating, comment.trim());
      toast({ title: 'Gracias por tu reseña.', tone: 'success' });
    }
    closeReview();
  };
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
                  {status === 'scheduled' ? <button className="danger" onClick={() => setPendingCancel(item.id)}>Cancelar</button> : null}
                  {status === 'in_progress' ? <button className="primary" onClick={() => setAppointmentStatus(item.id, 'completed')}>Finalizar</button> : null}
                  {status === 'completed' && !item.reviewSubmitted ? <button className="primary" onClick={() => setReviewing(item.id)}>Dejar reseña</button> : null}
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

      <Modal open={!!reviewing} onClose={closeReview} title="Dejar reseña">
        <ReviewBody>
          <p>Contá cómo fue el encuentro. Tu reseña ayuda a otros tutores a elegir el punto.</p>

          <Stars role="radiogroup" aria-label="Puntaje">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`}
                className={value <= rating ? 'on' : ''}
                onClick={() => setRating(value)}
              >
                <Star size={26} />
              </button>
            ))}
          </Stars>

          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="¿Cómo estuvo el lugar? ¿Lo recomendarías?"
            aria-label="Comentario"
            maxLength={400}
          />

          <div className="actions">
            <button onClick={closeReview}>Cancelar</button>
            <button className="primary" onClick={submitReview}>Confirmar</button>
          </div>
        </ReviewBody>
      </Modal>

      <Modal open={!!pendingCancel} onClose={() => setPendingCancel(null)} title="Cancelar cita">
        <ConfirmBody>
          <p>La cita quedará visible en el historial como cancelada.</p>
          <div className="actions">
            <button onClick={() => setPendingCancel(null)}>Volver</button>
            <button
              className="danger"
              onClick={() => {
                const cita = appointments.find((item) => item.id === pendingCancel);
                if (pendingCancel) setAppointmentStatus(pendingCancel, 'cancelled');
                if (cita) toast({ title: `Cita con ${cita.ownerName} cancelada.`, tone: 'error' });
                setPendingCancel(null);
              }}
            >
              Cancelar cita
            </button>
          </div>
        </ConfirmBody>
      </Modal>
    </WebScreen>
  );
}
