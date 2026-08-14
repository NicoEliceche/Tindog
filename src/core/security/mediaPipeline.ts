import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import { moderateImage } from '@core/security/moderation';
import { headQuarantineObject, readQuarantineObject, writeProcessedObject } from '@core/security/objectStorage';

export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 25_000_000;
export const ALLOWED_IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function scanForMalware(bytes: Uint8Array): Promise<void> {
  const url = process.env.MALWARE_SCANNER_URL;
  const token = process.env.MALWARE_SCANNER_TOKEN;
  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') throw new Error('Malware scanner is unavailable');
    return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/octet-stream' }, body: Buffer.from(bytes), signal: controller.signal });
    if (!response.ok) throw new Error('Malware scanner failed');
    const result = await response.json() as { clean?: unknown };
    if (result.clean !== true) throw new Error('Malware scanner rejected the file');
  } finally {
    clearTimeout(timeout);
  }
}

export async function processQuarantinedImage(input: {
  quarantineKey: string;
  declaredMime: string;
  declaredSize: number;
  checksumSha256: string;
  processedKey: string;
}) {
  const head = await headQuarantineObject(input.quarantineKey);
  const observedSize = Number(head.ContentLength ?? 0);
  if (!observedSize || observedSize !== input.declaredSize || observedSize > MAX_IMAGE_BYTES) throw new Error('Uploaded size does not match the signed request');
  const bytes = await readQuarantineObject(input.quarantineKey, MAX_IMAGE_BYTES);
  const checksum = crypto.createHash('sha256').update(bytes).digest('base64');
  if (checksum !== input.checksumSha256) throw new Error('Uploaded checksum does not match');
  const detected = await fileTypeFromBuffer(bytes);
  if (!detected || !ALLOWED_IMAGE_MIMES.has(detected.mime) || detected.mime !== input.declaredMime) throw new Error('Uploaded file signature is not an allowed image');
  await scanForMalware(bytes);
  const image = sharp(bytes, { failOn: 'warning', limitInputPixels: MAX_IMAGE_PIXELS, animated: false, sequentialRead: true });
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_IMAGE_PIXELS || (metadata.pages ?? 1) !== 1) throw new Error('Image dimensions or frame count are not allowed');
  const processed = await image.rotate().resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85, effort: 4 }).toBuffer();
  const decision = await moderateImage(`data:image/webp;base64,${processed.toString('base64')}`);
  if (!decision.allowed) return { allowed: false as const, observedSize, detectedMime: detected.mime, width: metadata.width, height: metadata.height, labels: decision.labels, decision };
  const publicUrl = await writeProcessedObject(input.processedKey, processed, 'image/webp');
  return { allowed: true as const, observedSize, detectedMime: detected.mime, width: metadata.width, height: metadata.height, labels: decision.labels, decision, publicUrl };
}
