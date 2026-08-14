import * as SecureStore from 'expo-secure-store';
import type { AppPreferences } from '../../types/preferences.types';

// El oscuro pasó a ser el modo base del producto. La clave sube de version
// para que las preferencias guardadas antes de ese cambio no sigan forzando
// el claro a quien nunca lo eligio a proposito.
const KEY = 'tindog.preferences.v2';

export async function readPreferences(): Promise<Partial<AppPreferences> | null> {
  const value = await SecureStore.getItemAsync(KEY);
  return value ? (JSON.parse(value) as Partial<AppPreferences>) : null;
}

export async function writePreferences(value: AppPreferences): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(value));
}
