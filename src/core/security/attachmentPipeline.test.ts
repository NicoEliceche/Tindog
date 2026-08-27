import { describe, expect, it } from 'vitest';
import { attachmentKindForMime, attachmentRuleFor } from './attachmentPipeline';
import { MAX_DOCUMENT_BYTES, MAX_PHOTO_BYTES, MAX_VIDEO_BYTES } from './mediaLimits';

describe('attachmentKindForMime', () => {
  it('reconoce una foto', () => {
    expect(attachmentKindForMime('image/jpeg')).toBe('photo');
  });

  it('reconoce el formato por defecto del iPhone', () => {
    expect(attachmentKindForMime('image/heic')).toBe('photo');
  });

  it('reconoce un video', () => {
    expect(attachmentKindForMime('video/mp4')).toBe('video');
  });

  it('reconoce un PDF', () => {
    expect(attachmentKindForMime('application/pdf')).toBe('document');
  });

  it('no reconoce un ejecutable', () => {
    expect(attachmentKindForMime('application/x-msdownload')).toBeNull();
  });

  it('no reconoce un comprimido', () => {
    expect(attachmentKindForMime('application/zip')).toBeNull();
  });

  it('no reconoce un Office con macros', () => {
    expect(attachmentKindForMime('application/vnd.ms-excel.sheet.macroEnabled.12')).toBeNull();
  });
});

describe('attachmentRuleFor', () => {
  it('cada tipo lleva su propio maximo', () => {
    expect(attachmentRuleFor('photo').maxBytes).toBe(MAX_PHOTO_BYTES);
    expect(attachmentRuleFor('video').maxBytes).toBe(MAX_VIDEO_BYTES);
    expect(attachmentRuleFor('document').maxBytes).toBe(MAX_DOCUMENT_BYTES);
  });

  it('el video es el que mas peso admite', () => {
    expect(attachmentRuleFor('video').maxBytes).toBeGreaterThan(attachmentRuleFor('photo').maxBytes);
    expect(attachmentRuleFor('photo').maxBytes).toBeGreaterThan(attachmentRuleFor('document').maxBytes);
  });
});
