'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Phone, Video, MoreVertical, ShieldCheck } from 'lucide-react';
import { BreedingContractModal } from '../components/BreedingContractModal';
import { AppointmentCard } from '../components/AppointmentCard';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: white;
`;

const SecureBadge = styled(motion.div)`
  background: #E8F5E9;
  color: #2E7D32;
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid #C8E6C9;
  cursor: pointer;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem ${({ theme }) => theme.layout.screenPaddingH};
  border-bottom: 1px solid #eee;
  background: white;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Name = styled.h2`
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
`;

const Status = styled.span`
  font-size: 0.7rem;
  color: #4CAF50;
  font-weight: 700;
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 1rem ${({ theme }) => theme.layout.screenPaddingH};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  background: #f9f9f9;
`;

const MessageBubble = styled(motion.div)<{ isMine: boolean }>`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 1.2rem;
  font-size: 0.95rem;
  line-height: 1.4;
  align-self: ${({ isMine }) => isMine ? 'flex-end' : 'flex-start'};
  background: ${({ isMine, theme }) => isMine ? theme.color.primary : 'white'};
  color: ${({ isMine }) => isMine ? 'white' : '#333'};
  border-bottom-${({ isMine }) => isMine ? 'right' : 'left'}-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const InputArea = styled.div`
  padding: 1rem ${({ theme }) => theme.layout.screenPaddingH};
  padding-bottom: 2rem;
  background: white;
  display: flex;
  align-items: center;
  gap: 12px;
  border-top: 1px solid #eee;
`;

const Input = styled.input`
  flex: 1;
  height: 48px;
  background: #f1f1f1;
  border: none;
  border-radius: 1.5rem;
  padding: 0 20px;
  font-size: 1rem;
  outline: none;
`;

const SendButton = styled(motion.button)`
  width: 48px;
  height: 48px;
  background: ${({ theme }) => theme.color.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
`;

export function ChatRoomScreen({ chatId }: { chatId: string }) {
  const router = useRouter();
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { id: '1', type: 'text', text: 'Hola! Vi a Firulais y me encantó su linaje.', isMine: false },
    { id: '2', type: 'text', text: 'Hola Laura! Muchas gracias. Sí, tiene un pedigree muy cuidado.', isMine: true },
    { id: '3', type: 'text', text: '¿Podríamos coordinar para ver los papeles originales?', isMine: false },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), type: 'text', text: inputText, isMine: true }]);
    setInputText('');
  };

  const handleSignContract = () => {
    setIsContractOpen(false);
    
    // 1. Add contract confirmation message
    const currentMsgs = [...messages, { 
      id: Date.now().toString(), 
      type: 'text',
      text: '🛡️ CONTRATO DE CRUZA FIRMADO: Ambas partes han acordado los términos de salud y descendencia.', 
      isMine: true 
    }];

    setMessages(currentMsgs);

    // 2. Automate Appointment Scheduling (Simulated)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: 'appt-' + Date.now(),
        type: 'appointment',
        data: {
          date: 'Sábado, 15 de Junio',
          time: '16:00',
          locationName: 'Parque de los Perros',
          address: 'Av. Sarmiento y Figueroa Alcorta'
        }
      }]);
    }, 1000);
  };

  return (
    <Container>
      <Header>
        <button onClick={() => router.back()}>
          <ArrowLeft size={24} />
        </button>
        <UserInfo>
          <Name>Laura (Luna)</Name>
          <Status>En línea</Status>
        </UserInfo>
        <div style={{ display: 'flex', gap: '15px', color: '#666' }}>
          <Phone size={20} />
          <Video size={20} />
          <MoreVertical size={20} />
        </div>
      </Header>

      <SecureBadge 
        onClick={() => setIsContractOpen(true)}
        whileHover={{ background: '#C8E6C9' }}
      >
        <ShieldCheck size={16} />
        CONFIRMAR CRUZA SEGURA
      </SecureBadge>

      <ChatBody>
        {messages.map((msg) => (
          msg.type === 'appointment' ? (
            <AppointmentCard key={msg.id} {...msg.data} />
          ) : (
            <MessageBubble 
              key={msg.id} 
              isMine={msg.isMine}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
            >
              {msg.text}
            </MessageBubble>
          )
        ))}
      </ChatBody>

      <InputArea>
        <Input 
          placeholder="Escribe un mensaje..." 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <SendButton 
          whileTap={{ scale: 0.9 }}
          onClick={handleSend}
        >
          <Send size={20} />
        </SendButton>
      </InputArea>

      <BreedingContractModal 
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        pet1Name="Firulais"
        pet2Name="Luna"
        onSign={handleSignContract}
      />
    </Container>
  );
}
