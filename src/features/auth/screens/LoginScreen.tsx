// src/features/auth/screens/LoginScreen.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchGoogleAuthConfig, login, loginWithGoogleIdToken } from '@core/data/services/authService';
import {
  ScreenWrapper,
  LoginCard,
  Title,
  Form,
  InputGroup,
  Label,
  Input,
  SubmitButton,
  LogoContainer,
  GoogleButtonWrapper,
  Divider,
  ErrorMessage,
} from './LoginScreenStyled';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme: 'outline' | 'filled_blue' | 'filled_black';
              size: 'large' | 'medium' | 'small';
              text: 'continue_with' | 'signin_with';
              shape: 'pill' | 'rectangular';
              width: number;
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-services';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const loadGoogleScript = () => {
      if (document.getElementById(GOOGLE_SCRIPT_ID)) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = GOOGLE_SCRIPT_ID;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
        document.head.appendChild(script);
      });
    };

    const initializeGoogle = async () => {
      try {
        const [{ webClientId }] = await Promise.all([
          fetchGoogleAuthConfig(),
          loadGoogleScript(),
        ]);

        const buttonContainer = googleButtonRef.current;

        if (cancelled || !window.google || !buttonContainer) {
          return;
        }

        const buttonWidth = Math.min(
          320,
          Math.floor(buttonContainer.getBoundingClientRect().width || 320),
        );

        window.google.accounts.id.initialize({
          client_id: webClientId,
          callback: async (response) => {
            if (!response.credential) {
              setErrorMessage('Google no devolvió una credencial válida.');
              return;
            }

            setIsLoading(true);
            setErrorMessage('');

            try {
              await loginWithGoogleIdToken(response.credential);
              router.push('/discovery');
            } catch {
              setErrorMessage('No pudimos iniciar sesión con Google.');
            } finally {
              setIsLoading(false);
            }
          },
        });

        buttonContainer.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainer, {
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: buttonWidth,
        });
      } catch {
        if (!cancelled) {
          setErrorMessage('Configuración de Google pendiente o inválida.');
        }
      } finally {
        if (!cancelled) {
          setGoogleLoading(false);
        }
      }
    };

    initializeGoogle();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      await login(email, password);
      router.push('/discovery');
    } catch (error) {
      setErrorMessage('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <LoginCard
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <LogoContainer>
          <img src="/assets/tindog_logo.png" alt="Tindog Logo" width={140} />
        </LogoContainer>
        
        <Title>Bienvenido</Title>

        <GoogleButtonWrapper ref={googleButtonRef}>
          {googleLoading && <span>Cargando Google...</span>}
        </GoogleButtonWrapper>

        <Divider>o</Divider>

        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>Email</Label>
            <Input 
              type="email" 
              placeholder="dueño@tindog.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <Label>Contraseña</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputGroup>
          <SubmitButton 
            type="submit" 
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? 'Iniciando...' : 'Entrar'}
          </SubmitButton>
        </Form>
      </LoginCard>
    </ScreenWrapper>
  );
}
