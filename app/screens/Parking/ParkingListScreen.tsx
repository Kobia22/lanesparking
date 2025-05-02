// ParkingListScreen - Shows a list of parking lots and their available spaces
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchParkingLots, fetchParkingSpaces } from '@/src/firebase/database';
import BookingModal from './BookingModal';
import BookingTab from './BookingTab';
import type { ParkingLot, ParkingSpace } from '@/src/firebase/types';

export default function ParkingListScreen() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const navigation = useNavigation();
  const [userIdOrPlate, setUserIdOrPlate] = useState<string>('');

  useEffect(() => {
    const loadLotsAndSpaces = async () => {
      setLoading(true);
      try {
        const fetchedLots = await fetchParkingLots();
        setLots(fetchedLots);
      } catch (error) {
        console.error('Error fetching parking lots:', error);
      } finally {
        setLoading(false);
      }
    };
    loadLotsAndSpaces();
  }, []);

  const handleSpacePress = async (lot: ParkingLot, space: ParkingSpace) => {
    setSelectedLot(lot);
    setSelectedSpace(space);
    setBookingModalVisible(true);
  };

  const handleBookingSuccess = async () => {
    setBookingModalVisible(false);
    setSelectedLot(null);
    setSelectedSpace(null);
    
    try {
      setLoading(true);
      const fetchedLots = await fetchParkingLots();
      setLots(fetchedLots);
    } catch (error) {
      console.error('Error refreshing parking lots:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (lots.length === 0) {
    return <View style={styles.center}><Text style={styles.noLotsText}>No parking lots found.</Text></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Available Parking Lots</Text>
        {lots.map(lot => (
          <View key={lot.id} style={styles.lotSection}>
            <View style={styles.lotHeader}>
              <Text style={styles.lotTitle}>{lot.name}</Text>
              <Text style={styles.lotLocation}>{lot.location}</Text>
              <View style={styles.spacesInfo}>
                <Text style={styles.spacesText}>
                  Total: {lot.totalSpaces}
                </Text>
                <Text style={[styles.spacesText, styles.available]}>
                  Available: {lot.availableSpaces}
                </Text>
                <Text style={[styles.spacesText, styles.occupied]}>
                  Occupied: {lot.occupiedSpaces}
                </Text>
                <Text style={[styles.spacesText, styles.booked]}>
                  Booked: {lot.bookedSpaces}
                </Text>
              </View>
            </View>
            
            <View style={styles.spacesList}>
              {lot.availableSpaces > 0 ? (
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => {
                    // Get available spaces for this lot
                    fetchParkingSpaces(lot.id).then(spaces => {
                      const availableSpace = spaces.find(s => !s.isOccupied);
                      if (availableSpace) {
                        handleSpacePress(lot, availableSpace);
                      }
                    });
                  }}
                >
                  <Text style={styles.bookButtonText}>Book a Space</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noSpaces}>No available spaces</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
      <BookingModal
        visible={bookingModalVisible && !!selectedLot && !!selectedSpace}
        lot={selectedLot as ParkingLot}
        space={selectedSpace as ParkingSpace}
        onClose={() => setBookingModalVisible(false)}
        onBooked={handleBookingSuccess}
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
  lotSection: { marginBottom: 28, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  lotHeader: { marginBottom: 16 },
  lotTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  lotLocation: { color: '#64748b', fontSize: 16, marginBottom: 12 },
  spacesInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  spacesText: { fontSize: 14 },
  available: { color: '#10b981' },
  occupied: { color: '#ef4444' },
  booked: { color: '#f59e0b' },
  spacesList: { },
  bookButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  noSpaces: { color: '#64748b', textAlign: 'center', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noLotsText: { fontSize: 16, color: '#64748b', textAlign: 'center' },
});
