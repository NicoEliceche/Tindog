'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { withPublicBasePath } from '@core/routing/publicPath';
import { Bookmark, Check, MessageCircle, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import {
  Page, Shell, Header, Brand, Logo, Avatar, DesktopLayout, SidePanel, SidePanelTitle,
  NextPreviewCard, StatsCard, CenterColumn, PetCard, PetImage, PetBody, Actions, Action,
  Empty, Backdrop, Modal,
} from './DiscoveryScreenStyled';

export function DiscoveryScreen() {
  const { profile, discoveryPets, dismissPet, resetDiscovery, sendRequest } = useWebApp();
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const pet = discoveryPets[0];
  const nextPet = discoveryPets[1];

  const handleConnect = () => {
    if (!pet) return;
    sendRequest(pet);
    dismissPet(pet.id);
    setNotice({ title: 'Solicitud enviada', body: `El tutor de ${pet.name} recibió tu solicitud. El chat se habilitará únicamente si la acepta.` });
  };

  return (
    <Page>
      <Shell>
        <Header>
          <span />
          <Brand>
            <Logo src={withPublicBasePath('/assets/tindog_patita_logo.png')} alt="Tindog" />
            <span>TINDOG</span>
            <small>ENCONTRÁ SU PAREJA IDEAL</small>
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
                <PetCard>
                  <PetImage src={pet.photos[0]} alt={pet.name} />
                  <PetBody>
                    <div className="title-row">
                      <h2>{pet.name}</h2>
                      <strong>{pet.age}</strong>
                    </div>
                    <div className="meta">{pet.breed} · {pet.gender} · cerca de ti</div>
                    <p>{pet.bio}</p>
                  </PetBody>
                </PetCard>
                <Actions>
                  <Action onClick={() => dismissPet(pet.id)} aria-label="Pasar perfil"><i><X /></i>Pasar</Action>
                  <Action $primary onClick={handleConnect} aria-label="Enviar solicitud de conexión"><i><MessageCircle /></i>Conectar</Action>
                  <Action onClick={() => { dismissPet(pet.id); setNotice({ title: 'Perfil guardado', body: `Podrás volver a ver a ${pet.name} desde favoritos.` }); }} aria-label="Guardar perfil"><i><Bookmark /></i>Guardar</Action>
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
