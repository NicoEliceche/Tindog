'use client';

import { useRouter } from 'next/navigation';

import { useWebApp } from '@core/providers/WebAppProvider';
import { ShieldCheck, UserX } from 'lucide-react';
import { useState } from 'react';
import {
  BackButton,
  Page, Shell, Header, Section, SectionTitle, Grid, Card, Thumb, Copy, Row, Action, Empty, Notice,
} from './HubStyled';

/**
 * Centro de seguridad.
 *
 * Tindog coordina encuentros presenciales entre personas que no se conocen,
 * así que necesita un lugar único donde bloquear a alguien, revisar a quién
 * bloqueaste y tener a mano las pautas del encuentro. Antes esas acciones
 * no existían en la interfaz.
 */
export function SafetyScreen() {
  const router = useRouter();
  const { conversations, blockedOwners, blockOwner, unblockOwner } = useWebApp();
  const [justBlocked, setJustBlocked] = useState('');

  // Se puede bloquear a cualquiera con quien haya una conversación abierta.
  const blockable = conversations
    .map((chat) => ({ name: chat.ownerName, avatar: chat.avatar }))
    .filter((item) => !blockedOwners.includes(item.name));

  return (
    <Page>
      <Shell>
        <Header>
          <BackButton onClick={() => router.back()}>← Volver</BackButton>
          <h1>Seguridad</h1>
          <p>Controlá con quién podés cruzarte y repasá las pautas antes de cada encuentro.</p>
        </Header>

        <Notice>
          <h3>Antes de un encuentro</h3>
          <ul>
            <li>Elegí siempre un lugar público y concurrido; la app sugiere puntos seguros al agendar.</li>
            <li>Contale a alguien de confianza dónde vas a estar y a qué hora.</li>
            <li>Llevá la libreta sanitaria de tu perro y pedí ver la del otro.</li>
            <li>Si algo te incomoda, cortá el encuentro. No hace falta dar explicaciones.</li>
            <li>Mantené la conversación dentro de la app hasta que haya confianza.</li>
          </ul>
        </Notice>

        <Section>
          <SectionTitle>Bloqueados</SectionTitle>
          {blockedOwners.length > 0 ? (
            <Grid>
              {blockedOwners.map((name) => (
                <Card key={name}>
                  <Thumb><UserX size={20} /></Thumb>
                  <Copy>
                    <strong>{name}</strong>
                    <p>No puede verte ni escribirte.</p>
                  </Copy>
                  <Row>
                    <Action $variant="ghost" onClick={() => unblockOwner(name)}>Desbloquear</Action>
                  </Row>
                </Card>
              ))}
            </Grid>
          ) : (
            <Empty>
              <ShieldCheck size={30} />
              <p>No bloqueaste a nadie.</p>
            </Empty>
          )}
        </Section>

        <Section>
          <SectionTitle>Tus conversaciones</SectionTitle>
          {blockable.length > 0 ? (
            <Grid>
              {blockable.map((item) => (
                <Card key={item.name}>
                  <Thumb><img src={item.avatar} alt="" /></Thumb>
                  <Copy>
                    <strong>{item.name}</strong>
                    <p>{justBlocked === item.name ? 'Bloqueado' : 'Podés bloquearlo cuando quieras.'}</p>
                  </Copy>
                  <Row>
                    <Action
                      $variant="danger"
                      onClick={() => { blockOwner(item.name); setJustBlocked(item.name); }}
                    >
                      Bloquear
                    </Action>
                  </Row>
                </Card>
              ))}
            </Grid>
          ) : (
            <Empty>
              <ShieldCheck size={30} />
              <p>No tenés conversaciones abiertas.</p>
            </Empty>
          )}
        </Section>
      </Shell>
    </Page>
  );
}
