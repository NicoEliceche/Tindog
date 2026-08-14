// src/features/marketing/screens/LandingScreen.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessagesSquare, PawPrint, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { withPublicBasePath } from '@core/routing/publicPath';
import { restoreAuthSession } from '@core/data/services/authService';
import {
  LoadingScreen, LoadingMessage,
  Page, HeroSection, HeroCopy, LogoWrapper, LogoImage, ContentBox, Eyebrow, Title, Subtitle,
  CtaRow, Button, TrustNote, HeroMockup, MockupFrame, MockupImage, MockupGlow,
  Section, SectionHeading, SectionSubheading, StepsGrid, StepCardIcon, StepNumber, StepTitle, StepDescription,
  ValueGrid, ValueIcon, ValueTitle, ValueDescription,
  Footer, FooterBrand, FooterNote,
} from './LandingScreenStyled';
import { Card } from '@shared/components/ui';

const steps = [
  { Icon: Users, title: 'Creá el perfil de tu perro', description: 'Raza, edad, personalidad y qué tipo de cita buscás: amistad, cría o socialización.' },
  { Icon: Heart, title: 'Descubrí matches cercanos', description: 'Explorá perfiles compatibles cerca tuyo y conectá con otros dueños en segundos.' },
  { Icon: MessagesSquare, title: 'Coordiná el encuentro', description: 'Chateá, agendá una cita en un lugar seguro y llevá a tu mejor amigo a conocer gente nueva.' },
];

const values = [
  { Icon: PawPrint, title: 'Para cada intención', description: 'Amistad, socialización o cría responsable entre razas compatibles.' },
  { Icon: ShieldCheck, title: 'Encuentros seguros', description: 'Lugares verificados y reseñas de la comunidad para cada cita.' },
  { Icon: Sparkles, title: 'Matches con criterio', description: 'Filtros por raza, tamaño, energía y compatibilidad real entre mascotas.' },
];

export function LandingScreen() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const session = await restoreAuthSession();

      if (cancelled) {
        return;
      }

      if (session) {
        router.replace('/discovery');
        return;
      }

      setIsCheckingSession(false);
    };

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isCheckingSession) {
    return (
      <LoadingScreen>
        <LoadingMessage>Verificando sesión...</LoadingMessage>
      </LoadingScreen>
    );
  }

  return (
    <Page>
      <HeroSection>
        <HeroCopy>
          <LogoWrapper
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <LogoImage
              src={withPublicBasePath('/assets/tindog_patita_logo.png')}
              alt="Tindog Logo"
              width={220}
              height={220}
            />
          </LogoWrapper>

          <ContentBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <Eyebrow><Sparkles size={14} /> La red social para perros</Eyebrow>
            <Title>Donde las <span>Patas</span> conectan.</Title>
            <Subtitle>La red social más guau para encontrar la cita perfecta de tu mejor amigo.</Subtitle>
          </ContentBox>

          <CtaRow>
            <Button
              onClick={() => router.push('/login')}
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(212, 175, 55, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Empezar Aventura
            </Button>
            <TrustNote>Gratis · Sin tarjeta de crédito</TrustNote>
          </CtaRow>
        </HeroCopy>

        <HeroMockup
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <MockupGlow />
          <MockupFrame>
            <MockupImage src={withPublicBasePath('/assets/home_screen.jpeg')} alt="Vista previa de Tindog" />
          </MockupFrame>
        </HeroMockup>
      </HeroSection>

      <Section>
        <SectionHeading>Cómo funciona</SectionHeading>
        <SectionSubheading>Tres pasos para encontrarle a tu perro la compañía perfecta.</SectionSubheading>
        <StepsGrid>
          {steps.map(({ Icon, title, description }, index) => (
            <Card key={title} variant="surface" padding="2rem">
              <StepNumber>0{index + 1}</StepNumber>
              <StepCardIcon><Icon size={26} strokeWidth={2.2} /></StepCardIcon>
              <StepTitle>{title}</StepTitle>
              <StepDescription>{description}</StepDescription>
            </Card>
          ))}
        </StepsGrid>
      </Section>

      <Section>
        <SectionHeading>Pensado para cada familia peluda</SectionHeading>
        <SectionSubheading>Ya sea que busques un compañero de juegos o un plan de cría responsable, Tindog se adapta.</SectionSubheading>
        <ValueGrid>
          {values.map(({ Icon, title, description }) => (
            <Card key={title} variant="glass" padding="1.75rem">
              <ValueIcon><Icon size={22} strokeWidth={2.2} /></ValueIcon>
              <ValueTitle>{title}</ValueTitle>
              <ValueDescription>{description}</ValueDescription>
            </Card>
          ))}
        </ValueGrid>
      </Section>

      <Footer>
        <FooterBrand>
          <img src={withPublicBasePath('/assets/tindog_patita_logo.png')} alt="" width={28} height={28} />
          Tindog
        </FooterBrand>
        <FooterNote>© {new Date().getFullYear()} Tindog. Hecho con cariño para perros y sus humanos.</FooterNote>
      </Footer>
    </Page>
  );
}
