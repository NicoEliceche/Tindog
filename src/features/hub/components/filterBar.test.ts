import { describe, expect, it } from 'vitest';
import { monthLabel, withinRange } from './FilterBar';

describe('withinRange', () => {
  const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  it('acepta cualquier fecha cuando no hay filtro', () => {
    expect(withinRange(daysAgo(500), 'all')).toBe(true);
  });

  it('incluye lo que cae dentro de la ventana', () => {
    expect(withinRange(daysAgo(3), '7d')).toBe(true);
    expect(withinRange(daysAgo(20), '30d')).toBe(true);
    expect(withinRange(daysAgo(80), '90d')).toBe(true);
  });

  it('excluye lo anterior a la ventana', () => {
    expect(withinRange(daysAgo(10), '7d')).toBe(false);
    expect(withinRange(daysAgo(45), '30d')).toBe(false);
    expect(withinRange(daysAgo(120), '90d')).toBe(false);
  });

  it('trata el borde exacto como incluido', () => {
    // Un margen de un segundo evita que el tiempo transcurrido durante la
    // propia ejecución vuelva intermitente la prueba.
    const casiSieteDias = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000 - 1000));
    expect(withinRange(casiSieteDias, '7d')).toBe(true);
  });

  it('acepta fechas futuras: una cita agendada sigue siendo reciente', () => {
    expect(withinRange(daysAgo(-2), '7d')).toBe(true);
  });
});

describe('monthLabel', () => {
  it('devuelve mes y año, que es la clave de agrupación', () => {
    const etiqueta = monthLabel(new Date('2026-08-11T14:20:00Z'));
    expect(etiqueta).toContain('2026');
    expect(etiqueta.toLowerCase()).toContain('agosto');
  });

  it('agrupa dos fechas del mismo mes bajo la misma clave', () => {
    expect(monthLabel(new Date('2026-08-01T10:00:00Z')))
      .toBe(monthLabel(new Date('2026-08-28T22:00:00Z')));
  });

  it('separa meses distintos', () => {
    expect(monthLabel(new Date('2026-07-31T23:00:00Z')))
      .not.toBe(monthLabel(new Date('2026-09-01T01:00:00Z')));
  });
});
