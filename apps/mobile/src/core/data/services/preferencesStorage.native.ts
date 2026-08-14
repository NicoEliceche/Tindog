import * as SecureStore from 'expo-secure-store';
import type { AppPreferences } from '../../types/preferences.types';

const KEY = 'tindog.preferences.v1';

export async function readPreferences(): Promise<Partial<AppPreferences> | null> {
  const value = await SecureStore.getItemAsync(KEY);
  return value ? (JSON.parse(value) as Partial<AppPreferences>) : null;
}

export async function writePreferences(value: AppPreferences): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(value));
}
