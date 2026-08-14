import type { AppPreferences } from '../../types/preferences.types';

// Ver nota en preferencesStorage.native.ts: el oscuro es el modo base y la
// clave sube de version para no arrastrar el claro guardado previamente.
const KEY = 'tindog.preferences.v2';

export async function readPreferences(): Promise<Partial<AppPreferences> | null> {
  const value = globalThis.localStorage?.getItem(KEY);
  return value ? (JSON.parse(value) as Partial<AppPreferences>) : null;
}

export async function writePreferences(value: AppPreferences): Promise<void> {
  globalThis.localStorage?.setItem(KEY, JSON.stringify(value));
}
