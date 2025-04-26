// Moved from src/screens/ParkingListScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { fetchParkingSpaces } from '@/src/firebase/database';

export interface ParkingSpace {
  id: string;
  location: string;
  isOccupied: boolean;
}

interface ParkingListScreenProps {
  onParkingSelect?: (parkingSpace: ParkingSpace) => void;
}

export default function ParkingListScreen({ onParkingSelect }: ParkingListScreenProps) {
  const [parkingSpaces, setParkingSpaces] = useState<ParkingSpace[]>([]);

  useEffect(() => {
    const loadParkingSpaces = async () => {
      const spaces = await fetchParkingSpaces();
      setParkingSpaces(spaces);
    };
    loadParkingSpaces();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Available Parking Spaces</Text>
      <FlatList
        data={parkingSpaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.isOccupied && styles.cardOccupied]}
            onPress={() => onParkingSelect?.(item)}
          >
            <Text style={styles.cardTitle}>{item.location}</Text>
            <Text style={styles.cardSubtitle}>{item.isOccupied ? 'Occupied' : 'Available'}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardOccupied: {
    backgroundColor: '#ffe5e5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});
