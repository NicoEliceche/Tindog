'use client';

import { useRouter } from 'next/navigation';

import { useWebApp, type WebConnectionRequest } from '@core/providers/WebAppProvider';
import { Inbox, Send, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DEFAULT_FILTERS, FilterBar, monthLabel, withinRange, type FilterState,
} from '../components/FilterBar';
import { MonthHeading } from '../components/FilterBarStyled';
import {
  BackButton,
  Page, Shell, Header, Section, SectionTitle, List, Card, Thumb, Copy, Row, Action, IconAction, Empty,
} from './HubStyled';

const STATUS_LABEL: Record<WebConnectionRequest['status'], string> = {
  pending: 'Esperando respuesta',
  accepted: 'Aceptada',
  declined: 'Rechazada',
  cancelled: 'Cancelada',
};

/**
 * Solicitudes de conexión, entrantes y salientes.
 *
 * Antes esto vivía escondido dentro de la lista de chats, donde competía
 * con las conversaciones ya abiertas. Aceptar o rechazar a alguien es una
 * decisión distinta de conversar, así que tiene su propio lugar.
 */
export function RequestsScreen() {
  const router = useRouter();
  const { requests, respondRequest, cancelRequest } = useWebApp();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  /** Aplica búsqueda, ventana de fecha y orden, y agrupa por mes. */
  const grouped = useMemo(() => {
    const needle = filters.query.trim().toLowerCase();

    const build = (direction: WebConnectionRequest['direction']) => {
      const visible = requests
        .filter((item) => item.direction === direction)
        // Las canceladas dejan de ser accionables para el que las recibió.
        .filter((item) => !(direction === 'incoming' && item.status === 'cancelled'))
        .filter((item) => withinRange(new Date(item.createdAt), filters.range))
        .filter((item) => {
          if (!needle) return true;
          return `${item.ownerName} ${item.pet.name} ${item.pet.breed}`.toLowerCase().includes(needle);
        })
        .sort((a, b) => {
          const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return filters.order === 'recent' ? diff : -diff;
        });

      const byMonth = new Map<string, WebConnectionRequest[]>();
      for (const item of visible) {
        const key = monthLabel(new Date(item.createdAt));
        byMonth.set(key, [...(byMonth.get(key) ?? []), item]);
      }
      return Array.from(byMonth.entries());
    };

    return { incoming: build('incoming'), outgoing: build('outgoing') };
  }, [requests, filters]);

  const hayAlgo = requests.length > 0;

  return (
    <Page>
      <Shell>
        <Header>
          <BackButton onClick={() => router.back()}>← Volver</BackButton>
          <h1>Solicitudes</h1>
          <p>Acá decidís con quién se abre un chat. Nadie puede escribirte hasta que aceptes su solicitud.</p>
        </Header>

        <FilterBar value={filters} onChange={setFilters} placeholder="Buscar por persona, mascota o raza" />

        <Section>
          <SectionTitle>Recibidas</SectionTitle>
          {grouped.incoming.length > 0 ? grouped.incoming.map(([month, items]) => (
            <div key={month}>
              <MonthHeading>{month}</MonthHeading>
              <List>
                {items.map((request) => (
                  <Card key={request.id}>
                    <Thumb><img src={request.avatar} alt="" /></Thumb>
                    <Copy>
                      <strong>{request.ownerName}</strong>
                      {/* Con la fila ancha entra el contexto que hace falta
                          para decidir sin abrir el perfil. */}
                      <p>
                        {request.pet.name} · {request.pet.breed} · {request.pet.age} años
                        {request.pet.personality_traits?.length
                          ? ` · ${request.pet.personality_traits.slice(0, 3).join(', ')}`
                          : ''}
                      </p>
                    </Copy>
                    {request.status === 'pending' ? (
                      <Row>
                        <Action $variant="primary" onClick={() => respondRequest(request.id, true)}>Aceptar</Action>
                        <Action $variant="ghost" onClick={() => respondRequest(request.id, false)}>Ahora no</Action>
                      </Row>
                    ) : (
                      <Row><Action $variant="ghost" disabled>{STATUS_LABEL[request.status]}</Action></Row>
                    )}
                  </Card>
                ))}
              </List>
            </div>
          )) : (
            <Empty>
              <Inbox size={30} />
              <p>{hayAlgo ? 'Ninguna solicitud recibida coincide con la búsqueda.' : 'No tenés solicitudes pendientes.'}</p>
            </Empty>
          )}
        </Section>

        <Section>
          <SectionTitle>Enviadas</SectionTitle>
          {grouped.outgoing.length > 0 ? grouped.outgoing.map(([month, items]) => (
            <div key={month}>
              <MonthHeading>{month}</MonthHeading>
              <List>
                {items.map((request) => (
                  <Card key={request.id}>
                    <Thumb><img src={request.avatar} alt="" /></Thumb>
                    <Copy>
                      <strong>{request.pet.name}</strong>
                      <p>
                        {request.pet.breed} · {STATUS_LABEL[request.status]} ·{' '}
                        {new Date(request.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </p>
                    </Copy>
                    {request.status === 'pending' ? (
                      <Row>
                        <IconAction
                          onClick={() => cancelRequest(request.id)}
                          aria-label={`Cancelar la solicitud enviada a ${request.pet.name}`}
                          title="Cancelar solicitud"
                        >
                          <X size={16} />
                        </IconAction>
                      </Row>
                    ) : null}
                  </Card>
                ))}
              </List>
            </div>
          )) : (
            <Empty>
              <Send size={30} />
              <p>{hayAlgo ? 'Ninguna solicitud enviada coincide con la búsqueda.' : 'Todavía no enviaste ninguna solicitud.'}</p>
            </Empty>
          )}
        </Section>
      </Shell>
    </Page>
  );
}
