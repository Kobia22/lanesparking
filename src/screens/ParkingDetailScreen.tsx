import React from 'react';
import { View, Text, Button } from 'react-native';
import { bookParkingSpace } from '../firebase/database';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import type { ParkingSpace } from '@/src/types';

export type RootStackParamList = {
  Login: undefined;
  ParkingList: undefined;
  ParkingDetail: { parkingSpace: ParkingSpace };
  BookingConfirmation: { parkingSpace: ParkingSpace };
};

type ParkingDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ParkingDetail'>;
  navigation: StackNavigationProp<RootStackParamList, 'ParkingDetail'>;
};

export default function ParkingDetailScreen({ route, navigation }: ParkingDetailScreenProps) {
  const { parkingSpace } = route.params;

  const handleBookSpace = async () => {
    await bookParkingSpace(parkingSpace.id);
    navigation.navigate('BookingConfirmation', { parkingSpace });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>{parkingSpace.location}</Text>
      <Text>Status: {parkingSpace.isOccupied ? 'Occupied' : 'Available'}</Text>
      <Button
        title="Book This Space"
        onPress={handleBookSpace}
        disabled={parkingSpace.isOccupied}
      />
    </View>
  );
}
