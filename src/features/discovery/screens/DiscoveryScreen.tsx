'use client';

import { useWebApp } from '@core/providers/WebAppProvider';
import { useRouter } from 'next/navigation';
import { useMotionValue, useTransform } from 'framer-motion';
import { NotificationBell } from '@shared/components/notifications/NotificationBell';
import { MapPin, Bookmark, Loader2, MessageCircle, Undo2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Pet } from '@core/types/pet.types';
import { PetDetailSheet } from '../components/PetDetailSheet';
import { SwipeCard, type SwipeDirection } from '../components/SwipeCard';
import {
  Page, Shell, Header, Brand, BrandCopy, HeaderActions, Avatar, DesktopLayout, SidePanel, SidePanelTitle,
  NextPreviewCard, StatsCard, CenterColumn, CardStack, BackdropCard, UndoButton, Actions, Action,
  Empty, TapHint,
} from './DiscoveryScreenStyled';
import { useToast } from '@shared/components/ui';

export function DiscoveryScreen() {
  const router = useRouter();
  const { profile, discoveryPets, dismissPet, resetDiscovery, restorePet, sendRequest, savePet, blockedOwners, requests, cancelRequest, preferences } = useWebApp();
  const toast = useToast();

  const [lastDismissed, setLastDismissed] = useState<Pet | null>(null);
  /** Mascota abierta en la ficha completa. */
  const [detail, setDetail] = useState<Pet | null>(null);
  // Progreso del arrastre (-1..1) como MotionValue: alimenta la animación de
  // la carta de atrás sin provocar un render por frame. Con estado de React,
  // cada movimiento del puntero re-renderizaba la pantalla entera y el
  // arrastre se veía a los saltos.
  const dragProgress = useMotionValue(0);
  const stackScale = useTransform(dragProgress, (value) => 0.94 + Math.min(1, Math.abs(value)) * 0.06);
  const stackY = useTransform(dragProgress, (value) => 10 - Math.min(1, Math.abs(value)) * 10);
  const stackOpacity = useTransform(dragProgress, (value) => 0.6 + Math.min(1, Math.abs(value)) * 0.4);

  // Los tutores bloqueados no vuelven a aparecer en el mazo.
  /**
   * Lo que se muestra en la pila.
   *
   * Al bloqueo se suma el radio elegido en la configuración, que hasta ahora
   * se guardaba y no filtraba nada. Una mascota sin distancia conocida se
   * deja pasar: esconderla sería peor que mostrarla, porque el dato falta
   * del lado del servidor y no por estar lejos.
   */
  const visiblePets = discoveryPets.filter((item) => (
    !blockedOwners.includes(`Tutor de ${item.name}`)
    && (item.distanceKm === undefined || item.distanceKm <= preferences.maxDistanceKm)
  ));
  const pet = visiblePets[0];
  const nextPet = visiblePets[1];

  const connect = useCallback((target: Pet) => {
    sendRequest(target);
    dismissPet(target.id);
    setLastDismissed(target);
    toast({
      title: 'Solicitud enviada',
      body: `El tutor de ${target.name} recibió tu solicitud. El chat se habilitará únicamente si la acepta.`,
      tone: 'success',
    });
  }, [dismissPet, sendRequest, toast]);

  const pass = useCallback((target: Pet) => {
    dismissPet(target.id);
    setLastDismissed(target);
  }, [dismissPet]);

  const handleSwipe = useCallback((direction: SwipeDirection, target: Pet) => {
    dragProgress.set(0);
    if (direction === 'right') connect(target);
    else pass(target);
  }, [connect, dragProgress, pass]);

  /**
   * Deshacer el último descarte.
   *
   * Si la tarjeta se había ido con "Conectar", además se retira la solicitud
   * enviada: antes sólo volvía la tarjeta y la solicitud quedaba viva del
   * otro lado, así que deshacer no deshacía nada de lo que importaba.
   */
  const undo = useCallback(() => {
    if (!lastDismissed) return;
    const pendiente = requests.find((item) => (
      item.direction === 'outgoing' && item.status === 'pending' && item.pet.id === lastDismissed.id
    ));
    if (pendiente) {
      cancelRequest(pendiente.id);
      toast({ title: `Se retiró la solicitud a ${lastDismissed.name}.` });
    }
    restorePet(lastDismissed);
    setLastDismissed(null);
  }, [cancelRequest, lastDismissed, requests, restorePet, toast]);

  // Cuando se acaban los perfiles cargamos la siguiente tanda sola, como
  // haría la app contra el backend real. En dev el mock devuelve el mismo
  // set, así que el scroll es infinito y nunca queda una pantalla muerta.
  // El ref evita relanzar la carga mientras una ya está en curso.
  const loadingMore = useRef(false);
  useEffect(() => {
    if (discoveryPets.length > 0 || loadingMore.current) return;
    loadingMore.current = true;
    const timer = window.setTimeout(() => {
      resetDiscovery();
      setLastDismissed(null);
      loadingMore.current = false;
    }, 650);
    return () => window.clearTimeout(timer);
  }, [discoveryPets.length, resetDiscovery]);

  return (
    <Page>
      <Shell>
        <Header>
          <span />
          <Brand>
            <BrandCopy>
              <span>TINDOG</span>
              <small>ENCONTRÁ SU PAREJA IDEAL</small>
            </BrandCopy>
          </Brand>
          <HeaderActions>
            <NotificationBell />
            {/* La foto lleva al perfil, igual que el boton de la barra. */}
            <Avatar
              as="button"
              type="button"
              aria-label="Ir a tu perfil"
              onClick={() => router.push('/profile')}
            >
              {profile.avatar ? <img src={profile.avatar} alt={profile.name} /> : profile.name[0]}
            </Avatar>
          </HeaderActions>
        </Header>

        <DesktopLayout>
          <SidePanel>
            <SidePanelTitle>Tu actividad</SidePanelTitle>
            <StatsCard>
              <b>{visiblePets.length}</b>
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
                      style={{ scale: stackScale, y: stackY, opacity: stackOpacity }}
                    >
                      <img src={nextPet.photos[0]} alt="" />
                    </BackdropCard>
                  ) : null}
                  <SwipeCard
                    key={pet.id}
                    pet={pet}
                    onSwipe={handleSwipe}
                    dragProgress={dragProgress}
                    onTap={() => setDetail(pet)}
                  />
                </CardStack>
                <TapHint>Presiona una vez la tarjeta para ver más información</TapHint>
                <Actions>
                  <Action onClick={() => pass(pet)} aria-label="Pasar perfil"><i><X /></i>Pasar</Action>
                  <Action $primary onClick={() => connect(pet)} aria-label="Enviar solicitud de conexión"><i><MessageCircle /></i>Conectar</Action>
                  <Action onClick={() => { savePet(pet); pass(pet); toast({ title: 'Perfil guardado', body: `${pet.name} quedó en tus favoritos.`, tone: 'success' }); }} aria-label="Guardar perfil"><i><Bookmark /></i>Guardar</Action>
                </Actions>
                <UndoButton onClick={undo} disabled={!lastDismissed} aria-label="Deshacer el último swipe">
                  <Undo2 size={14} /> Deshacer
                </UndoButton>
              </>
            ) : (
              <Empty>
                {/* Si quedan perfiles pero el radio los deja a todos afuera,
                    esperar no sirve de nada: hay que decir que el filtro es
                    el que vacia la pila, y no quedarse girando. */}
                {discoveryPets.length > 0 ? (
                  <div>
                    <MapPin size={40} />
                    <h2>Nada dentro de {preferences.maxDistanceKm} km</h2>
                    <p>Ampliá la distancia máxima en Ajustes para ver más perros.</p>
                  </div>
                ) : (
                  <div>
                    <Loader2 size={40} className="spin" />
                    <h2>Buscando más perfiles</h2>
                    <p>Estamos trayendo perros compatibles cerca tuyo…</p>
                  </div>
                )}
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

        <PetDetailSheet pet={detail} onClose={() => setDetail(null)} />

      </Shell>
    </Page>
  );
}
