import * as DocumentPicker from 'expo-document-picker';
import { ALLOWED_DOCUMENT_MIMES, rejectDocument } from '../../security/mediaLimits';

export interface PickedDocument {
  uri: string;
  name: string;
  size: number;
}

export interface DocumentPickResult {
  document?: PickedDocument;
  /** Motivo por el que no entró, para mostrarlo tal cual. */
  error?: string;
}

/**
 * Elige un documento para adjuntar a un mensaje.
 *
 * Se valida acá y no sólo en el servidor porque el aviso tiene que llegar
 * antes de subir: en un teléfono, descubrir a los 20 MB que el archivo no
 * servía es una espera perdida. Son las mismas reglas que usa la web.
 */
export async function pickDocument(): Promise<DocumentPickResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [...ALLOWED_DOCUMENT_MIMES],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return {};

  const asset = result.assets[0];
  if (!asset) return {};

  const rejected = rejectDocument({
    // El selector no siempre informa el tipo; si falta, se asume PDF, que es
    // lo único que se le pidió.
    type: asset.mimeType ?? 'application/pdf',
    size: asset.size ?? 0,
  });
  if (rejected) return { error: rejected };

  return {
    document: {
      uri: asset.uri,
      name: asset.name,
      size: asset.size ?? 0,
    },
  };
}
