import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { readPreferences, writePreferences } from '../data/services/preferencesStorage';
import { darkTheme, lightTheme, type AppTheme } from '../theme/tokens';
import { defaultPreferences, type AppPreferences } from '../types/preferences.types';

interface PreferencesContextValue {
  preferences: AppPreferences;
  theme: AppTheme;
  hydrated: boolean;
  updatePreference: <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    readPreferences()
      .then((stored) => {
        if (mounted && stored) {
          setPreferences((current) => ({ ...current, ...stored }));
        }
      })
      .catch(() => undefined)
      .finally(() => mounted && setHydrated(true));
    return () => { mounted = false; };
  }, []);

  const updatePreference = <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
    setPreferences((current) => {
      const next = { ...current, [key]: value };
      writePreferences(next).catch(() => undefined);
      return next;
    });
  };

  const resolvedMode = preferences.themeMode === 'system'
    ? (systemScheme === 'light' ? 'light' : 'dark')
    : preferences.themeMode;
  const activeTheme = resolvedMode === 'light' ? lightTheme : darkTheme;
  const value = useMemo(
    () => ({ preferences, theme: activeTheme, hydrated, updatePreference }),
    [activeTheme, hydrated, preferences],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useAppPreferences(): PreferencesContextValue {
  const value = useContext(PreferencesContext);
  if (!value) {
    throw new Error('useAppPreferences must be used inside AppPreferencesProvider');
  }
  return value;
}

export function useAppTheme(): AppTheme {
  return useAppPreferences().theme;
}
