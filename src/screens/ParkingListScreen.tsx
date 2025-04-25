// screens/ParkingListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { fetchParkingSpaces } from '../firebase/database';
import { StackNavigationProp } from '@react-navigation/stack';

import type { ParkingSpace } from '@/src/types';

type RootStackParamList = {
  ParkingList: undefined;
  ParkingDetail: { parkingSpace: ParkingSpace };
};

type ParkingListScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ParkingList'>;
};

export default function ParkingListScreen({ navigation }: ParkingListScreenProps) {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);

  useEffect(() => {
    const loadParkingSpaces = async () => {
      try {
        const spaces = await fetchParkingSpaces();
        // Ensure the returned data matches the ParkingSpace type
        const typedSpaces: ParkingSpace[] = spaces.map((space: any) => ({
          id: space.id,
          location: space.location || 'Unknown location',
          isOccupied: space.isOccupied || false,
        }));
        setParkingSpaces(typedSpaces);
      } catch (error) {
        console.error('Error loading parking spaces:', error);
      }
    };
    loadParkingSpaces();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Available Parking Spaces</Text>
      <FlatList
        data={parkingSpaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ padding: 16, margin: 8, backgroundColor: item.isOccupied ? '#ffdddd' : '#ddffdd' }}
            onPress={() => navigation.navigate('ParkingDetail', { parkingSpace: item })}
          >
            <Text style={{ fontSize: 18 }}>{item.location}</Text>
            <Text>Status: {item.isOccupied ? 'Occupied' : 'Available'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}