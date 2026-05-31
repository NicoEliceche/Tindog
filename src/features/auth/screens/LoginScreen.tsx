// src/features/auth/screens/LoginScreen.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@core/data/services/authService';
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
  PawIcon,
} from './LoginScreenStyled';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/discovery');
    } catch (error) {
      alert('Error al iniciar sesión');
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
          <PawIcon>🐾</PawIcon>
          <img src="/assets/tindog_logo.png" alt="Tindog Logo" width={140} />
        </LogoContainer>
        
        <Title>Bienvenido</Title>
        
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
