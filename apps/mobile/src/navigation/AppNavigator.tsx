import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { RequestsScreen } from '../features/hub/screens/RequestsScreen';
import { SafetyScreen } from '../features/hub/screens/SafetyScreen';
import { SavedScreen } from '../features/hub/screens/SavedScreen';
import { AuroraBackground } from '../shared/components/AuroraBackground';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../core/providers/AppPreferencesProvider';
import { AppointmentsScreen } from '../features/appointments';
import { ChatListScreen, ChatRoomScreen } from '../features/chat';
import { DiscoveryScreen } from '../features/discovery';
import { AppointmentPlannerScreen, LocationReviewsScreen, SafeLocationsScreen } from '../features/meetups';
import { PetFormScreen, PetProfileScreen, PetsScreen } from '../features/pets';
import { ProfileScreen, SettingsScreen } from '../features/profile';
import type { MainTabParamList, RootStackParamList } from './types';

const Tabs = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const tabIcons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  // La pata pasó a ser el motivo del fondo animado; acá va la casa, que es
  // el símbolo convencional de inicio y no compite con ese fondo.
  Home: 'home-outline',
  Messages: 'chatbubble-ellipses-outline',
  Appointments: 'calendar-outline',
  Pets: 'heart-circle-outline',
  Profile: 'person-outline',
};

const tabLabels: Record<keyof MainTabParamList, string> = {
  Home: 'Inicio',
  Messages: 'Mensajes',
  Appointments: 'Citas',
  Pets: 'Mis perros',
  Profile: 'Perfil',
};

function MainTabs({ onLogout }: { onLogout: () => Promise<void> }) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 6);

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        // Sin esto, el contenedor de las pantallas pinta su propio fondo y
        // tapa el canvas animado que vive detrás del navegador.
        sceneStyle: { backgroundColor: 'transparent' },
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 60 + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          elevation: 16,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
        tabBarLabel: tabLabels[route.name],
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? tabIcons[route.name].replace('-outline', '') as keyof typeof Ionicons.glyphMap : tabIcons[route.name]} size={23} color={color} />
        ),
      })}
    >
      <Tabs.Screen name="Home" component={DiscoveryScreen} />
      <Tabs.Screen name="Messages" component={ChatListScreen} />
      <Tabs.Screen name="Appointments" component={AppointmentsScreen} />
      <Tabs.Screen name="Pets" component={PetsScreen} />
      <Tabs.Screen name="Profile">
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

export function AppNavigator({ onLogout }: { onLogout: () => Promise<void> }) {
  const theme = useAppTheme();
  const navigationTheme = useMemo(() => ({
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  }), [theme]);

  return (
    <NavigationContainer theme={navigationTheme}>
      {/* El fondo animado va acá y no dentro de cada pantalla: en la web vive
          en el layout, así que se mantiene al navegar. Antes sólo estaba en
          el ingreso y en el descubrimiento, y desaparecía en el resto. */}
      <AuroraBackground theme={theme} />
      <Stack.Navigator
        screenOptions={{
          // Sin `headerTransparent`: con él, el contenido arranca debajo de
          // la barra y el título se superpone con lo primero de la pantalla.
          // El fondo animado igual se ve, porque el header usa un color
          // traslúcido en vez de tapar.
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerTitleStyle: { fontWeight: '900' },
          headerShadowVisible: false,
          // Transparente para que el fondo se vea a través de las pantallas.
          contentStyle: { backgroundColor: 'transparent' },
          animation: Platform.OS === 'android' ? 'fade_from_bottom' : 'default',
        }}
      >
        <Stack.Screen name="Main" options={{ headerShown: false }}>
          {() => <MainTabs onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen name="PetProfile" component={PetProfileScreen} options={{ title: 'Panel de mascota' }} />
        {/* El chat dibuja su propio encabezado (foto, nombre, mascota, escudo)
            en una sola barra, como en la web. La barra del stack quedaba
            encima repitiendo la flecha y el titulo. */}
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AppointmentPlanner" component={AppointmentPlannerScreen} options={{ title: 'Agendar encuentro', presentation: 'modal' }} />
        <Stack.Screen name="SafeLocations" component={SafeLocationsScreen} options={{ title: 'Puntos recomendados' }} />
        <Stack.Screen name="LocationReviews" component={LocationReviewsScreen} options={{ title: 'Reseñas del punto' }} />
        <Stack.Screen name="PetForm" component={PetFormScreen} options={{ title: 'Nueva mascota' }} />
        <Stack.Screen name="Requests" component={RequestsScreen} options={{ title: 'Solicitudes' }} />
        <Stack.Screen name="Saved" component={SavedScreen} options={{ title: 'Guardados' }} />
        <Stack.Screen name="Safety" component={SafetyScreen} options={{ title: 'Seguridad' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configuración' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
