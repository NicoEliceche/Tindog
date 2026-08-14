import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getStoredAuthToken } from './authTokenStorage';

export async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tindog-social', {
      name: 'Mensajes y citas',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
    });
  }
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.granted ? existing : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (projectId) {
    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId }).catch(() => null);
    const authToken = await getStoredAuthToken();
    const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
    if (pushToken?.data && authToken && apiUrl && (Platform.OS === 'android' || Platform.OS === 'ios')) {
      await fetch(`${apiUrl}/api/devices`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }, body: JSON.stringify({ token: pushToken.data, platform: Platform.OS }) }).catch(() => undefined);
    }
  }
  return true;
}
