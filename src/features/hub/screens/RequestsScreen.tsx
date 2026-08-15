'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { Inbox, Send } from 'lucide-react';
import {
  Page, Shell, Header, Section, SectionTitle, Grid, Card, Thumb, Copy, Row, Action, Empty,
} from './HubStyled';

/**
 * Solicitudes de conexión, entrantes y salientes.
 *
 * Antes esto vivía escondido dentro de la lista de chats, donde competía
 * con las conversaciones ya abiertas. Aceptar o rechazar a alguien es una
 * decisión distinta de conversar, así que tiene su propio lugar.
 */
export function RequestsScreen() {
  const { requests, respondRequest } = useWebApp();

  const incoming = requests.filter((item) => item.direction === 'incoming');
  const outgoing = requests.filter((item) => item.direction === 'outgoing');

  const statusLabel = (status: string) =>
    status === 'pending' ? 'Esperando respuesta' : status === 'accepted' ? 'Aceptada' : 'Rechazada';

  return (
    <Page>
      <Shell>
        <Header>
          <h1>Solicitudes</h1>
          <p>Acá decidís con quién se abre un chat. Nadie puede escribirte hasta que aceptes su solicitud.</p>
        </Header>

        <Section>
          <SectionTitle>Recibidas</SectionTitle>
          {incoming.length > 0 ? (
            <Grid>
              {incoming.map((request) => (
                <Card key={request.id}>
                  <Thumb><img src={request.avatar} alt="" /></Thumb>
                  <Copy>
                    <strong>{request.ownerName}</strong>
                    <p>{request.pet.name} · {request.pet.breed}</p>
                  </Copy>
                  {request.status === 'pending' ? (
                    <Row>
                      <Action $variant="primary" onClick={() => respondRequest(request.id, true)}>Aceptar</Action>
                      <Action $variant="ghost" onClick={() => respondRequest(request.id, false)}>Ahora no</Action>
                    </Row>
                  ) : (
                    <Row><Action $variant="ghost" disabled>{statusLabel(request.status)}</Action></Row>
                  )}
                </Card>
              ))}
            </Grid>
          ) : (
            <Empty>
              <Inbox size={30} />
              <p>No tenés solicitudes pendientes.</p>
            </Empty>
          )}
        </Section>

        <Section>
          <SectionTitle>Enviadas</SectionTitle>
          {outgoing.length > 0 ? (
            <Grid>
              {outgoing.map((request) => (
                <Card key={request.id}>
                  <Thumb><img src={request.avatar} alt="" /></Thumb>
                  <Copy>
                    <strong>{request.pet.name}</strong>
                    <p>{statusLabel(request.status)}</p>
                  </Copy>
                </Card>
              ))}
            </Grid>
          ) : (
            <Empty>
              <Send size={30} />
              <p>Todavía no enviaste ninguna solicitud.</p>
            </Empty>
          )}
        </Section>
      </Shell>
    </Page>
  );
}
