// src/features/appointments/screens/AppointmentListScreen.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Plus } from 'lucide-react';
import { Appointment } from '@core/types/appointment.types';
import { fetchAppointments } from '@core/data/services/appointmentService';
import {
  ScreenWrapper,
  CalendarCard,
  AppointmentItem,
  DateTimeInfo,
  AppointmentDetails,
  LocationText,
  PetTags,
  PetTag,
} from './AppointmentListScreenStyled';
import { useRouter } from 'next/navigation';
import { Header, Title, AddButton } from '@features/pets/screens/PetListScreenStyled';

export function AppointmentListScreen() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAppointments().then(data => {
      setAppointments(data);
      setLoading(false);
    });
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      day: date.getDate(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <ScreenWrapper>
      <Header>
        <Title>Agenda</Title>
        <AddButton onClick={() => router.push('/appointments/location')}>
          <Plus size={20} /> Agendar
        </AddButton>
      </Header>

      <CalendarCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#636E72' }}>
          <Calendar size={18} />
          <span>Próximas citas</span>
        </div>

        {loading ? (
          <p>Cargando agenda...</p>
        ) : appointments.length > 0 ? (
          appointments.map(app => {
            const { month, day, time } = formatDate(app.datetime);
            return (
              <AppointmentItem key={app.id}>
                <DateTimeInfo>
                  <span>{month}</span>
                  <span>{day}</span>
                </DateTimeInfo>
                <AppointmentDetails>
                  <LocationText>{app.location.name}</LocationText>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#636E72' }}>
                    <MapPin size={12} />
                    <span>{app.location.address} - {time}</span>
                  </div>
                  <PetTags>
                    {/* En un entorno real buscaríamos los nombres de los perros */}
                    <PetTag>Firulais</PetTag>
                  </PetTags>
                </AppointmentDetails>
              </AppointmentItem>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', color: '#636E72', padding: '1rem' }}>No hay citas agendadas.</p>
        )}
      </CalendarCard>
    </ScreenWrapper>
  );
}
