'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { withPublicBasePath } from '@core/routing/publicPath';
import { Bookmark, Check, MessageCircle, RotateCcw, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { Pet } from '@core/types/pet.types';
import { SwipeCard, type SwipeDirection } from '../components/SwipeCard';
import {
  Page, Shell, Header, Brand, BrandCopy, Logo, Avatar, DesktopLayout, SidePanel, SidePanelTitle,
  NextPreviewCard, StatsCard, CenterColumn, CardStack, BackdropCard, Actions, Action,
  Empty, Backdrop, Modal,
} from './DiscoveryScreenStyled';

export function DiscoveryScreen() {
  const { profile, discoveryPets, dismissPet, resetDiscovery, sendRequest } = useWebApp();
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);

  const pet = discoveryPets[0];
  const nextPet = discoveryPets[1];

  const connect = useCallback((target: Pet) => {
    sendRequest(target);
    dismissPet(target.id);
    setNotice({
      title: 'Solicitud enviada',
      body: `El tutor de ${target.name} recibió tu solicitud. El chat se habilitará únicamente si la acepta.`,
    });
  }, [dismissPet, sendRequest]);

  const pass = useCallback((target: Pet) => {
    dismissPet(target.id);
  }, [dismissPet]);

  const handleSwipe = useCallback((direction: SwipeDirection, target: Pet) => {
    if (direction === 'right') connect(target);
    else pass(target);
  }, [connect, pass]);

  return (
    <Page>
      <Shell>
        <Header>
          <span />
          <Brand>
            <Logo src={withPublicBasePath('/assets/tindog_patita_logo.png')} alt="Tindog" />
            <BrandCopy>
              <span>TINDOG</span>
              <small>ENCONTRÁ SU PAREJA IDEAL</small>
            </BrandCopy>
          </Brand>
          <Avatar>{profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : profile.name[0]}</Avatar>
        </Header>

        <DesktopLayout>
          <SidePanel>
            <SidePanelTitle>Tu actividad</SidePanelTitle>
            <StatsCard>
              <b>{discoveryPets.length}</b>
              <span>Perfiles por descubrir</span>
            </StatsCard>
          </SidePanel>

          <CenterColumn>
            {pet ? (
              <>
                <CardStack>
                  {nextPet ? <BackdropCard /> : null}
                  <SwipeCard key={pet.id} pet={pet} onSwipe={handleSwipe} />
                </CardStack>
                <Actions>
                  <Action onClick={() => pass(pet)} aria-label="Pasar perfil"><i><X /></i>Pasar</Action>
                  <Action $primary onClick={() => connect(pet)} aria-label="Enviar solicitud de conexión"><i><MessageCircle /></i>Conectar</Action>
                  <Action onClick={() => { pass(pet); setNotice({ title: 'Perfil guardado', body: `Podrás volver a ver a ${pet.name} desde favoritos.` }); }} aria-label="Guardar perfil"><i><Bookmark /></i>Guardar</Action>
                </Actions>
              </>
            ) : (
              <Empty>
                <div>
                  <Check size={46} />
                  <h2>Ya viste todos los perfiles</h2>
                  <p>Volvé más tarde o ajustá tus filtros.</p>
                  <button onClick={resetDiscovery}><RotateCcw size={16} /> Recargar perfiles</button>
                </div>
              </Empty>
            )}
          </CenterColumn>

          <SidePanel>
            <SidePanelTitle>A continuación</SidePanelTitle>
            {nextPet ? (
              <NextPreviewCard>
                <img src={nextPet.photos[0]} alt={nextPet.name} />
                <div className="copy">
                  <h4>{nextPet.name} · {nextPet.age}</h4>
                  <p>{nextPet.breed}</p>
                </div>
              </NextPreviewCard>
            ) : null}
          </SidePanel>
        </DesktopLayout>

        {notice ? (
          <Backdrop role="dialog" aria-modal="true">
            <Modal>
              <h2>{notice.title}</h2>
              <p>{notice.body}</p>
              <button onClick={() => setNotice(null)}>Entendido</button>
            </Modal>
          </Backdrop>
        ) : null}
      </Shell>
    </Page>
  );
}
