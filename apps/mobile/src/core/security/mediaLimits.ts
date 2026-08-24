// src/core/security/mediaLimits.ts

/**
 * Límites de la galería de una mascota, compartidos por la web y la
 * aplicación nativa para que las cuatro plataformas rechacen y acepten
 * exactamente lo mismo.
 *
 * Los números salen de medir qué produce cada dispositivo, no de una
 * estimación:
 *
 * - Un iPhone 15 guarda HEIC de ~3 MB, pero en modo compatible saca JPEG de
 *   hasta 6,5 MB. Un Android de 108 MP llega a 12 MB, y un PNG de 12 MP sin
 *   comprimir a 20. Con el tope anterior de 6 MB se rechazaban fotos
 *   legítimas de teléfonos comunes.
 * - El servidor recodifica toda imagen a WebP de 2048px, así que lo guardado
 *   ronda 200-400 KB sin importar el original: el tope protege la subida y la
 *   memoria del proceso, no el almacenamiento.
 */
export const MAX_GALLERY_PHOTOS = 10;

/** 25 MB cubre el PNG sin comprimir de 12 MP, que es el peor caso real. */
export const MAX_PHOTO_BYTES = 25 * 1024 * 1024;

/**
 * Formatos de imagen aceptados.
 *
 * HEIC/HEIF entra porque es lo que sacan los iPhone por defecto: sin esto,
 * la mitad de las fotos de iOS se rechazarían. El servidor los convierte a
 * WebP, así que el navegador nunca tiene que saber leerlos.
 */
export const ALLOWED_PHOTO_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/avif',
] as const;

export const PHOTO_ACCEPT_ATTRIBUTE = ALLOWED_PHOTO_MIMES.join(',');

/**
 * Vídeo: uno solo por mascota.
 *
 * 50 MB da unos 40 segundos en 1080p HEVC o 24 en 1080p H.264, que alcanza
 * de sobra para presentar a un perro. En 4K sólo entrarían 9 segundos, por
 * eso además se acota la duración: es un límite que la persona puede
 * controlar mientras graba, a diferencia del peso, que depende del bitrate.
 */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_SECONDS = 60;

/**
 * MP4 (H.264) y QuickTime cubren Android e iOS respectivamente, y WebM cubre
 * lo que exporta un navegador de escritorio. Los tres se reproducen sin
 * complementos en los navegadores actuales y en las dos plataformas
 * nativas.
 */
export const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
] as const;

export const VIDEO_ACCEPT_ATTRIBUTE = ALLOWED_VIDEO_MIMES.join(',');

/** Texto de ayuda, para que las cuatro plataformas digan lo mismo. */
export const PHOTO_HINT = `JPG, PNG, HEIC o WebP · hasta ${MAX_PHOTO_BYTES / 1024 / 1024} MB`;
export const VIDEO_HINT = `MP4, MOV o WebM · hasta ${MAX_VIDEO_BYTES / 1024 / 1024} MB y ${MAX_VIDEO_SECONDS}s`;

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / 1024 / 1024)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/** Motivo del rechazo, o null si el archivo entra. */
export function rejectPhoto(file: { type: string; size: number }): string | null {
  if (!ALLOWED_PHOTO_MIMES.includes(file.type as typeof ALLOWED_PHOTO_MIMES[number])) {
    return 'Formato no admitido. Usá JPG, PNG, HEIC o WebP.';
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return `La imagen pesa ${formatBytes(file.size)} y el máximo es ${formatBytes(MAX_PHOTO_BYTES)}.`;
  }
  return null;
}

export function rejectVideo(file: { type: string; size: number }): string | null {
  if (!ALLOWED_VIDEO_MIMES.includes(file.type as typeof ALLOWED_VIDEO_MIMES[number])) {
    return 'Formato no admitido. Usá MP4, MOV o WebM.';
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return `El video pesa ${formatBytes(file.size)} y el máximo es ${formatBytes(MAX_VIDEO_BYTES)}.`;
  }
  return null;
}

// ── Adjuntos del chat ───────────────────────────────────────────────────

/**
 * Documentos que se pueden adjuntar en un chat.
 *
 * La lista es corta a propósito. Un chat entre dueños de perros mueve
 * carnets de vacunación, pedigríes y resultados de estudios: eso viaja en
 * PDF o como foto. Aceptar ejecutables, comprimidos u Office con macros
 * abriría una vía de entrada para archivos dañinos sin resolver ninguna
 * necesidad real.
 *
 * Las fotos y videos del chat usan los mismos límites que la galería de una
 * mascota: salen de la misma cámara y no hay motivo para tratarlos distinto.
 */
export const ALLOWED_DOCUMENT_MIMES = [
  'application/pdf',
] as const;

export const DOCUMENT_ACCEPT_ATTRIBUTE = ALLOWED_DOCUMENT_MIMES.join(',');

/**
 * 15 MB cubre un PDF escaneado de varias páginas, que es el caso real: un
 * carnet de vacunación fotografiado página por página ronda los 8 MB.
 */
export const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024;

export const DOCUMENT_HINT = `PDF · hasta ${MAX_DOCUMENT_BYTES / 1024 / 1024} MB`;

/** Devuelve el motivo del rechazo, o null si el documento entra. */
export function rejectDocument(file: { type: string; size: number }): string | null {
  if (!ALLOWED_DOCUMENT_MIMES.includes(file.type as typeof ALLOWED_DOCUMENT_MIMES[number])) {
    return 'Sólo se pueden adjuntar archivos PDF.';
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return `El archivo pesa ${formatBytes(file.size)} y el máximo es ${formatBytes(MAX_DOCUMENT_BYTES)}.`;
  }
  return null;
}
