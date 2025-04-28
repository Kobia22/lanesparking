import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { fetchParkingSpaces } from '@/src/firebase/database';
import { colors } from '@/app/constants/theme';
import type { ParkingLot, ParkingSpace } from '@/src/firebase/types';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

const SPACE_SIZE = 38;
const SPACE_MARGIN = 8;

const ParkingLotDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const lot: ParkingLot | undefined = route.params?.lot;
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSpaces = useCallback(() => {
    if (!lot) return;
    setLoading(true);
    fetchParkingSpaces().then(spaces => {
      setSpaces(spaces.filter(s => s.lotId === lot.id));
    }).finally(() => setLoading(false));
  }, [lot?.id]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  useFocusEffect(
    useCallback(() => {
      fetchSpaces();
    }, [fetchSpaces])
  );

  const handleSpacePress = (space: ParkingSpace) => {
    if (space.isOccupied) return;
    Alert.alert(
      'Book Space',
      `Do you want to book space #${space.number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book', style: 'default', onPress: () => (navigation as any).navigate('BookingScreen', { lot, space }) },
      ]
    );
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (!lot) {
    return <View style={styles.center}><Text>Parking lot not found.</Text></View>;
  }

  if (!spaces.length) {
    return <View style={styles.center}><Text>No spaces found for this lot.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.lotName}>{lot.name}</Text>
      <Text style={styles.lotLocation}>{lot.location}</Text>
      <TouchableOpacity style={styles.refreshBtn} onPress={fetchSpaces}>
        <Text style={styles.refreshTxt}>Refresh</Text>
      </TouchableOpacity>
      <FlatList
        data={spaces}
        keyExtractor={item => item.id}
        numColumns={4}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.space,
              item.isOccupied
                ? styles.occupied
                : item.currentBookingId
                  ? styles.booked
                  : styles.free,
            ]}
            onPress={() => handleSpacePress(item)}
            disabled={item.isOccupied}
          >
            <Text style={styles.spaceNum}>{item.number}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 18, backgroundColor: '#fff' },
  lotName: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 2 },
  lotLocation: { fontSize: 15, color: '#888', marginBottom: 12 },
  grid: { alignItems: 'center', justifyContent: 'center' },
  space: {
    width: SPACE_SIZE,
    height: SPACE_SIZE,
    margin: SPACE_MARGIN,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  free: { backgroundColor: '#fff' },
  booked: { backgroundColor: '#06b6d4' }, // cyan (as per earlier spec)
  occupied: { backgroundColor: '#a3a3a3' }, // gray
  refreshBtn: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 18, marginBottom: 10 },
  refreshTxt: { color: '#fff', fontWeight: 'bold' },
  spaceNum: { fontWeight: 'bold', color: '#222' },
});

export default ParkingLotDetailScreen;
