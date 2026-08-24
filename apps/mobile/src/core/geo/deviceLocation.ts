import * as Location from 'expo-location';
import { type LatLng, toCoarseZone } from './distance';

/** Por que no hay ubicacion, para poder explicarlo en pantalla. */
export type LocationFailure = 'denied' | 'unavailable';

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
 * Es el equivalente de `browserLocation` en la web. No hace falta ninguna
 * clave de Google: el sistema operativo ya da la posicion.
 */
export async function requestCoarseLocation(): Promise<LocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') return { zone: null, failure: 'denied' };

  try {
    // Precision baja a proposito: el dato se redondea a una celda de un
    // kilometro, asi que pedir mas solo gasta bateria.
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    return { zone: toCoarseZone({ lat: position.coords.latitude, lng: position.coords.longitude }) };
  } catch {
    return { zone: null, failure: 'unavailable' };
  }
}

/** Que decirle a la persona segun por que fallo. */
export function locationFailureMessage(failure: LocationFailure): string {
  return failure === 'denied'
    ? 'Necesitamos tu ubicación aproximada para mostrarte perros cerca. Podés activarla desde los ajustes del teléfono.'
    : 'No pudimos obtener tu ubicación en este momento.';
}
