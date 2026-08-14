// src/app/appointments/location/page.tsx
import { SafeLocationScreen } from '@features/appointments';
import { Suspense } from 'react';

export default function AppointmentLocationPage() {
  return <Suspense fallback={null}><SafeLocationScreen /></Suspense>;
}
