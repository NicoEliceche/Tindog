import type { ThemeMode } from '../theme/tokens';

export interface AppPreferences {
  themeMode: ThemeMode;
  pushMessages: boolean;
  pushRequests: boolean;
  pushAppointments: boolean;
  safetyCheckIns: boolean;
  showOnlineStatus: boolean;
  readReceipts: boolean;
  showDistance: boolean;
  discoveryEnabled: boolean;
  maxDistanceKm: number;
  trustedContactName: string;
  healthVisibility: 'connections' | 'private';
  lostPetAlerts: boolean;
}

export const defaultPreferences: AppPreferences = {
  themeMode: 'dark',
  pushMessages: true,
  pushRequests: true,
  pushAppointments: true,
  safetyCheckIns: true,
  showOnlineStatus: false,
  readReceipts: true,
  showDistance: true,
  discoveryEnabled: true,
  maxDistanceKm: 25,
  trustedContactName: '',
  healthVisibility: 'connections',
  lostPetAlerts: true,
};
