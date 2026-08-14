import type { Coordinates } from '../../types/appointment.types';

export async function requestForegroundCoordinates(): Promise<Coordinates | null> {
  if (!globalThis.navigator?.geolocation) return null;
  return new Promise((resolve) => {
    globalThis.navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
    );
  });
}
