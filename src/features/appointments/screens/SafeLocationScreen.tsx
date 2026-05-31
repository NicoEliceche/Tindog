// src/features/appointments/screens/SafeLocationScreen.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchSafePawPoints } from '@core/data/services/appointmentService';
import { LocationInfo } from '@core/types/appointment.types';
import {
  ScreenWrapper,
  SearchBar,
  CuratedList,
  LocationCard,
  LocationName,
  Badge,
  Address,
  MapPlaceholder,
  FloatingButton,
} from './SafeLocationScreenStyled';

export function SafeLocationScreen() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<LocationInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async (search?: string) => {
    setLoading(true);
    const data = await fetchSafePawPoints(search);
    setLocations(data);
    setLoading(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    loadLocations(val);
  };

  return (
    <ScreenWrapper>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => router.back()}><ArrowLeft size={24} /></button>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Lugar de Encuentro</h1>
      </div>

      <p style={{ color: '#636E72', fontSize: '0.9rem' }}>
        Solo permitimos encuentros en <strong>Safe Paw-Points</strong>: lugares públicos y verificados para la seguridad de todos.
      </p>

      <SearchBar>
        <Search size={20} color="#636E72" />
        <input 
          placeholder="Buscar parques o cafés..." 
          value={query}
          onChange={handleSearch}
        />
      </SearchBar>

      <CuratedList>
        {loading ? (
          <p>Cargando lugares seguros...</p>
        ) : (
          locations.map((loc) => (
            <LocationCard 
              key={loc.place_id} 
              $selected={selectedId === loc.place_id}
              onClick={() => setSelectedId(loc.place_id)}
            >
              <LocationName>
                <MapPin size={18} color={selectedId === loc.place_id ? '#FF6B6B' : '#636E72'} />
                {loc.name}
                <Badge><ShieldCheck size={10} inline style={{ marginRight: 2 }} /> Verificado</Badge>
              </LocationName>
              <Address>{loc.address}</Address>
            </LocationCard>
          ))
        )}
      </CuratedList>

      {selectedId && (
        <FloatingButton
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => {
            alert(`Lugar seleccionado: ${locations.find(l => l.place_id === selectedId)?.name}`);
            router.push('/appointments');
          }}
        >
          Confirmar Punto de Encuentro
        </FloatingButton>
      )}
    </ScreenWrapper>
  );
}
