'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { ArrowLeft, CalendarClock, CheckCircle, LocateFixed, Map, MapPin, ShieldCheck, Star } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  Screen, Header, DesktopLayout, MapColumn, ContentColumn, MapBox, MapSelectionBadge, Content, DateSlots,
  LocationCard, ReviewArea, ReviewItem, Footer, DesktopFooter, ScheduledWhen,
} from './SafeLocationScreenStyled';
import { useToast } from '@shared/components/ui';

function slots() {
  const now = new Date();
  return [1, 2, 3].map((day, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() + day);
    date.setHours(index === 1 ? 11 : 18, 0, 0, 0);
    return date;
  });
}

export function SafeLocationScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { locations, appointments, scheduleAppointment, addReview } = useWebApp();
  const toast = useToast();
  const appointment = appointments.find((item) => item.id === params.get('appointment'));
  const chatId = params.get('chat');

  const dateSlots = useMemo(() => slots(), []);
  const [startAt, setStartAt] = useState(dateSlots[0].toISOString());
  const [selectedId, setSelectedId] = useState(appointment?.location.id ?? locations[0]?.id);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [located, setLocated] = useState(false);

  const selected = locations.find((item) => item.id === selectedId) ?? locations[0];

  /** Fecha de la cita ya agendada, partida para mostrarla en dos renglones. */
  const appointmentWhen = useMemo(() => {
    if (!appointment) return null;
    const when = new Date(appointment.startAt);
    return {
      date: when.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
      time: when.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
  }, [appointment]);
  const embedKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  const canReview = appointment?.status === 'completed' && appointment.checkedIn && !appointment.reviewSubmitted;

  const confirm = () => {
    if (!chatId || !selected) return;
    const created = scheduleAppointment(chatId, selected.id, startAt);
    if (!created) {
      toast({ title: 'No pudimos agendar', body: 'Probá de nuevo en un momento.', tone: 'error' });
      return;
    }
    toast({ title: 'Cita agendada', body: `${selected.name}, ${new Date(startAt).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}.`, tone: 'success' });
    router.push('/appointments');
  };

  const locate = () => navigator.geolocation?.getCurrentPosition(() => setLocated(true), () => setLocated(false), { maximumAge: 120000, timeout: 8000 });

  const publish = () => {
    if (!selected || !canReview || comment.trim().length < 10) return;
    addReview(selected.id, rating, comment.trim());
    setComment('');
    toast({ title: 'Gracias por tu reseña.', tone: 'success' });
  };

  return (
    <Screen>
      <Header>
        <button onClick={() => router.back()} aria-label="Volver"><ArrowLeft /></button>
        <h1>{chatId ? 'Agendar encuentro' : 'Punto de encuentro'}</h1>
      </Header>

      <DesktopLayout>
        <MapColumn>
          <MapBox>
            {embedKey && selected ? (
              <iframe
                key={selected.id}
                title={`Mapa de ${selected.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(embedKey)}&q=place_id:${encodeURIComponent(selected.googlePlaceId)}`}
              />
            ) : (
              <div className="fallback">
                <div key={selected?.id} className="fallback-pin">
                  <div className="fallback-pin-icon"><Map size={22} /></div>
                  {selected ? <span className="fallback-pin-label">{selected.name}</span> : null}
                </div>
              </div>
            )}

            {selected ? (
              <MapSelectionBadge>
                <div className="icon"><MapPin size={16} /></div>
                <div className="copy">
                  <strong>{selected.name}</strong>
                  <span>{selected.address} · {selected.distanceKm} km</span>
                </div>
              </MapSelectionBadge>
            ) : null}

            <button className="locate" onClick={locate} aria-label="Usar mi ubicación">
              <LocateFixed color={located ? '#78D69A' : undefined} />
            </button>
          </MapBox>

          {chatId ? (
            <DesktopFooter>
              <div className="copy">
                <small>PUNTO ELEGIDO</small>
                <strong>{selected?.name}</strong>
              </div>
              <button onClick={confirm}>Confirmar cita</button>
            </DesktopFooter>
          ) : null}
        </MapColumn>

        <ContentColumn>
          <Content>
            <h2>Fecha y hora</h2>
            {chatId ? (
              <DateSlots>
                {dateSlots.map((slot) => (
                  <button key={slot.toISOString()} className={startAt === slot.toISOString() ? 'active' : ''} onClick={() => setStartAt(slot.toISOString())}>
                    <strong>{slot.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric' })}</strong>
                    {slot.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </button>
                ))}
              </DateSlots>
            ) : (
              /* Mirando una cita ya agendada no hay nada que elegir: se
                 muestra la fecha que quedó, que hasta ahora había que ir a
                 buscar a la pantalla anterior. */
              <ScheduledWhen>
                <div className="icon"><CalendarClock size={18} /></div>
                <div className="copy">
                  <strong>{appointmentWhen?.date ?? 'Sin fecha'}</strong>
                  <span>{appointmentWhen?.time ?? ''}</span>
                </div>
              </ScheduledWhen>
            )}

            <div>
              <h2>Puntos públicos recomendados</h2>
              <p className="warning">La recomendación reduce riesgos, pero no garantiza seguridad.</p>
            </div>

            {locations.map((location) => (
              <LocationCard key={location.id} $selected={location.id === selectedId} onClick={() => setSelectedId(location.id)}>
                <div className="top">
                  <div className="icon"><MapPin size={19} /></div>
                  <div>
                    <h3>{location.name}</h3>
                    <p>{location.address} · {location.distanceKm} km</p>
                  </div>
                  <span className="rating">★ {location.rating}</span>
                </div>
                <div className="tags">
                  {location.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </LocationCard>
            ))}

            {/* Las reseñas del punto elegido valen igual al agendar: son
                justamente lo que ayuda a decidir entre un punto y otro, y
                antes sólo se veían cuando la cita ya estaba hecha. */}
            {selected ? (
              <>
                <h2>Experiencias verificadas</h2>
                {selected.reviews.length === 0 ? (
                  <p className="warning">Todavía no hay reseñas de este punto.</p>
                ) : null}
                {selected.reviews.map((review) => (
                  <ReviewItem key={review.id}>
                    <div className="top">
                      <h4>{review.authorName}</h4>
                      <span className="stars">{'★'.repeat(review.rating)}</span>
                    </div>
                    {review.verified ? <small><CheckCircle size={12} /> Asistencia verificada</small> : null}
                    <p>{review.comment}</p>
                  </ReviewItem>
                ))}

                {canReview ? (
                  <ReviewArea>
                    <h3>¿Cómo fue este punto?</h3>
                    <small>No incluyas datos personales de la otra persona.</small>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button key={value} onClick={() => setRating(value)} aria-label={`${value} estrellas`}>
                          <Star fill={value <= rating ? 'currentColor' : 'none'} color="#D4AF37" />
                        </button>
                      ))}
                    </div>
                    <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Iluminación, movimiento, acceso…" maxLength={500} />
                    <button className="submit" onClick={publish} disabled={comment.trim().length < 10}>Publicar reseña</button>
                  </ReviewArea>
                ) : appointment?.status === 'cancelled' ? (
                  <ReviewArea>
                    <ShieldCheck />
                    <h3>La cita fue cancelada</h3>
                    <small>Permanece en el historial. Las reseñas públicas se habilitan sólo con asistencia verificada.</small>
                  </ReviewArea>
                ) : null}
              </>
            ) : null}
          </Content>
        </ContentColumn>
      </DesktopLayout>

      {chatId ? (
        <Footer>
          <div className="copy">
            <small>PUNTO ELEGIDO</small>
            <strong>{selected?.name}</strong>
          </div>
          <button onClick={confirm}>Confirmar cita</button>
        </Footer>
      ) : null}
    </Screen>
  );
}
