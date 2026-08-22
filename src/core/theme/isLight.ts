// src/core/theme/isLight.ts

/**
 * Devuelve si un tema es el claro, mirando el brillo de su color de fondo.
 *
 * El tema de la web no trae una bandera propia y varios estilos necesitan
 * distinguirlo: el halo blanco de los textos que van sobre el fondo animado
 * sólo tiene sentido en claro, y en oscuro los ensucia.
 */
export function isLightBackground(background: string): boolean {
  const rgb = background.startsWith('#')
    ? [1, 3, 5].map((i) => parseInt(background.slice(i, i + 2), 16))
    : (background.match(/\d+/g) ?? ['0', '0', '0']).map(Number);
  return (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) > 140;
}
