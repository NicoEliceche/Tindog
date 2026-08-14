import type { AppPreferences } from '../../types/preferences.types';

const KEY = 'tindog.preferences.v1';

export async function readPreferences(): Promise<Partial<AppPreferences> | null> {
  const value = globalThis.localStorage?.getItem(KEY);
  return value ? (JSON.parse(value) as Partial<AppPreferences>) : null;
}

export async function writePreferences(value: AppPreferences): Promise<void> {
  globalThis.localStorage?.setItem(KEY, JSON.stringify(value));
}
