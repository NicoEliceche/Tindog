import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { logoutCurrentAuthSession, restoreAuthSession } from './src/core/data/services/authService';
import { AppDataProvider } from './src/core/providers/AppDataProvider';
import { AppPreferencesProvider, useAppTheme } from './src/core/providers/AppPreferencesProvider';
import { theme as brandTheme } from './src/core/theme/tokens';
import type { AuthResponse } from './src/core/types/auth.types';
import { LoginScreen, signOutFromGoogle } from './src/features/auth';
import { BootstrapScreen } from './src/features/bootstrap';
import { AppNavigator } from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
SplashScreen.setOptions({ duration: 300, fade: true });

function AuthenticatedApp({ auth, onLogout }: { auth: AuthResponse; onLogout: () => Promise<void> }) {
  const theme = useAppTheme();
  return (
    <View style={[styles.app, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <AppDataProvider user={auth.user}>
        <AppNavigator onLogout={onLogout} />
      </AppDataProvider>
    </View>
  );
}

export default function App() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    restoreAuthSession()
      .then((session) => { if (!cancelled) setAuth(session); })
      .finally(() => { if (!cancelled) setIsHydrating(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!isHydrating) SplashScreen.hideAsync().catch(() => undefined);
  }, [isHydrating]);

  const handleLogout = async () => {
    await Promise.all([logoutCurrentAuthSession(), signOutFromGoogle()]);
    setAuth(null);
  };

  return (
    <GestureHandlerRootView style={styles.app}>
      <SafeAreaProvider>
        <AppPreferencesProvider>
          {isHydrating ? (
            <BootstrapScreen />
          ) : auth ? (
            <AuthenticatedApp auth={auth} onLogout={handleLogout} />
          ) : (
            <View style={[styles.app, { backgroundColor: brandTheme.colors.background }]}>
              <StatusBar style="light" />
              <LoginScreen onAuthenticated={setAuth} />
            </View>
          )}
        </AppPreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ app: { flex: 1 } });
