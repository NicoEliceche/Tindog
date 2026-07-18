// src/core/crypto/keyStorage.ts
// La private key NUNCA existe como string en memoria JS.
// Se genera como CryptoKeyPair con extractable: false y se persiste en IndexedDB.

const DB_NAME   = 'tindog-keystore';
const KEY_STORE = 'rsa-keypair';

async function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(KEY_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

export async function getOrCreateKeyPair(): Promise<CryptoKeyPair> {
  // SSR Check
  if (typeof window === 'undefined') {
    throw new Error('KeyStorage only available in browser');
  }

  const db    = await openDb();
  const store = db.transaction(KEY_STORE, 'readonly').objectStore(KEY_STORE);

  const existing = await new Promise<CryptoKeyPair | undefined>((res, rej) => {
    const req = store.get('keypair');
    req.onsuccess = () => res(req.result);
    req.onerror   = () => rej(req.error);
  });

  if (existing) return existing;

  // Generar con extractable: false — la clave privada no puede ser exportada
  const keypair = await window.crypto.subtle.generateKey(
    { 
      name: 'RSA-PSS', 
      modulusLength: 2048, 
      publicExponent: new Uint8Array([1, 0, 1]), 
      hash: 'SHA-256' 
    },
    false,        // ← extractable: false es clave
    ['sign', 'verify'],
  );

  const write = db.transaction(KEY_STORE, 'readwrite').objectStore(KEY_STORE);
  await new Promise<void>((res, rej) => {
    const req = write.put(keypair, 'keypair');
    req.onsuccess = () => res();
    req.onerror   = () => rej(req.error);
  });

  return keypair;
}

export async function signMessage(message: string, privateKey: CryptoKey): Promise<string> {
  const encoded  = new TextEncoder().encode(message);
  const sigBytes = await window.crypto.subtle.sign(
    { name: 'RSA-PSS', saltLength: 32 },
    privateKey,
    encoded,
  );
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(sigBytes))));
}
