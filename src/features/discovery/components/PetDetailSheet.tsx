'use client';

import type { Pet } from '@core/types/pet.types';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Award, CalendarClock, ChevronLeft, ChevronRight, Dna, FileCheck, Heart,
  MapPin, Ruler, ShieldCheck, Sparkles, Stethoscope, X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  Backdrop, Sheet, CloseButton, Gallery, GalleryTrack, GalleryNav, Dots, Dot,
  Summary, PetName, PetMeta, Chips, Chip, Bio, Divider, SectionLabel,
  OwnerRow, OwnerAvatar, OwnerCopy, Facts, Fact, FactIcon, FactCopy, Lineage,
} from './PetDetailSheetStyled';

/** Deriva la galería: si la mascota no trae `media`, usa sus fotos sueltas. */
function galleryOf(pet: Pet) {
  if (pet.media?.length) return pet.media;
  return pet.photos.map((url, index) => ({ id: `${pet.id}-${index}`, kind: 'photo' as const, url }));
}

interface PetDetailSheetProps {
  pet: Pet | null;
  onClose: () => void;
}

/**
 * Ficha completa de una mascota, a pantalla entera.
 *
 * La tarjeta de Inicio muestra lo justo para decidir un swipe; acá va todo
 * lo que alguien querría saber antes de escribir: la galería, quién está a
 * cargo y los datos del animal.
 */
