// screens/ParkingDetailScreen.tsx
import React from 'react';
import { View, Text, Button } from 'react-native';
import { bookParkingSpace } from '../firebase/database';

export default function ParkingDetailScreen({ route, navigation }: { route: any, navigation: any }) {
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