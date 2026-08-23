// src/core/geo/distance.ts

/** Un punto en el mapa. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** Radio medio de la Tierra, en kilometros. */
const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Distancia en linea recta entre dos puntos, en kilometros.
 *
 * Es la formula del semiverseno, que trata a la Tierra como una esfera. El
 * error frente a la forma real ronda el 0,3%: sobre los 25 km que se eligen
 * en la configuracion son unos 75 metros, muy por debajo de lo que aporta
 * el propio GPS del telefono, y es la cuenta habitual para filtrar "cerca
 * mio" sin traer una biblioteca entera.
 */
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h = Math.sin(dLat / 2) ** 2
    + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Como se muestra una distancia.
 *
 * Por debajo del kilometro, en metros redondeados de a 50: "800 m" se lee
 * mejor que "0,8 km", y mas precision que esa el GPS no la sostiene.
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const metres = Math.round((km * 1000) / 50) * 50;
    return `${Math.max(50, metres)} m`;
  }
  return `${km.toFixed(1).replace('.', ',')} km`;
}

/** Si un punto entra en el radio elegido. */
export function isWithinRadius(from: LatLng, to: LatLng, radiusKm: number): boolean {
  return distanceKm(from, to) <= radiusKm;
}
