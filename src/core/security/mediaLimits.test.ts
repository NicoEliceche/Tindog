import { describe, expect, it } from 'vitest';
import {
  MAX_GALLERY_PHOTOS,
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
  rejectDocument,
  rejectPhoto,
  rejectVideo,
} from './mediaLimits';

describe('limites de la galeria', () => {
  it('acepta el HEIC que sacan los iPhone por defecto', () => {
    expect(rejectPhoto({ type: 'image/heic', size: 3 * 1024 * 1024 })).toBeNull();
  });

  it('acepta el JPEG de 6,5MB de un iPhone en modo compatible', () => {
    expect(rejectPhoto({ type: 'image/jpeg', size: 6.5 * 1024 * 1024 })).toBeNull();
  });

  it('acepta el JPEG de 12MB de un Android de 108MP', () => {
    expect(rejectPhoto({ type: 'image/jpeg', size: 12 * 1024 * 1024 })).toBeNull();
  });

  it('rechaza una imagen por encima del tope y dice cuanto pesa', () => {
    const motivo = rejectPhoto({ type: 'image/png', size: MAX_PHOTO_BYTES + 1 });
    expect(motivo).toMatch(/25 MB/);
  });

  it('rechaza un formato que el servidor no sabe decodificar', () => {
    expect(rejectPhoto({ type: 'image/gif', size: 1024 })).toMatch(/Formato/);
  });

  it('acepta MP4, MOV y WebM', () => {
    for (const type of ['video/mp4', 'video/quicktime', 'video/webm']) {
      expect(rejectVideo({ type, size: 10 * 1024 * 1024 })).toBeNull();
    }
  });

  it('rechaza un video por encima del tope', () => {
    expect(rejectVideo({ type: 'video/mp4', size: MAX_VIDEO_BYTES + 1 })).toMatch(/50 MB/);
  });

  it('permite diez fotos', () => {
    expect(MAX_GALLERY_PHOTOS).toBe(10);
  });
});

describe('rejectDocument', () => {
  it('acepta un PDF de tamaño razonable', () => {
    expect(rejectDocument({ type: 'application/pdf', size: 8 * 1024 * 1024 })).toBeNull();
  });

  it('rechaza un ejecutable, aunque pese poco', () => {
    expect(rejectDocument({ type: 'application/x-msdownload', size: 1000 })).toContain('PDF');
  });

  it('rechaza un comprimido: puede traer cualquier cosa adentro', () => {
    expect(rejectDocument({ type: 'application/zip', size: 1000 })).toContain('PDF');
  });

  it('rechaza un PDF que pasa el máximo', () => {
    const reason = rejectDocument({ type: 'application/pdf', size: 20 * 1024 * 1024 });
    expect(reason).toContain('máximo');
  });
});
