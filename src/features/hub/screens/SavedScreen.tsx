'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { BookmarkX } from 'lucide-react';
import { useState } from 'react';
import {
  Page, Shell, Header, Section, Grid, Card, Thumb, Copy, Row, Action, Empty,
} from './HubStyled';

/**
 * Perfiles guardados desde Discovery.
 *
 * El botón "Guardar" existía en Discovery desde antes y prometía que se
 * podría "volver a ver desde favoritos", pero descartaba la mascota sin
 * guardarla en ningún lado. Esta pantalla es el destino que faltaba.
 */
export function SavedScreen() {
  const { savedPets, unsavePet, sendRequest, restorePet } = useWebApp();
  const [sent, setSent] = useState<string[]>([]);

  const connect = (id: string) => {
    const pet = savedPets.find((item) => item.id === id);
    if (!pet) return;
    sendRequest(pet);
    setSent((current) => [...current, id]);
  };

  return (
    <Page>
      <Shell>
        <Header>
          <h1>Guardados</h1>
          <p>Los perfiles que apartaste para decidir con calma. Podés enviarles una solicitud o devolverlos al mazo.</p>
        </Header>

        <Section>
          {savedPets.length > 0 ? (
            <Grid>
              {savedPets.map((pet) => (
                <Card key={pet.id}>
                  <Thumb><img src={pet.photos[0]} alt={pet.name} /></Thumb>
                  <Copy>
                    <strong>{pet.name} · {pet.age}</strong>
                    <p>{pet.breed}</p>
                  </Copy>
                  <Row>
                    <Action
                      $variant="primary"
                      onClick={() => connect(pet.id)}
                      disabled={sent.includes(pet.id)}
                    >
                      {sent.includes(pet.id) ? 'Enviada' : 'Conectar'}
                    </Action>
                    <Action
                      $variant="ghost"
                      onClick={() => { restorePet(pet); unsavePet(pet.id); }}
                      title="Devolver al mazo de Discovery"
                    >
                      Al mazo
                    </Action>
                  </Row>
                </Card>
              ))}
            </Grid>
          ) : (
            <Empty>
              <BookmarkX size={30} />
              <p>Todavía no guardaste ningún perfil. Usá el botón Guardar en Discovery.</p>
            </Empty>
          )}
        </Section>
      </Shell>
    </Page>
  );
}
