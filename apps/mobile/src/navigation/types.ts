import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Messages: undefined;
  Appointments: undefined;
  Pets: NavigatorScreenParams<PetsStackParamList> | undefined;
  Profile: undefined;
};

export type PetsStackParamList = {
  PetsList: undefined;
  PetForm: { petId?: string } | undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  PetProfile: { petId: string };
  ChatRoom: { conversationId: string };
  AppointmentPlanner: { conversationId: string };
  SafeLocations: { conversationId?: string; appointmentId?: string; startAt?: string } | undefined;
  LocationReviews: { locationId: string; appointmentId?: string };
  Requests: undefined;
  Saved: undefined;
  Safety: undefined;
  Settings: undefined;
};
