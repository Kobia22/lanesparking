// Moved from src/screens/ParkingDetailScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { bookParkingSpace } from '@/src/firebase/database';
import type { ParkingSpace } from './ParkingListScreen';

interface ParkingDetailScreenProps {
  parkingSpace: ParkingSpace;
}

export default function ParkingDetailScreen({ parkingSpace }: ParkingDetailScreenProps) {
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBookSpace = async () => {
    setBooking(true);
    await bookParkingSpace(parkingSpace.id);
    setBooking(false);
    setBooked(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{parkingSpace.location}</Text>
        <Text style={styles.status}>Status: {parkingSpace.isOccupied ? 'Occupied' : 'Available'}</Text>
        {booked ? (
          <Text style={styles.confirmText}>Booking Confirmed!</Text>
        ) : (
          <TouchableOpacity
            style={[styles.button, (booking || parkingSpace.isOccupied) && styles.buttonDisabled]}
            onPress={handleBookSpace}
            disabled={booking || parkingSpace.isOccupied}
          >
            {booking ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Book This Space</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#222',
    marginBottom: 12,
  },
  status: {
    fontSize: 16,
    color: '#555',
    marginBottom: 24,
  },
  confirmText: {
    fontSize: 18,
    color: 'green',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
