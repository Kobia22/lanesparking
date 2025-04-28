// ParkingDetailScreen - Shows details for a selected parking space and navigates to booking confirmation
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createBooking } from '@/src/firebase/bookings';
import type { ParkingSpace } from '@/src/firebase/types';

export default function ParkingDetailScreen() {
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { parkingSpace } = route.params as { parkingSpace: ParkingSpace };

  const handleBookSpace = async () => {
    setBooking(true);
    setError(null);
    try {
      await createBooking({
        lotId: parkingSpace.lotId || 'mainLot',
        spaceId: parkingSpace.id,
        plateNumber: 'KAA123A', // TODO: Replace with user input
        userType: 'guest', // TODO: Replace with actual user type
      });
      setBooked(true);
      navigation.replace('BookingConfirmation', { parkingSpace });
    } catch (error) {
      setError('Booking failed. Please try again.');
      Alert.alert('Booking failed', error instanceof Error ? error.message : String(error));
    }
    setBooking(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Parking Space Details</Text>
      <Text style={styles.info}>{'Space #' + parkingSpace.number}</Text>
      <Text style={styles.info}>Location: {parkingSpace.location || 'N/A'}</Text>
      <Text style={styles.info}>{parkingSpace.isOccupied ? 'Occupied' : 'Available'}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, (booking || parkingSpace.isOccupied) && styles.buttonDisabled]}
        onPress={handleBookSpace}
        disabled={booking || parkingSpace.isOccupied}
      >
        {booking ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Book This Space</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5faff', justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 18, color: '#2563eb' },
  info: { fontSize: 18, marginBottom: 10, color: '#222' },
  error: { color: '#dc2626', fontSize: 16, marginBottom: 10 },
  button: { backgroundColor: '#2563eb', padding: 16, borderRadius: 10, marginTop: 18, width: 220, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#a5b4fc' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
