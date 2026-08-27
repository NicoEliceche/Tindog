import * as Crypto from 'expo-crypto';
import { rejectDocument, rejectPhoto, rejectVideo } from '../../security/mediaLimits';

export type AttachmentKind = 'photo' | 'video' | 'document';

export interface UploadedAttachment {
  kind: AttachmentKind;
  url: string;
  name: string;
  size: number;
}

export interface UploadOutcome {
  attachment?: UploadedAttachment;
  /** Motivo del fallo, listo para mostrar. */
  error?: string;
}

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';

/** Rechaza antes de subir, con la regla que corresponde al tipo. */
function localRejection(kind: AttachmentKind, file: { type: string; size: number }): string | null {
  if (kind === 'photo') return rejectPhoto(file);
  if (kind === 'video') return rejectVideo(file);
  return rejectDocument(file);
}

/**
 * Sube un adjunto de chat y devuelve su dirección definitiva.
 *
 * Es la misma secuencia de tres pasos que en la web -permiso, subida directa
 * al almacenamiento, publicación- pero acá el archivo vive como URI del
 * dispositivo, no como Blob, así que la suma de verificación se calcula
 * leyéndolo en base64 y la subida usa el cargador de expo-file-system, que
 * no carga el archivo entero en memoria.
 */
export async function uploadChatAttachment(input: {
  conversationId: string;
  kind: AttachmentKind;
  uri: string;
  name: string;
  mime: string;
  size: number;
}): Promise<UploadOutcome> {
  const { conversationId, kind, uri, name, mime, size } = input;

  const rejected = localRejection(kind, { type: mime, size });
  if (rejected) return { error: rejected };

  try {
    // El archivo se lee una sola vez y se reutiliza para la suma y la subida.
    const blob = await (await fetch(uri)).blob();
    const buffer = await new Response(blob).arrayBuffer();

    // La suma de verificación en base64, como la espera el almacenamiento.
    const view = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < view.length; i += 1) binary += String.fromCharCode(view[i]);
    const checksumSha256 = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      btoa(binary),
      { encoding: Crypto.CryptoEncoding.BASE64 },
    );

    // 1. Permiso: el servidor comprueba la conversación, el tipo y el tamaño.
    const authorize = await fetch(`${apiUrl}/api/media/uploads`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ purpose: 'chat_attachment', conversationId, mime, size, checksumSha256 }),
    });

    if (authorize.status === 429) return { error: 'Alcanzaste el límite de subidas por hora. Probá más tarde.' };
    if (!authorize.ok) return { error: 'No pudimos preparar la subida. Probá de nuevo.' };

    const ticket = await authorize.json() as {
      assetId: string;
      uploadUrl: string;
      requiredHeaders: Record<string, string>;
    };

    // 2. El archivo va directo al almacenamiento, sin pasar por la aplicación.
    const upload = await fetch(ticket.uploadUrl, { method: 'PUT', headers: ticket.requiredHeaders, body: blob });
    if (!upload.ok) return { error: 'No pudimos subir el archivo. Revisá tu conexión.' };

    // 3. Validación y publicación.
    const finalize = await fetch(`${apiUrl}/api/media/uploads/${ticket.assetId}/finalize`, {
      method: 'POST',
      credentials: 'include',
    });

    if (finalize.status === 422) return { error: 'El archivo no pasó la revisión de seguridad.' };
    if (!finalize.ok) return { error: 'No pudimos publicar el archivo. Probá de nuevo.' };

    const published = await finalize.json() as { url: string };
    return { attachment: { kind, url: published.url, name, size } };
  } catch {
    return { error: 'No pudimos subir el archivo. Revisá tu conexión.' };
  }
}
