import { describe, expect, it } from 'vitest';
import { COARSE_ERROR_KM, distanceKm, formatDistance, isWithinRadius, toCoarseZone } from './distance';

// Puntos reales de Buenos Aires, que es donde vive el mock de la aplicacion.
const OBELISCO = { lat: -34.6037, lng: -58.3816 };
const PARQUE_LAS_HERAS = { lat: -34.5839, lng: -58.4094 };
const LA_PLATA = { lat: -34.9215, lng: -57.9545 };

describe('distanceKm', () => {
  it('da cero entre un punto y si mismo', () => {
    expect(distanceKm(OBELISCO, OBELISCO)).toBe(0);
  });

  it('mide una distancia corta dentro de la ciudad', () => {
    // Del Obelisco a Parque Las Heras hay unos 3,4 km en linea recta.
    expect(distanceKm(OBELISCO, PARQUE_LAS_HERAS)).toBeCloseTo(3.4, 0);
  });

  it('mide una distancia larga entre ciudades', () => {
    // Buenos Aires a La Plata: unos 53 km en linea recta.
    expect(distanceKm(OBELISCO, LA_PLATA)).toBeCloseTo(53, 0);
  });

  it('da lo mismo en un sentido que en el otro', () => {
    expect(distanceKm(OBELISCO, LA_PLATA)).toBeCloseTo(distanceKm(LA_PLATA, OBELISCO), 6);
  });
});

describe('formatDistance', () => {
  it('usa metros por debajo del kilometro', () => {
    expect(formatDistance(0.82)).toBe('800 m');
  });

  it('nunca baja de 50 metros: mas precision que esa el GPS no la sostiene', () => {
    expect(formatDistance(0.004)).toBe('50 m');
  });

  it('usa kilometros con una decimal y coma', () => {
    expect(formatDistance(3.44)).toBe('3,4 km');
  });
});

describe('isWithinRadius', () => {
  it('acepta un punto dentro del radio elegido', () => {
    expect(isWithinRadius(OBELISCO, PARQUE_LAS_HERAS, 10)).toBe(true);
  });

  it('rechaza uno que queda afuera', () => {
    expect(isWithinRadius(OBELISCO, LA_PLATA, 25)).toBe(false);
  });

  it('incluye el borde exacto del radio', () => {
    const d = distanceKm(OBELISCO, PARQUE_LAS_HERAS);
    expect(isWithinRadius(OBELISCO, PARQUE_LAS_HERAS, d)).toBe(true);
  });
});

describe('toCoarseZone', () => {
  it('borra la precision fina de una coordenada', () => {
    // Una direccion exacta cualquiera de Palermo.
    const exacta = { lat: -34.583912, lng: -58.409387 };
    expect(toCoarseZone(exacta)).toEqual({ lat: -34.58, lng: -58.41 });
  });

  it('manda a la misma celda dos casas de la misma cuadra', () => {
    const casaA = { lat: -34.58391, lng: -58.40938 };
    const casaB = { lat: -34.58402, lng: -58.40951 };
    expect(toCoarseZone(casaA)).toEqual(toCoarseZone(casaB));
  });

  it('no mueve el punto mas alla del error declarado', () => {
    const exacta = { lat: -34.589999, lng: -58.414999 };
    expect(distanceKm(exacta, toCoarseZone(exacta))).toBeLessThanOrEqual(COARSE_ERROR_KM);
  });

  it('es estable: redondear lo ya redondeado no cambia nada', () => {
    const zona = toCoarseZone({ lat: -34.583912, lng: -58.409387 });
    expect(toCoarseZone(zona)).toEqual(zona);
  });

  it('sigue sirviendo para separar barrios distintos', () => {
    // Palermo y Caballito, a unos 5 km: la zona los mantiene separados.
    const palermo = toCoarseZone({ lat: -34.5839, lng: -58.4094 });
    const caballito = toCoarseZone({ lat: -34.6190, lng: -58.4370 });
    expect(distanceKm(palermo, caballito)).toBeGreaterThan(3);
  });
});
