'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { withPublicBasePath } from '@core/routing/publicPath';
import { Bookmark, Check, MessageCircle, RotateCcw, X } from 'lucide-react';
import { AnimatePresence, type PanInfo, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { useState } from 'react';
import {
  Page, Shell, Header, Brand, BrandCopy, Logo, Avatar, DesktopLayout, SidePanel, SidePanelTitle,
  NextPreviewCard, StatsCard, CenterColumn, CardStack, BackdropCard, PetCard, PetImage, PetBody,
  SwipeLabel, Actions, Action, Empty, Backdrop, Modal,
} from './DiscoveryScreenStyled';

const SWIPE_THRESHOLD = 120;
const SWIPE_VELOCITY_POWER = 8000;

export function DiscoveryScreen() {
  const { profile, discoveryPets, dismissPet, resetDiscovery, sendRequest } = useWebApp();
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const reduceMotion = useReducedMotion();

  const pet = discoveryPets[0];
  const nextPet = discoveryPets[1];

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-18, 18]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);

  const handleConnect = () => {
    if (!pet) return;
    sendRequest(pet);
    x.set(0);
    dismissPet(pet.id);
    setNotice({ title: 'Solicitud enviada', body: `El tutor de ${pet.name} recibió tu solicitud. El chat se habilitará únicamente si la acepta.` });
  };

  const handlePass = () => {
    if (!pet) return;
    x.set(0);
    dismissPet(pet.id);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!pet) return;
    const power = info.offset.x * info.velocity.x;
    const swipedRight = info.offset.x > SWIPE_THRESHOLD || power > SWIPE_VELOCITY_POWER;
    const swipedLeft = info.offset.x < -SWIPE_THRESHOLD || power < -SWIPE_VELOCITY_POWER;

    if (swipedRight) {
      setExitDirection('right');
      sendRequest(pet);
      dismissPet(pet.id);
      setNotice({ title: 'Solicitud enviada', body: `El tutor de ${pet.name} recibió tu solicitud. El chat se habilitará únicamente si la acepta.` });
      requestAnimationFrame(() => x.set(0));
    } else if (swipedLeft) {
      setExitDirection('left');
      dismissPet(pet.id);
      requestAnimationFrame(() => x.set(0));
    }
  };

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
                  <AnimatePresence>
                    <PetCard
                      key={pet.id}
                      style={{ x, rotate }}
                      drag={reduceMotion ? false : 'x'}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.7}
                      onDragEnd={handleDragEnd}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{
                        x: exitDirection === 'right' ? 600 : exitDirection === 'left' ? -600 : 0,
                        opacity: 0,
                        transition: { duration: reduceMotion ? 0 : 0.35, ease: 'easeIn' },
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    >
                      <SwipeLabel $tone="like" style={{ opacity: likeOpacity }}>Conectar</SwipeLabel>
                      <SwipeLabel $tone="nope" style={{ opacity: nopeOpacity }}>Pasar</SwipeLabel>
                      <PetImage src={pet.photos[0]} alt={pet.name} draggable={false} />
                      <PetBody>
                        <div className="title-row">
                          <h2>{pet.name}</h2>
                          <strong>{pet.age}</strong>
                        </div>
                        <div className="meta">{pet.breed} · {pet.gender} · cerca de ti</div>
                        <p>{pet.bio}</p>
                      </PetBody>
                    </PetCard>
                  </AnimatePresence>
                </CardStack>
                <Actions>
                  <Action onClick={handlePass} aria-label="Pasar perfil"><i><X /></i>Pasar</Action>
                  <Action $primary onClick={handleConnect} aria-label="Enviar solicitud de conexión"><i><MessageCircle /></i>Conectar</Action>
                  <Action onClick={() => { handlePass(); setNotice({ title: 'Perfil guardado', body: `Podrás volver a ver a ${pet.name} desde favoritos.` }); }} aria-label="Guardar perfil"><i><Bookmark /></i>Guardar</Action>
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
