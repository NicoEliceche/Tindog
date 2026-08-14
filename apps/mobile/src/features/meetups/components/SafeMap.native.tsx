import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import type { Coordinates, SafeLocation } from '../../../core/types/appointment.types';

export function SafeMap({ locations, selectedId, userCoordinates, onSelect }: { locations: SafeLocation[]; selectedId: string; userCoordinates: Coordinates | null; onSelect: (id: string) => void }) {
  const selected = locations.find((item) => item.id === selectedId) ?? locations[0];
  return <View style={styles.container}><MapView
    style={StyleSheet.absoluteFill}
    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
    initialRegion={{ latitude: selected.coordinates.latitude, longitude: selected.coordinates.longitude, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
    showsUserLocation={Boolean(userCoordinates)}
    showsMyLocationButton={false}
  >
    {locations.map((location) => <Marker key={location.id} coordinate={location.coordinates} title={location.name} description={location.address} pinColor={location.id === selectedId ? '#D4AF37' : '#8B7850'} onPress={() => onSelect(location.id)} />)}
  </MapView></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, minHeight: 180, overflow: 'hidden' } });
