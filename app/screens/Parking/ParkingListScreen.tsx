// ParkingListScreen - Shows a list of parking spaces and navigates to detail/booking
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchParkingLots, fetchParkingSpaces } from '@/src/firebase/database';
import BookingModal from './BookingModal';
import BookingTab from './BookingTab';
import type { ParkingLot, ParkingSpace } from '@/src/firebase/types';

export default function ParkingListScreen() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [spacesByLot, setSpacesByLot] = useState<{ [lotId: string]: ParkingSpace[] }>({});
  const [loading, setLoading] = useState(true);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const navigation = useNavigation();
  const [userIdOrPlate, setUserIdOrPlate] = useState<string>('');

  useEffect(() => {
    const loadLotsAndSpaces = async () => {
      setLoading(true);
      const fetchedLots = await fetchParkingLots();
      setLots(fetchedLots);
      const allSpaces = await fetchParkingSpaces();
      // Group spaces by lotId and only include available
      const grouped: { [lotId: string]: ParkingSpace[] } = {};
      fetchedLots.forEach(lot => {
        grouped[lot.id] = allSpaces.filter(space => space.lotId === lot.id && !space.isOccupied);
      });
      setSpacesByLot(grouped);
      setLoading(false);
    };
    loadLotsAndSpaces();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (lots.length === 0) {
    return <View style={styles.center}><Text style={styles.empty}>No parking lots found.</Text></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Available Parking Spaces</Text>
        {lots.map(lot => (
          <View key={lot.id} style={styles.lotSection}>
            <Text style={styles.lotTitle}>{lot.name} <Text style={styles.lotLocation}>({lot.location})</Text></Text>
            {spacesByLot[lot.id] && spacesByLot[lot.id].length > 0 ? (
              spacesByLot[lot.id].map(space => (
                <TouchableOpacity
                  key={space.id}
                  style={styles.card}
                  onPress={() => {
                    const lotObj = lots.find(l => l.id === space.lotId);
                    if (lotObj) {
                      setSelectedLot(lotObj);
                      setSelectedSpace(space);
                      setBookingModalVisible(true);
                    }
                  }}
                >
                  <Text style={styles.cardTitle}>{'Space #' + space.number}</Text>
                  <Text style={styles.status}>Available</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.empty}>No available spaces in this lot.</Text>
            )}
          </View>
        ))}
      </ScrollView>
      <BookingModal
        visible={bookingModalVisible && !!selectedLot && !!selectedSpace}
        lot={selectedLot as ParkingLot}
        space={selectedSpace as ParkingSpace}
        onClose={() => setBookingModalVisible(false)}
        onBooked={() => {
          setBookingModalVisible(false);
          setSelectedLot(null);
          setSelectedSpace(null);
          // Reload data after booking
          (async () => {
            setLoading(true);
            const fetchedLots = await fetchParkingLots();
            setLots(fetchedLots);
            const allSpaces = await fetchParkingSpaces();
            const grouped: { [lotId: string]: ParkingSpace[] } = {};
            fetchedLots.forEach(lot => {
              grouped[lot.id] = allSpaces.filter(space => space.lotId === lot.id && !space.isOccupied);
            });
            setSpacesByLot(grouped);
            setLoading(false);
          })();
        }}
      />
      {/* BookingTab displays active booking and booking history below */}
      {userIdOrPlate ? (
        <BookingTab userIdOrPlate={userIdOrPlate} />
      ) : (
        <TouchableOpacity
          style={{ backgroundColor: '#2563eb', borderRadius: 10, padding: 14, alignItems: 'center', marginVertical: 10 }}
          onPress={async () => {
            const plate = prompt('Enter your plate number or user ID to show bookings:');
            if (plate) setUserIdOrPlate(plate);
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Show My Bookings</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faff', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#2563eb', alignSelf: 'center' },
  lotSection: { marginBottom: 28 },
  lotTitle: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginBottom: 6 },
  lotLocation: { fontSize: 15, color: '#888', fontWeight: 'normal' },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 10, marginBottom: 10, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  status: { fontSize: 16, color: '#22c55e', marginTop: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginBottom: 20, marginTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
