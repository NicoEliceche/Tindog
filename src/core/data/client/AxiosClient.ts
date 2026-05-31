// src/core/data/client/AxiosClient.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getOrCreateKeyPair, signMessage } from '@core/crypto/keyStorage';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry412?: boolean;
  _skipRateLimit?: boolean;
}

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
  withCredentials: true,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Request interceptor ────────────────────────────────────────────────────────
client.interceptors.request.use(
  async (config) => {
    // SSR Check
    if (typeof window === 'undefined') return config;

    const xAuth = config.headers.get?.('x-authorization');

    if (xAuth) {
      let deviceId = sessionStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = window.crypto.randomUUID();
        sessionStorage.setItem('device_id', deviceId);
      }

      // Firma dinámica: device_id:timestamp:path:method:nonce
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce     = Array.from(window.crypto.getRandomValues(new Uint8Array(32)))
                          .map(b => b.toString(16).padStart(2, '0')).join('');

      const rawUrl = config.url ?? '/';
      const path   = rawUrl.replace(/^https?:\/\/[^/]+/, '').split('?')[0] || '/';
      const method = (config.method ?? 'GET').toUpperCase();

      const message   = `${deviceId}:${timestamp}:${path}:${method}:${nonce}`;
      
      try {
        const { privateKey } = await getOrCreateKeyPair();
        const signature = await signMessage(message, privateKey);

        config.headers.set('signature',           signature);
        config.headers.set('signature-timestamp', timestamp.toString());
        config.headers.set('signature-nonce',     nonce);
        config.headers.set('x-device-id',         deviceId);
      } catch (error) {
        console.error('Failed to sign request:', error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ───────────────────────────────────────────────────────
client.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    // SSR Check
    if (typeof window === 'undefined') return Promise.reject(error);

    const originalRequest: CustomAxiosRequestConfig = error.config;
    if (!error.response) return Promise.reject(error);

    const { status } = error.response;

    // 412: device no registrado — flujo simplificado para el prototipo
    if (status === 412 && !originalRequest._retry412) {
      originalRequest._retry412 = true;
      // Aquí iría el registro del dispositivo
      return client(originalRequest);
    }

    // 401: sesión expirada
    if (status === 401) {
      window.location.replace('/');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default client;
export { client };
