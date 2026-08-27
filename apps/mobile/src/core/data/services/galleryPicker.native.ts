import * as ImagePicker from 'expo-image-picker';
import {
  MAX_VIDEO_SECONDS, rejectPhoto, rejectVideo,
} from '../../security/mediaLimits';

export interface PickedMedia {
  uri: string;
  kind: 'photo' | 'video';
  /** Tipo real del archivo, que hace falta para firmar la subida. */
  mime: string;
  /** Tamano en bytes, para validar antes de subir. */
  size: number;
}

export interface PickResult {
  media: PickedMedia[];
  /** Motivo por el que algo no entró, para mostrarlo tal cual. */
  error?: string;
}

/**
 * Elige hasta `limit` fotos de la galería.
 *
 * Se valida acá y no sólo en el servidor porque el aviso tiene que llegar
 * antes de subir: en un teléfono, descubrir a los 20 MB que el archivo no
 * servía es una espera perdida.
 */
export async function pickGalleryPhotos(limit: number): Promise<PickResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { media: [], error: 'Necesitamos permiso para ver tus fotos.' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 0.9,
  });
  if (result.canceled) return { media: [] };

  const media: PickedMedia[] = [];
  for (const asset of result.assets) {
    const rejected = rejectPhoto({
      // El picker no siempre informa el tipo; si falta, se asume JPEG, que
      // es lo que devuelve por defecto en las dos plataformas.
      type: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize ?? 0,
    });
    if (rejected) return { media, error: rejected };
    media.push({ uri: asset.uri, kind: 'photo', mime: asset.mimeType ?? 'image/jpeg', size: asset.fileSize ?? 0 });
  }

  return { media };
}

/** Elige un video y valida formato, peso y duración antes de aceptarlo. */
export async function pickGalleryVideo(): Promise<PickResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { media: [], error: 'Necesitamos permiso para ver tus videos.' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    // El picker corta la grabación en este punto; el chequeo de abajo cubre
    // los videos que ya estaban en el carrete.
    videoMaxDuration: MAX_VIDEO_SECONDS,
    quality: 1,
  });
  if (result.canceled) return { media: [] };

  const asset = result.assets[0];
  if (!asset) return { media: [] };

  const rejected = rejectVideo({
    type: asset.mimeType ?? 'video/mp4',
    size: asset.fileSize ?? 0,
  });
  if (rejected) return { media: [], error: rejected };

  // `duration` viene en milisegundos.
  const seconds = (asset.duration ?? 0) / 1000;
  if (seconds > MAX_VIDEO_SECONDS) {
    return {
      media: [],
      error: `El video dura ${Math.round(seconds)}s y el máximo es ${MAX_VIDEO_SECONDS}s.`,
    };
  }

  return { media: [{ uri: asset.uri, kind: 'video', mime: asset.mimeType ?? 'video/mp4', size: asset.fileSize ?? 0 }] };
}
