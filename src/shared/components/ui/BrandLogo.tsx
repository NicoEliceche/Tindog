// src/shared/components/ui/BrandLogo.tsx
import { withPublicBasePath } from '@core/routing/publicPath';

/**
 * El logo, en el tamaño que hace falta y no en el que vino del diseñador.
 *
 * El archivo original mide 1192x1320 y pesa casi 3 MB. Se muestra a 40 px en
 * la barra lateral y a 288 px como maximo en la landing, asi que el navegador
 * descargaba unas cien veces mas de lo que iba a pintar. Al lado de las dos
 * variantes hay un webp, que pesa un cuarto que el png para la misma imagen.
 *
 * Cada llamada elige la version por el ancho al que se va a ver, no por
 * comodidad: `sm` para iconos, `md` para el logo grande de portada.
 */
export type BrandLogoVariant = 'black' | 'gold';
export type BrandLogoSize = 'sm' | 'md';

export interface BrandLogoProps {
  /** Fondo sobre el que se apoya; `black` es el de la marca. */
  variant?: BrandLogoVariant;
  /** `sm` = hasta 40 px de ancho pintado. `md` = hasta 288 px. */
  size?: BrandLogoSize;
  /** Vacio cuando el nombre ya esta escrito al lado, para no repetirlo. */
  alt?: string;
  className?: string;
}

/** Ancho real del archivo, para que el navegador reserve el hueco correcto. */
const PIXELS: Record<BrandLogoSize, number> = { sm: 80, md: 576 };

/** Alto por ancho del original: 1320/1192. */
const RATIO = 1320 / 1192;

export function BrandLogo({
  variant = 'black',
  size = 'sm',
  alt = '',
  className,
}: BrandLogoProps) {
  const base = variant === 'black' ? 'tindog_patita_logo_black' : 'tindog_patita_logo';
  const width = PIXELS[size];
  const stem = `/assets/${base}-${width}`;

  return (
    <picture className={className}>
      <source srcSet={withPublicBasePath(`${stem}.webp`)} type="image/webp" />
      <img
        src={withPublicBasePath(`${stem}.png`)}
        alt={alt}
        width={width}
        height={Math.round(width * RATIO)}
        // El logo se ve en cuanto entra la pagina: esperar a que el navegador
        // decida que esta cerca del viewport solo retrasa la portada.
        loading="eager"
        decoding="async"
      />
    </picture>
  );
}
