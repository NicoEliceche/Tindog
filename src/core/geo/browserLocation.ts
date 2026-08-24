// src/core/geo/browserLocation.ts
import { type LatLng, toCoarseZone } from './distance';

/** Por que no hay ubicacion, para poder explicarlo en pantalla. */
export type LocationFailure = 'unsupported' | 'denied' | 'unavailable' | 'timeout';

export interface LocationResult {
  zone: LatLng | null;
  failure?: LocationFailure;
}

/**
 * La zona aproximada de quien usa la aplicacion.
 *
 * Devuelve el punto ya redondeado y nunca el exacto: el unico consumidor es
 * el filtro por distancia, que no necesita mas, y asi la coordenada fina no
 * llega a viajar ni a guardarse. Ver `toCoarseZone`.
 *
 * No hace falta ninguna clave ni servicio pago: esto lo resuelve el propio
 * navegador. Google Maps sirve para dibujar el mapa, no para saber donde
 * esta el usuario.
 */
export function requestCoarseLocation(): Promise<LocationResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve({ zone: null, failure: 'unsupported' });
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        zone: toCoarseZone({ lat: position.coords.latitude, lng: position.coords.longitude }),
      }),
      (error) => {
        const failure: LocationFailure = error.code === error.PERMISSION_DENIED
          ? 'denied'
          : error.code === error.TIMEOUT
            ? 'timeout'
            : 'unavailable';
        resolve({ zone: null, failure });
      },
      {
        // Alta precision consume bateria y no aporta: el dato se redondea a
        // una celda de un kilometro igual.
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      },
    );
  });
}

/** Que decirle a la persona segun por que fallo. */
export function locationFailureMessage(failure: LocationFailure): string {
  switch (failure) {
    case 'denied':
      return 'Necesitamos tu ubicación aproximada para mostrarte perros cerca. Podés activarla desde el navegador.';
    case 'timeout':
      return 'Tardó demasiado en resolverse. Probá de nuevo en un momento.';
    case 'unsupported':
      return 'Este navegador no puede darnos tu ubicación.';
    default:
      return 'No pudimos obtener tu ubicación en este momento.';
  }
}
