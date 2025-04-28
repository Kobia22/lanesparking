// ParkingListScreen - Shows a list of parking spaces and navigates to detail/booking
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAvailableSpacesByLot } from '@/src/firebase/databaseUtils';
import type { ParkingSpace } from '@/src/firebase/types';

export default function ParkingListScreen() {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadSpaces = async () => {
      setLoading(true);
      const spaces = await getAvailableSpacesByLot('mainLot');
      setParkingSpaces(spaces);
      setLoading(false);
    };
    loadSpaces();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Available Parking Spaces</Text>
      <FlatList
        data={parkingSpaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.isOccupied && styles.occupied]}
            disabled={item.isOccupied}
            onPress={() => navigation.navigate('ParkingDetail', { parkingSpace: item })}
          >
            <Text style={styles.cardTitle}>{'Space #' + item.number}</Text>
            <Text style={styles.status}>{item.isOccupied ? 'Occupied' : 'Available'}</Text>
            {item.location && <Text style={styles.cardSubtitle}>{item.location}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No spaces found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#2563eb', alignSelf: 'center' },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 10, marginBottom: 12, elevation: 2 },
  occupied: { opacity: 0.5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  status: { fontSize: 16, color: '#22c55e', marginTop: 4 },
  cardSubtitle: { fontSize: 14, color: '#888', marginTop: 2 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
