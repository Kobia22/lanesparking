interface ParkingSpace {
  id: string;
  location: string;
  isOccupied: boolean;
  // add any other properties your parking spaces have
}

// screens/ParkingListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { fetchParkingSpaces } from '@/src/firebase/database';

export default function ParkingListScreen() {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);

  useEffect(() => {
    const loadParkingSpaces = async () => {
      const spaces = await fetchParkingSpaces();
      setParkingSpaces(spaces);
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
            onPress={() => console.log('Navigate to Parking Detail')}
          >
            <Text style={{ fontSize: 18 }}>{item.location}</Text>
            <Text>Status: {item.isOccupied ? 'Occupied' : 'Available'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
