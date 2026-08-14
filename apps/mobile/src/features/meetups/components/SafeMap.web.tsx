import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import type { Coordinates, SafeLocation } from '../../../core/types/appointment.types';

export function SafeMap({ locations, selectedId }: { locations: SafeLocation[]; selectedId: string; userCoordinates: Coordinates | null; onSelect: (id: string) => void }) {
  const selected = locations.find((item) => item.id === selectedId) ?? locations[0];
  return <View style={styles.container}><Ionicons name="map-outline" size={42} color="#D4AF37" /><Text style={styles.title}>{selected.name}</Text><Text style={styles.text}>El mapa interactivo está disponible en Android y iOS.</Text></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: '#171717' }, title: { color: '#FFF8E7', fontWeight: '900' }, text: { color: '#A99A78', fontSize: 12 } });
