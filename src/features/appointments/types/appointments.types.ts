// src/features/appointments/types/appointments.types.ts
import { Appointment } from '@core/types/appointment.types';

export interface AppointmentsState {
  items: Appointment[];
  isLoading: boolean;
}
