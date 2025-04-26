// screens/BookingConfirmationScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import type { ParkingSpace } from '@/src/types';

type RootStackParamList = {
  ParkingList: undefined;
  ParkingDetail: { parkingSpace: ParkingSpace };
  BookingConfirmation: { parkingSpace: ParkingSpace };
};

type BookingConfirmationScreenProps = {
  route: RouteProp<RootStackParamList, 'BookingConfirmation'>;
  navigation: StackNavigationProp<RootStackParamList, 'BookingConfirmation'>;
};

export default function BookingConfirmationScreen({ route, navigation }: BookingConfirmationScreenProps) {
  const { parkingSpace } = route.params;

  useEffect(() => {
    const checkSpaceStatus = async () => {
      try {
        const spaceDoc = await getDoc(doc(db, 'parkingSpaces', parkingSpace.id));
        const updatedSpace = spaceDoc.data();
        
        if (updatedSpace && !updatedSpace.isOccupied) {
          navigation.navigate('ParkingList');
        }
      } catch (error) {
        console.error('Error checking parking space status:', error);
      }
    };

    const timer = setTimeout(checkSpaceStatus, 300000); // Check status after 5 minutes

    return () => clearTimeout(timer);
  }, [navigation, parkingSpace.id]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Booking Confirmation</Text>
        <Text style={styles.subtitle}>You have 5 minutes to occupy this space:</Text>
        <Text style={styles.location}>{parkingSpace.location}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ParkingList')}
          accessibilityRole="button"
          accessibilityLabel="Go to Parking List"
        >
          <Text style={styles.buttonText}>Go to Parking List</Text>
        </TouchableOpacity>
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
    borderRadius: 16,
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
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  location: {
    fontSize: 18,
    marginBottom: 24,
    color: '#222',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});