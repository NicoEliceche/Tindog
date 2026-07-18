// src/features/discovery/screens/DiscoveryScreen.tsx
'use client';

import React, { useState } from 'react';
import { AnimatePresence, useMotionValue, useTransform, motion } from 'framer-motion';
import { Heart, X, Settings, MessageCircle, Star, Info } from 'lucide-react';
import { Pet } from '@core/types/pet.types';
import {
  ScreenWrapper,
  Header,
  CardContainer,
  SwipeCard,
  CardImage,
  CardInfo,
  PetName,
  PetBreed,
  ActionButtons,
  CircleButton,
  CardImageContainer,
  SideInfo,
  BigTitle,
} from './DiscoveryScreenStyled';

const MOCK_PETS: Pet[] = [
  {
    id: '1',
    name: 'Firulais',
    breed: 'Golden Retriever',
    age: 3,
    bio: 'Me encanta correr tras la pelota y los mimos.',
    photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600'],
    owner_ids: ['u1'],
    personality_traits: ['Juguetón', 'Cariñoso'],
  },
  {
    id: '2',
    name: 'Luna',
    breed: 'Border Collie',
    age: 2,
    bio: 'Inteligente y con mucha energía. Busco amigos para agility.',
    photos: ['https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=600'],
    owner_ids: ['u2'],
    personality_traits: ['Activa', 'Inteligente'],
  },
  {
    id: '3',
    name: 'Roco',
    breed: 'Bulldog Francés',
    age: 4,
    bio: 'Soy un poco vago pero muy sociable.',
    photos: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=600'],
    owner_ids: ['u3'],
    personality_traits: ['Tranquilo', 'Sociable'],
  },
];

export function DiscoveryScreen() {
  const [pets, setPets] = useState<Pet[]>(MOCK_PETS);
  const [showMatch, setShowMatch] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe('right');
    } else if (info.offset.x < -100) {
      handleSwipe('left');
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      if (Math.random() > 0.7) {
        setShowMatch(true);
      }
    }
    setPets((prev) => prev.slice(1));
    x.set(0);
  };

  return (
    <ScreenWrapper>
      <SideInfo $align="left">
        <BigTitle>Encuentra el <span>Match</span> ideal para tu mejor amigo.</BigTitle>
      </SideInfo>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '450px', position: 'relative' }}>
        <Header>
          <CircleButton $type="nope" as={motion.button} style={{ width: 44, height: 44 }}>
            <Settings size={20} />
          </CircleButton>
          <img src="/assets/tindog_logo.png" alt="Tindog" height={34} />
          <CircleButton $type="like" as={motion.button} style={{ width: 44, height: 44 }}>
            <MessageCircle size={20} />
          </CircleButton>
        </Header>

        <CardContainer>
          <AnimatePresence mode="popLayout">
            {pets.length > 1 && (
              <SwipeCard
                key={pets[1].id}
                style={{ scale: 0.95, opacity: 0.5, y: 10, zIndex: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              >
                <CardImageContainer>
                  <CardImage src={pets[1].photos[0]} alt={pets[1].name} />
                </CardImageContainer>
              </SwipeCard>
            )}

            {pets.length > 0 ? (
              <SwipeCard
                key={pets[0].id}
                style={{ x, rotate, opacity, zIndex: 1 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ 
                  x: x.get() > 0 ? 1000 : -1000, 
                  opacity: 0,
                  rotate: x.get() > 0 ? 45 : -45,
                  transition: { duration: 0.4 }
                }}
              >
                <CardImageContainer>
                  <CardImage src={pets[0].photos[0]} alt={pets[0].name} />
                  <CardInfo>
                    <PetName>{pets[0].name}, {pets[0].age}</PetName>
                    <PetBreed>{pets[0].breed}</PetBreed>
                  </CardInfo>
                </CardImageContainer>
              </SwipeCard>
            ) : (
              <div style={{ textAlign: 'center', color: '#636E72', zIndex: 1 }}>
                <p>¡No hay más perritos cerca!</p>
                <button onClick={() => setPets(MOCK_PETS)} style={{ marginTop: '1rem', color: '#FF6B6B', fontWeight: 'bold' }}>
                  Recargar
                </button>
              </div>
            )}
          </AnimatePresence>

          <ActionButtons>
            <CircleButton $type="nope" whileTap={{ scale: 0.8 }} onClick={() => handleSwipe('left')}>
              <X size={32} />
            </CircleButton>
            <CircleButton $type="super" whileTap={{ scale: 0.8 }} style={{ borderColor: '#4D96FF', color: '#4D96FF', width: 54, height: 54 }}>
              <Star size={24} fill="currentColor" />
            </CircleButton>
            <CircleButton $type="like" whileTap={{ scale: 0.8 }} onClick={() => handleSwipe('right')}>
              <Heart size={32} fill="currentColor" />
            </CircleButton>

          </ActionButtons>
        </CardContainer>
      </div>

      <SideInfo $align="right">
        <p style={{ fontSize: '1.4rem', color: '#636E72', fontWeight: 500, lineHeight: 1.4 }}>
          Desliza para conocer a los perritos más sociables de tu zona y agenda una cita increíble.
        </p>
      </SideInfo>

      {/* Match Modal (Same as before but simplified logic) */}
      <AnimatePresence>
        {showMatch && (
           <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           style={{
             position: 'fixed',
             top: 0, left: 0, right: 0, bottom: 0,
             backgroundColor: 'rgba(0,0,0,0.95)',
             zIndex: 2000,
             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
             color: 'white', textAlign: 'center'
           }}
         >
           <h1 style={{ fontSize: '4rem', fontWeight: 900, color: '#FF6B6B' }}>IT'S A MATCH!</h1>
           <button 
             onClick={() => setShowMatch(false)}
             style={{ background: 'white', color: '#FF6B6B', padding: '1rem 3rem', borderRadius: '999px', fontWeight: 'bold', marginTop: '2rem' }}
           >
             Continuar
           </button>
         </motion.div>
        )}
      </AnimatePresence>
    </ScreenWrapper>
  );
}
