export type AppointmentStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SafeLocationReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verifiedAttendance: boolean;
}

export interface SafeLocation {
  id: string;
  googlePlaceId: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  distanceKm: number;
  tags: string[];
  reviews: SafeLocationReview[];
}

export interface Appointment {
  id: string;
  conversationId: string;
  ownerName: string;
  petNames: string[];
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  location: SafeLocation;
  cancelledAt?: string;
  completedAt?: string;
  sharedWithTrustedContact: boolean;
  checkedIn: boolean;
  reviewSubmitted: boolean;
}

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Agendada',
  in_progress: 'En progreso',
  completed: 'Finalizada',
  cancelled: 'Cancelada',
};

export function getEffectiveAppointmentStatus(appointment: Appointment, now = new Date()): AppointmentStatus {
  if (appointment.status !== 'scheduled') {
    return appointment.status;
  }

  const timestamp = now.getTime();
  return timestamp >= new Date(appointment.startAt).getTime() && timestamp <= new Date(appointment.endAt).getTime()
    ? 'in_progress'
    : 'scheduled';
}
