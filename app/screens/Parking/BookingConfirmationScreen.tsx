// BookingConfirmationScreen - Shows confirmation after booking
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ParkingSpace } from '@/src/firebase/types';

export default function BookingConfirmationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { parkingSpace } = route.params as { parkingSpace: ParkingSpace };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.info}>Space #{parkingSpace.number}</Text>
      <Text style={styles.info}>Location: {parkingSpace.location || 'N/A'}</Text>
      <Button title="Back to List" onPress={() => navigation.navigate('ParkingList')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5faff', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#22c55e', marginBottom: 18 },
  info: { fontSize: 18, marginBottom: 10, color: '#333' },
});
