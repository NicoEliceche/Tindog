'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { withPublicBasePath } from '@core/routing/publicPath';
import { Bookmark, Check, MessageCircle, RotateCcw, Undo2, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { Pet } from '@core/types/pet.types';
import { SwipeCard, type SwipeDirection } from '../components/SwipeCard';
import {
  Page, Shell, Header, Brand, BrandCopy, Logo, Avatar, DesktopLayout, SidePanel, SidePanelTitle,
  NextPreviewCard, StatsCard, CenterColumn, CardStack, BackdropCard, UndoButton, Actions, Action,
  Empty, Backdrop, Modal,
} from './DiscoveryScreenStyled';

export function DiscoveryScreen() {
  const { profile, discoveryPets, dismissPet, resetDiscovery, restorePet, sendRequest } = useWebApp();
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [lastDismissed, setLastDismissed] = useState<Pet | null>(null);
  // Progreso del arrastre (-1..1): alimenta la animación de la carta de atrás.
  const [dragProgress, setDragProgress] = useState(0);

  const pet = discoveryPets[0];
  const nextPet = discoveryPets[1];

  const connect = useCallback((target: Pet) => {
    sendRequest(target);
    dismissPet(target.id);
    setLastDismissed(target);
    setNotice({
      title: 'Solicitud enviada',
      body: `El tutor de ${target.name} recibió tu solicitud. El chat se habilitará únicamente si la acepta.`,
    });
  }, [dismissPet, sendRequest]);

  const pass = useCallback((target: Pet) => {
    dismissPet(target.id);
    setLastDismissed(target);
  }, [dismissPet]);

  const handleSwipe = useCallback((direction: SwipeDirection, target: Pet) => {
    setDragProgress(0);
    if (direction === 'right') connect(target);
    else pass(target);
  }, [connect, pass]);

  const undo = useCallback(() => {
    if (!lastDismissed) return;
    restorePet(lastDismissed);
    setLastDismissed(null);
  }, [lastDismissed, restorePet]);

  // La carta de atrás se acerca a medida que la de adelante se aleja.
  const stackProgress = Math.min(1, Math.abs(dragProgress));

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
                  {nextPet ? (
                    <BackdropCard
                      // Se acerca y se aclara conforme la carta de adelante
                      // se va: es lo que da la sensación de pila real.
                      animate={{
                        scale: 0.94 + stackProgress * 0.06,
                        y: 10 - stackProgress * 10,
                        opacity: 0.6 + stackProgress * 0.4,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                      <img src={nextPet.photos[0]} alt="" />
                    </BackdropCard>
                  ) : null}
                  <SwipeCard
                    key={pet.id}
                    pet={pet}
                    onSwipe={handleSwipe}
                    onDragProgress={setDragProgress}
                  />
                </CardStack>
                <Actions>
                  <Action onClick={() => pass(pet)} aria-label="Pasar perfil"><i><X /></i>Pasar</Action>
                  <Action $primary onClick={() => connect(pet)} aria-label="Enviar solicitud de conexión"><i><MessageCircle /></i>Conectar</Action>
                  <Action onClick={() => { pass(pet); setNotice({ title: 'Perfil guardado', body: `Podrás volver a ver a ${pet.name} desde favoritos.` }); }} aria-label="Guardar perfil"><i><Bookmark /></i>Guardar</Action>
                </Actions>
                <UndoButton onClick={undo} disabled={!lastDismissed} aria-label="Deshacer el último swipe">
                  <Undo2 size={14} /> Deshacer
                </UndoButton>
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
