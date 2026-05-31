// src/features/matches/screens/MatchesScreen.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Pet } from '@core/types/pet.types';
import { fetchMatches } from '@core/data/services/matchService';
import {
  ScreenWrapper,
  Title,
  MatchGrid,
  MatchCard,
  MatchPhoto,
  MatchInfo,
  MatchName,
} from './MatchesScreenStyled';

export function MatchesScreen() {
  const [matches, setMatches] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches().then(data => {
      setMatches(data);
      setLoading(false);
    });
  }, []);

  return (
    <ScreenWrapper>
      <Title>Tus Matches</Title>
      
      {loading ? (
        <p>Buscando matches...</p>
      ) : matches.length > 0 ? (
        <MatchGrid>
          {matches.map(pet => (
            <MatchCard key={pet.id}>
              <MatchPhoto src={pet.photos[0]} alt={pet.name} />
              <MatchInfo>
                <MatchName>{pet.name}</MatchName>
              </MatchInfo>
            </MatchCard>
          ))}
        </MatchGrid>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#636E72' }}>
          <p>Aún no tienes matches. ¡Sigue swipeando!</p>
        </div>
      )}
    </ScreenWrapper>
  );
}
