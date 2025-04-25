// screens/BookingConfirmationScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
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
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Booking Confirmation</Text>
      <Text>You have 5 minutes to occupy this space:</Text>
      <Text style={{ fontSize: 18, marginTop: 16 }}>{parkingSpace.location}</Text>
      <Button title="Go to Parking List" onPress={() => navigation.navigate('ParkingList')} />
    </View>
  );
}