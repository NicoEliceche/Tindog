// src/core/data/services/attachmentUpload.ts
import { rejectDocument, rejectPhoto, rejectVideo } from '@core/security/mediaLimits';

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

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
}

/** La suma que firma la subida, en base64, como la espera S3. */
async function sha256Base64(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  // Sin propagar el arreglo: con muchos bytes eso desborda la pila de
  // argumentos, y el objetivo de compilacion no permite iterarlo.
  const view = new Uint8Array(digest);
  let binary = '';
  for (let i = 0; i < view.length; i += 1) binary += String.fromCharCode(view[i]);
  return btoa(binary);
}

/** Rechaza antes de subir, con la regla que corresponde al tipo. */
function localRejection(kind: AttachmentKind, file: { type: string; size: number }): string | null {
  if (kind === 'photo') return rejectPhoto(file);
  if (kind === 'video') return rejectVideo(file);
  return rejectDocument(file);
}

/**
 * Sube un adjunto de chat y devuelve su dirección definitiva.
 *
 * Son tres pasos, que es como funciona la subida de fotos de perfil que ya
 * existía: se pide permiso al servidor, se sube directo al almacenamiento
 * con una URL firmada, y se avisa para que valide y publique. El archivo no
 * pasa por el servidor de la aplicación en ningún momento, así que subir un
 * video de 50 MB no le ocupa memoria.
 *
 * Entre el segundo y el tercer paso el archivo está en cuarentena: sólo se
 * hace público si supera la verificación de firma y el escaneo de malware.
 */
export async function uploadChatAttachment(input: {
  conversationId: string;
  kind: AttachmentKind;
  file: Blob & { name?: string; type: string; size: number };
}): Promise<UploadOutcome> {
  const { conversationId, kind, file } = input;
  const name = file.name ?? (kind === 'photo' ? 'Foto' : kind === 'video' ? 'Video' : 'Documento');

  const rejected = localRejection(kind, file);
  if (rejected) return { error: rejected };

  try {
    const bytes = await file.arrayBuffer();
    const checksumSha256 = await sha256Base64(bytes);
    const api = getApiBaseUrl();

    // 1. Permiso: el servidor comprueba la conversación, el tipo y el tamaño.
    const authorize = await fetch(`${api}/api/media/uploads`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ purpose: 'chat_attachment', conversationId, mime: file.type, size: file.size, checksumSha256 }),
    });

    if (authorize.status === 429) return { error: 'Alcanzaste el límite de subidas por hora. Probá más tarde.' };
    if (!authorize.ok) return { error: 'No pudimos preparar la subida. Probá de nuevo.' };

    const ticket = await authorize.json() as {
      assetId: string;
      uploadUrl: string;
      requiredHeaders: Record<string, string>;
    };

    // 2. El archivo va directo al almacenamiento, sin pasar por la aplicación.
    const upload = await fetch(ticket.uploadUrl, { method: 'PUT', headers: ticket.requiredHeaders, body: file });
    if (!upload.ok) return { error: 'No pudimos subir el archivo. Revisá tu conexión.' };

    // 3. Validación y publicación.
    const finalize = await fetch(`${api}/api/media/uploads/${ticket.assetId}/finalize`, {
      method: 'POST',
      credentials: 'include',
    });

    if (finalize.status === 422) return { error: 'El archivo no pasó la revisión de seguridad.' };
    if (!finalize.ok) return { error: 'No pudimos publicar el archivo. Probá de nuevo.' };

    const published = await finalize.json() as { url: string };
    return { attachment: { kind, url: published.url, name, size: file.size } };
  } catch {
    return { error: 'No pudimos subir el archivo. Revisá tu conexión.' };
  }
}