export function PetDetailSheet({ pet, onClose }: PetDetailSheetProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  // Cada mascota abre su galería desde el principio.
  useEffect(() => { setIndex(0); }, [pet?.id]);

  // Escape cierra, como cualquier capa a pantalla completa.
  useEffect(() => {
    if (!pet) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pet, onClose]);

  const media = pet ? galleryOf(pet) : [];
  const go = useCallback((delta: number) => {
    setIndex((current) => (current + delta + media.length) % media.length);
  }, [media.length]);

  if (!pet) return null;

  const owner = pet.caregivers?.[0];
  const others = (pet.caregivers ?? []).slice(1);
  const health = pet.health_records ?? [];
  const competitions = pet.competitions ?? [];
  const current = media[index];

  return (
    <AnimatePresence>
      <Backdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha de ${pet.name}`}
      >
        <Sheet
          initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={(event) => event.stopPropagation()}
        >
          <CloseButton onClick={onClose} aria-label="Cerrar ficha"><X size={20} /></CloseButton>

          <Gallery>
            <GalleryTrack>
              {current?.kind === 'video' ? (
                <video src={current.url} poster={current.poster} controls playsInline preload="metadata" />
              ) : (
                <img src={current?.url} alt={`${pet.name}, foto ${index + 1}`} />
              )}
            </GalleryTrack>

            {media.length > 1 ? (
              <>
                <GalleryNav $side="left" onClick={() => go(-1)} aria-label="Foto anterior"><ChevronLeft size={20} /></GalleryNav>
                <GalleryNav $side="right" onClick={() => go(1)} aria-label="Foto siguiente"><ChevronRight size={20} /></GalleryNav>
                <Dots>
                  {media.map((item, dotIndex) => (
                    <Dot
                      key={item.id}
                      $active={dotIndex === index}
                      onClick={() => setIndex(dotIndex)}
                      aria-label={`Ver elemento ${dotIndex + 1}`}
                      aria-current={dotIndex === index}
                    />
                  ))}
                </Dots>
              </>
            ) : null}
          </Gallery>

          <Summary>
            <PetName>{pet.name}</PetName>
            <PetMeta>
              {pet.breed} · {pet.gender} · {pet.age} {pet.age === 1 ? 'año' : 'años'}
            </PetMeta>
            <Chips>
              {pet.nearby ? (
                <Chip $tone="primary"><MapPin size={13} /> Cerca tuyo{pet.distanceKm ? ` · ${pet.distanceKm} km` : ''}</Chip>
              ) : (
                <Chip><MapPin size={13} /> {pet.distanceKm ? `A ${pet.distanceKm} km` : 'En tu ciudad'}</Chip>
              )}
              {pet.breeding_preferences?.looking_for_pair ? <Chip $tone="primary"><Heart size={13} /> Busca pareja</Chip> : null}
              {pet.is_verified_breeder_pet ? <Chip $tone="primary"><ShieldCheck size={13} /> Criadero verificado</Chip> : null}
              {pet.personality_traits.map((trait) => <Chip key={trait}>{trait}</Chip>)}
            </Chips>
            {pet.bio ? <Bio>{pet.bio}</Bio> : null}
          </Summary>

          <Divider />
          <SectionLabel>Info del Dueño/a</SectionLabel>
          {owner ? (
            <>
              <OwnerRow>
                <OwnerAvatar>
                  {owner.avatar ? <img src={owner.avatar} alt={owner.name} /> : owner.name[0]}
                </OwnerAvatar>
                <OwnerCopy>
                  <strong>
                    {owner.name}
                    {owner.verified ? <ShieldCheck size={14} aria-label="Perfil verificado" /> : null}
                  </strong>
                  <span><MapPin size={12} /> {owner.zone}</span>
                  {owner.memberSince ? (
                    <span>
                      <CalendarClock size={12} /> En Tindog desde{' '}
                      {new Date(owner.memberSince).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </span>
                  ) : null}
                </OwnerCopy>
              </OwnerRow>
              {owner.bio ? <Bio>{owner.bio}</Bio> : null}
              {others.length ? (
                <PetMeta>
                  También a cargo: {others.map((person) => person.name).join(', ')}
                </PetMeta>
              ) : null}
            </>
          ) : (
            <PetMeta>El tutor todavía no completó su perfil.</PetMeta>
          )}

          <Divider />
          <SectionLabel>Información adicional de la mascota</SectionLabel>
          <Facts>
            <Fact>
              <FactIcon><CalendarClock size={17} /></FactIcon>
              <FactCopy><small>Edad</small><strong>{pet.age} {pet.age === 1 ? 'año' : 'años'}</strong></FactCopy>
            </Fact>
            <Fact>
              <FactIcon><Ruler size={17} /></FactIcon>
              <FactCopy><small>Peso</small><strong>{pet.weight ? `${pet.weight} kg` : 'Sin dato'}</strong></FactCopy>
            </Fact>
            <Fact>
              <FactIcon><Stethoscope size={17} /></FactIcon>
              <FactCopy>
                <small>Salud genética</small>
                <strong>
                  {health.length
                    ? health.map((record) => `${record.test_name}: ${record.result}`).join(' · ')
                    : 'Sin estudios cargados'}
                </strong>
              </FactCopy>
            </Fact>
            <Fact>
              <FactIcon><Heart size={17} /></FactIcon>
              <FactCopy>
                <small>Busca pareja para cría</small>
                <strong>
                  {pet.breeding_preferences?.looking_for_pair ? 'Sí' : 'No'}
                  {pet.breeding_preferences?.terms ? ` · ${pet.breeding_preferences.terms}` : ''}
                </strong>
              </FactCopy>
            </Fact>
            <Fact>
              <FactIcon><FileCheck size={17} /></FactIcon>
              <FactCopy>
                <small>Documentación</small>
                <strong>{pet.has_papers ? (pet.paper_types?.join(', ') || 'Con papeles') : 'Sin papeles'}</strong>
              </FactCopy>
            </Fact>
            <Fact>
              <FactIcon><Award size={17} /></FactIcon>
              <FactCopy>
                <small>Concursos</small>
                <strong>
                  {pet.is_competitor && competitions.length
                    ? competitions.map((item) => `${item.name} ${item.year}${item.award ? ` · ${item.award}` : ''}`).join(' · ')
                    : pet.is_competitor ? 'Participa' : 'No participa'}
                </strong>
              </FactCopy>
            </Fact>
          </Facts>

          <SectionLabel>Linaje y árbol genealógico</SectionLabel>
          <Lineage>
            <div><small>Padre</small><strong>{pet.father_id || 'Sin registrar'}</strong></div>
            <div><small>Madre</small><strong>{pet.mother_id || 'Sin registrar'}</strong></div>
            <div><small>Abuelos paternos</small><strong>{[pet.paternal_grandfather_id, pet.paternal_grandmother_id].filter(Boolean).join(' · ') || 'Sin registrar'}</strong></div>
            <div><small>Abuelos maternos</small><strong>{[pet.maternal_grandfather_id, pet.maternal_grandmother_id].filter(Boolean).join(' · ') || 'Sin registrar'}</strong></div>
          </Lineage>

          <Fact>
            <FactIcon><Dna size={17} /></FactIcon>
            <FactCopy>
              <small>Coeficiente de consanguinidad (COI)</small>
              <strong>
                {pet.coi_percentage != null ? `${pet.coi_percentage}%` : 'Sin dato'}
                {pet.coi_percentage != null && pet.coi_percentage < 10 ? ' · dentro de lo recomendable' : ''}
              </strong>
            </FactCopy>
          </Fact>

          <PetMeta>
            <Sparkles size={12} /> Los datos los carga quien tiene la mascota.
          </PetMeta>
        </Sheet>
      </Backdrop>
    </AnimatePresence>
  );
}
