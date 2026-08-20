import type { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Cada pestaña tiene su propia pila. Lo que se abre desde una sección de la
 * barra vive dentro de esa pila y no en la general, para que la barra
 * inferior no desaparezca.
 */
export type MessagesStackParamList = {
  ChatList: undefined;
  ChatRoom: { conversationId: string };
  SafeLocations: { conversationId?: string; appointmentId?: string; startAt?: string } | undefined;
};

export type AppointmentsStackParamList = {
  AppointmentsList: undefined;
  SafeLocations: { conversationId?: string; appointmentId?: string; startAt?: string } | undefined;
  LocationReviews: { locationId: string; appointmentId?: string };
};

export type PetsStackParamList = {
  PetsList: undefined;
  PetProfile: { petId: string };
  PetForm: { petId?: string } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Messages: NavigatorScreenParams<MessagesStackParamList> | undefined;
  Appointments: NavigatorScreenParams<AppointmentsStackParamList> | undefined;
  Pets: NavigatorScreenParams<PetsStackParamList> | undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Requests: undefined;
  Saved: undefined;
  Safety: undefined;
  Settings: undefined;
};
