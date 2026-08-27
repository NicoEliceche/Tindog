// src/core/security/attachmentPipeline.ts
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import {
  ALLOWED_DOCUMENT_MIMES, ALLOWED_PHOTO_MIMES, ALLOWED_VIDEO_MIMES,
  MAX_DOCUMENT_BYTES, MAX_PHOTO_BYTES, MAX_VIDEO_BYTES,
} from './mediaLimits';
import { scanForMalware } from './mediaPipeline';
import { headQuarantineObject, readQuarantineObject, writeProcessedObject } from './objectStorage';

export type AttachmentKind = 'photo' | 'video' | 'document';

/** Qué acepta cada tipo, y hasta cuánto. */
const RULES: Record<AttachmentKind, { mimes: readonly string[]; maxBytes: number; extension: string }> = {
  photo: { mimes: ALLOWED_PHOTO_MIMES, maxBytes: MAX_PHOTO_BYTES, extension: 'bin' },
  video: { mimes: ALLOWED_VIDEO_MIMES, maxBytes: MAX_VIDEO_BYTES, extension: 'bin' },
  document: { mimes: ALLOWED_DOCUMENT_MIMES, maxBytes: MAX_DOCUMENT_BYTES, extension: 'pdf' },
};

export function attachmentRuleFor(kind: AttachmentKind) {
  return RULES[kind];
}

/** Deduce el tipo de adjunto a partir del mime declarado. */
export function attachmentKindForMime(mime: string): AttachmentKind | null {
  if ((ALLOWED_PHOTO_MIMES as readonly string[]).includes(mime)) return 'photo';
  if ((ALLOWED_VIDEO_MIMES as readonly string[]).includes(mime)) return 'video';
  if ((ALLOWED_DOCUMENT_MIMES as readonly string[]).includes(mime)) return 'document';
  return null;
}

export interface AttachmentResult {
  publicUrl: string;
  detectedMime: string;
  observedSize: number;
}

/**
 * Valida un adjunto de chat y lo publica.
 *
 * Sigue los mismos pasos que la tubería de imágenes -tamaño real contra el
 * declarado, suma de verificación, firma del archivo y escaneo de malware-
 * con una diferencia que conviene tener presente:
 *
 * Las fotos de perfil se recodifican con sharp, y eso es lo que garantiza
 * que lo guardado no lleve nada raro adentro. Un video o un PDF no se pueden
 * recodificar sin un transcodificador, así que acá se publican tal cual
 * llegaron. Lo que los cubre es la combinación de firma verificada -no
 * alcanza con renombrar la extensión- y escaneo de malware, que en
 * producción es obligatorio.
 *
 * Por eso la lista de documentos es sólo PDF: aceptar comprimidos o Office
 * con macros sin poder recodificarlos sería confiar únicamente en el
 * escáner.
 */
export async function processQuarantinedAttachment(input: {
  quarantineKey: string;
  declaredMime: string;
  declaredSize: number;
  checksumSha256: string;
  kind: AttachmentKind;
  processedKey: string;
}): Promise<AttachmentResult> {
  const rule = RULES[input.kind];

  const head = await headQuarantineObject(input.quarantineKey);
  const observedSize = head.ContentLength ?? 0;
  if (!observedSize || observedSize !== input.declaredSize || observedSize > rule.maxBytes) {
    throw new Error('Uploaded size does not match the signed request');
  }

  const bytes = await readQuarantineObject(input.quarantineKey, rule.maxBytes);

  const checksum = crypto.createHash('sha256').update(bytes).digest('base64');
  if (checksum !== input.checksumSha256) throw new Error('Uploaded checksum does not match');

  // La firma del archivo, no su extensión: renombrar un .exe a .pdf no pasa.
  const detected = await fileTypeFromBuffer(bytes);
  if (!detected || !rule.mimes.includes(detected.mime) || detected.mime !== input.declaredMime) {
    throw new Error('Uploaded file signature is not allowed for this attachment');
  }

  await scanForMalware(bytes);

  const publicUrl = await writeProcessedObject(input.processedKey, bytes, detected.mime);
  return { publicUrl, detectedMime: detected.mime, observedSize };
}
