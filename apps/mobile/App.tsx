import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/shared/components/Toast';
import { logoutCurrentAuthSession, restoreAuthSession } from './src/core/data/services/authService';
import { AppDataProvider } from './src/core/providers/AppDataProvider';
import { AppPreferencesProvider, useAppPreferences, useAppTheme } from './src/core/providers/AppPreferencesProvider';
import { theme as brandTheme } from './src/core/theme/tokens';
import type { AuthResponse } from './src/core/types/auth.types';
import { LoginScreen, signOutFromGoogle } from './src/features/auth';
import { LandingScreen } from './src/features/marketing';
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

/**
 * Todo lo que hay que resolver antes de mostrar nada.
 *
 * Son dos lecturas de disco independientes: la sesion y el tema elegido. La
 * pantalla de arranque se ocultaba en cuanto terminaba la sesion, sin
 * esperar al tema, asi que si la sesion resolvia primero la aplicacion se
 * pintaba en oscuro y saltaba al claro un cuadro despues. Con la cache
 * recien vaciada, que es cuando ambas lecturas tardan mas, el salto se ve.
 *
 * Va adentro del proveedor porque necesita leer `hydrated`, que es su
 * estado.
 */
function AppShell() {
  const { hydrated: preferencesReady } = useAppPreferences();
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    restoreAuthSession()
      .then((session) => { if (!cancelled) setAuth(session); })
      .finally(() => { if (!cancelled) setSessionReady(true); });
    return () => { cancelled = true; };
  }, []);

  const ready = sessionReady && preferencesReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  const handleLogout = async () => {
    await Promise.all([logoutCurrentAuthSession(), signOutFromGoogle()]);
    setAuth(null);
  };

  return (
    <ToastProvider>
      {!ready ? (
        <BootstrapScreen />
      ) : auth ? (
        <AuthenticatedApp auth={auth} onLogout={handleLogout} />
      ) : (
        <View style={[styles.app, { backgroundColor: brandTheme.colors.background }]}>
          <StatusBar style="light" />
          {/* La aplicacion abre en la portada, como la web, y el boton
              dorado lleva al ingreso. */}
          {showLogin
            ? <LoginScreen onAuthenticated={setAuth} />
            : <LandingScreen onStart={() => setShowLogin(true)} />}
        </View>
      )}
    </ToastProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.app}>
      <SafeAreaProvider>
        <AppPreferencesProvider>
          <AppShell />
        </AppPreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ app: { flex: 1 } });
