// src/features/marketing/screens/LandingScreen.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Variants, motion, useReducedMotion } from 'framer-motion';
import { Heart, MessagesSquare, PawPrint, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { withPublicBasePath } from '@core/routing/publicPath';
import { mayHaveStoredSession, restoreAuthSession } from '@core/data/services/authService';
import {
  LoadingScreen, LoadingMessage,
  Page, HeroSection, HeroCopy, LogoWrapper, LogoImage, ContentBox, Eyebrow, Title, Subtitle,
  CtaRow, Button, TrustNote, HeroMockup, MockupImage, MockupGlow,
  Section, SectionHeading, SectionSubheading, StepsGrid, StepCardIcon, StepNumber, StepTitle, StepDescription,
  ValueGrid, ValueIcon, ValueTitle, ValueDescription,
  Footer, FooterBrand, FooterNote,
} from './LandingScreenStyled';
import { BrandLogo, Card } from '@shared/components/ui';

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

// Secuencia de entrada: cada bloque aparece escalonado, y el título se
// revela palabra por palabra para que la carga se sienta orquestada.
/**
 * La entrada del titular.
 *
 * El texto ya no arranca invisible. El navegador toma la portada como
 * cargada recien cuando su bloque mas grande esta pintado, y con el titular
 * apareciendo de a una palabra ese momento llegaba casi un segundo y medio
 * tarde: se medi­a la animacion, no la carga.
 *
 * Queda el desplazamiento, que es lo que se percibe como entrada, y el
 * desenfoque desaparecio porque obliga al navegador a rehacer el filtro en
 * cada cuadro sobre texto ya legible.
 */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const lineVariants: Variants = {
  hidden: { y: 18 },
  visible: { y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const wordVariants: Variants = {
  hidden: { y: 28 },
  visible: { y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export function LandingScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  /**
   * Sólo se espera cuando hay una sesión guardada que validar.
   *
   * Antes la portada arrancaba tapada por "Verificando sesión..." para todo
   * el mundo. Para quien nunca inició sesión no había nada que verificar, y
   * el contenido real recién entraba al documento cuando la comprobación
   * terminaba: era eso, y no las animaciones, lo que retrasaba la carga.
   *
   * Se lee en el inicializador y no en un efecto porque en el primer pintado
   * ya hace falta saberlo. Da `false` en el servidor, donde no hay
   * almacenamiento, que es justo lo que corresponde: el HTML estático es el
   * de la portada.
   */
  const [isCheckingSession, setIsCheckingSession] = useState(() => mayHaveStoredSession());

  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      const session = await restoreAuthSession();

      if (cancelled) {
        return;
      }

      if (session) {
        router.replace('/discovery');
        // Aunque redirijamos, hay que salir del estado de carga: la
        // navegación no es inmediata y este componente sigue montado
        // mientras tanto. Si no, queda renderizando LoadingScreen —un
        // contenedor vacío— encima de la pantalla nueva hasta que se
        // recargue a mano.
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
          <LogoWrapper>
            <LogoImage alt="Tindog" size="md" />
          </LogoWrapper>

          <ContentBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={lineVariants}>
              <Eyebrow><Sparkles size={14} /> La red social para perros</Eyebrow>
            </motion.div>
            <Title>
              {['Donde', 'las'].map((word) => (
                <motion.span key={word} variants={wordVariants} className="word">{word}</motion.span>
              ))}
              <motion.span variants={wordVariants} className="word accent">Patas</motion.span>
              <motion.span variants={wordVariants} className="word">conectan.</motion.span>
            </Title>
            <motion.div variants={lineVariants}>
              <Subtitle>La red social más guau para encontrar la cita perfecta de tu mejor amigo.</Subtitle>
            </motion.div>
          </ContentBox>

          <CtaRow>
            <Button
              onClick={() => router.push('/login')}
              whileHover={reduceMotion ? undefined : { scale: 1.05 }}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              Empezar aventura
            </Button>
            <TrustNote>Gratis · Sin tarjeta de crédito</TrustNote>
          </CtaRow>
        </HeroCopy>

        <HeroMockup
          initial={{ x: 60, rotateY: -22, scale: 0.9 }}
          animate={{ x: 0, rotateY: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <MockupGlow />
          <MockupImage src={withPublicBasePath('/assets/home_screen.jpeg')} alt="Vista previa de Tindog" />
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
          <BrandLogo variant="gold" />
          Tindog
        </FooterBrand>
        <FooterNote>© {new Date().getFullYear()} Tindog. Hecho con cariño para perros y sus humanos.</FooterNote>
      </Footer>
    </Page>
  );
}
