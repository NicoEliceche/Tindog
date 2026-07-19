import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoginScreen } from './src/features/auth';
import { DiscoveryScreen } from './src/features/discovery';
import { ChatListScreen } from './src/features/chat';
import { PetsScreen } from './src/features/pets';
import { ProfileScreen } from './src/features/profile';
import { BottomTabs, type TabKey } from './src/shared/layout/BottomTabs';
import { theme } from './src/core/theme/tokens';
import type { AuthResponse } from './src/core/types/auth.types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('discovery');
  const [auth, setAuth] = useState<AuthResponse | null>(null);

  const renderScreen = () => {
    switch (activeTab) {
      case 'pets':
        return <PetsScreen />;
      case 'chat':
        return <ChatListScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'discovery':
      default:
        return <DiscoveryScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        <StatusBar style="dark" />
        {auth ? (
          <>
            <View style={styles.content}>{renderScreen()}</View>
            <BottomTabs activeTab={activeTab} onChange={setActiveTab} />
          </>
        ) : (
          <LoginScreen onAuthenticated={setAuth} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
});
