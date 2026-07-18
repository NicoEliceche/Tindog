'use client';

import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing[6]} ${({ theme }) => theme.layout.screenPaddingH};
  gap: ${({ theme }) => theme.spacing[4]};
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f1f1f1;
  padding: 12px 16px;
  border-radius: 1rem;
  margin-bottom: 1rem;
`;

const ChatItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
`;

const Avatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
`;

const Content = styled.div`
  flex: 1;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const Name = styled.h3`
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
`;

const Time = styled.span`
  font-size: 0.75rem;
  color: #888;
`;

const LastMessage = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const UnreadBadge = styled.div`
  width: 10px;
  height: 10px;
  background: ${({ theme }) => theme.color.primary};
  border-radius: 50%;
`;

export function ChatListScreen() {
  const router = useRouter();

  const MOCK_CHATS = [
    { id: '1', name: 'Laura (Dueña de Luna)', lastMsg: 'Hola! ¿Sigue disponible para cruza?', time: '10:30', unread: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200' },
    { id: '2', name: 'Carlos (Dueño de Thor)', lastMsg: 'Excelente, el pedigree está verificado.', time: 'Ayer', unread: false, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200' },
  ];

  return (
    <Container>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Mensajes</h1>
      
      <SearchBar>
        <Search size={20} color="#888" />
        <input 
          placeholder="Buscar conversaciones..." 
          style={{ background: 'transparent', border: 'none', flex: 1, outline: 'none', fontSize: '1rem' }}
        />
      </SearchBar>

      {MOCK_CHATS.map((chat) => (
        <ChatItem 
          key={chat.id} 
          onClick={() => router.push(`/chat/${chat.id}`)}
          whileHover={{ x: 5 }}
        >
          <Avatar src={chat.avatar} />
          <Content>
            <TopRow>
              <Name>{chat.name}</Name>
              <Time>{chat.time}</Time>
            </TopRow>
            <LastMessage>{chat.lastMsg}</LastMessage>
          </Content>
          {chat.unread && <UnreadBadge />}
        </ChatItem>
      ))}
    </Container>
  );
}
