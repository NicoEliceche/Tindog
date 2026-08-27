import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let client: S3Client | undefined;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function storageClient(): S3Client {
  if (client) return client;
  client = new S3Client({
    region: required('OBJECT_STORAGE_REGION'),
    endpoint: process.env.OBJECT_STORAGE_ENDPOINT || undefined,
    forcePathStyle: process.env.OBJECT_STORAGE_FORCE_PATH_STYLE === 'true',
    credentials: {
      accessKeyId: required('OBJECT_STORAGE_ACCESS_KEY_ID'),
      secretAccessKey: required('OBJECT_STORAGE_SECRET_ACCESS_KEY'),
    },
  });
  return client;
}

export const storageBuckets = {
  quarantine: () => required('OBJECT_STORAGE_QUARANTINE_BUCKET'),
  processed: () => required('OBJECT_STORAGE_PROCESSED_BUCKET'),
  exports: () => process.env.OBJECT_STORAGE_EXPORT_BUCKET || required('OBJECT_STORAGE_QUARANTINE_BUCKET'),
};

/**
 * URL firmada para subir a cuarentena.
 *
 * No mira el tipo: la firma ata la clave, el tamano y la suma de
 * verificacion, y quien valida el contenido es la tuberia al finalizar. Se
 * usa igual para fotos, videos y documentos.
 */
export async function createPresignedUpload(input: { key: string; mime: string; size: number; checksumSha256: string }) {
  const command = new PutObjectCommand({
    Bucket: storageBuckets.quarantine(),
    Key: input.key,
    ContentType: input.mime,
    ContentLength: input.size,
    ChecksumSHA256: input.checksumSha256,
    Metadata: { upload: 'tindog-quarantine-v1' },
  });
  return getSignedUrl(storageClient(), command, { expiresIn: 5 * 60 });
}

/** Nombre anterior, conservado para no tocar las rutas que ya lo usan. */
export const createPresignedImageUpload = createPresignedUpload;

export async function headQuarantineObject(key: string) {
  return storageClient().send(new HeadObjectCommand({ Bucket: storageBuckets.quarantine(), Key: key, ChecksumMode: 'ENABLED' }));
}

export async function readQuarantineObject(key: string, maxBytes: number): Promise<Uint8Array> {
  const result = await storageClient().send(new GetObjectCommand({ Bucket: storageBuckets.quarantine(), Key: key }));
  if (!result.Body) throw new Error('Uploaded object is empty');
  const bytes = await result.Body.transformToByteArray();
  if (bytes.byteLength > maxBytes) throw new Error('Uploaded object exceeds the size limit');
  return bytes;
}

export async function writeProcessedObject(key: string, body: Uint8Array, mime: string): Promise<string> {
  await storageClient().send(new PutObjectCommand({
    Bucket: storageBuckets.processed(),
    Key: key,
    Body: body,
    ContentType: mime,
    CacheControl: 'public, max-age=31536000, immutable',
    Metadata: { processed: 'tindog-media-v1' },
  }));
  return `${required('MEDIA_PUBLIC_BASE_URL').replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

export async function writePrivateExport(key: string, body: Uint8Array): Promise<void> {
  await storageClient().send(new PutObjectCommand({
    Bucket: storageBuckets.exports(),
    Key: key,
    Body: body,
    ContentType: 'application/json',
    CacheControl: 'no-store',
    ServerSideEncryption: process.env.OBJECT_STORAGE_SSE_ALGORITHM === 'aws:kms' ? 'aws:kms' : 'AES256',
  }));
}

export async function createPresignedExportDownload(key: string): Promise<string> {
  return getSignedUrl(storageClient(), new GetObjectCommand({ Bucket: storageBuckets.exports(), Key: key, ResponseContentType: 'application/json' }), { expiresIn: 5 * 60 });
}

export async function deleteStorageObject(bucket: 'quarantine' | 'processed' | 'exports', key: string): Promise<void> {
  await storageClient().send(new DeleteObjectCommand({ Bucket: storageBuckets[bucket](), Key: key }));
}
