// ParkingSpaceAdminPanel - Admin interface for managing parking spaces
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import { fetchParkingLots, fetchParkingSpaces, addParkingSpace, updateParkingSpace, deleteParkingSpace } from '@/src/firebase/database';
import type { ParkingLot, ParkingSpace } from '@/src/firebase/types';

export default function ParkingSpaceAdminPanel() {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [number, setNumber] = useState('');
  const [editingSpace, setEditingSpace] = useState<ParkingSpace | null>(null);
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLots = async () => {
      try {
        setLoading(true);
        const fetchedLots = await fetchParkingLots();
        setLots(fetchedLots);
      } catch (error) {
        console.error('Error fetching parking lots:', error);
        Alert.alert('Error', 'Failed to load parking lots');
      } finally {
        setLoading(false);
      }
    };
    loadLots();
  }, []);

  useEffect(() => {
    if (selectedLot) {
      loadSpaces();
    }
  }, [selectedLot]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const fetchedSpaces = await fetchParkingSpaces(selectedLot);
      setSpaces(fetchedSpaces);
    } catch (error) {
      console.error('Error fetching parking spaces:', error);
      Alert.alert('Error', 'Failed to load parking spaces');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpace = async () => {
    if (!selectedLot || !number) {
      Alert.alert('Error', 'Please select a lot and enter a space number');
      return;
    }

    try {
      await addParkingSpace({
        lotId: selectedLot,
        number: parseInt(number),
        isOccupied: false,
        currentBookingId: null
      });
      Alert.alert('Success', 'Parking space added successfully');
      setNumber('');
      await loadSpaces();
    } catch (error) {
      console.error('Error adding parking space:', error);
      Alert.alert('Error', 'Failed to add parking space');
    }
  };

  const handleUpdateSpace = async () => {
    if (!editingSpace || !number) {
      Alert.alert('Error', 'Please select a space and enter a number');
      return;
    }

    try {
      await updateParkingSpace(editingSpace.id, {
        number: parseInt(number),
      });
      Alert.alert('Success', 'Parking space updated successfully');
      setNumber('');
      setEditingSpace(null);
      await loadSpaces();
    } catch (error) {
      console.error('Error updating parking space:', error);
      Alert.alert('Error', 'Failed to update parking space');
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    try {
      await deleteParkingSpace(spaceId);
      Alert.alert('Success', 'Parking space deleted successfully');
      await loadSpaces();
    } catch (error) {
      console.error('Error deleting parking space:', error);
      Alert.alert('Error', 'Failed to delete parking space');
    }
  };

  const handleEditSpace = (space: ParkingSpace) => {
    setNumber(space.number.toString());
    setEditingSpace(space);
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Parking Spaces</Text>
      
      <View style={styles.form}>
        <View style={styles.selectContainer}>
          <Text style={styles.label}>Select Lot:</Text>
          <View style={styles.select}>
            <FlatList
              data={lots}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.lotButton,
                    selectedLot === item.id && styles.lotButtonSelected
                  ]}
                  onPress={() => setSelectedLot(item.id)}
                >
                  <Text style={styles.lotButtonText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.id}
            />
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Space Number"
          value={number}
          onChangeText={setNumber}
          keyboardType="numeric"
        />
        
        <TouchableOpacity
          style={[
            styles.button,
            editingSpace ? styles.updateButton : styles.addButton
          ]}
          onPress={editingSpace ? handleUpdateSpace : handleAddSpace}
        >
          <Text style={styles.buttonText}>
            {editingSpace ? 'Update Space' : 'Add New Space'}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedLot && (
        <View style={styles.spacesList}>
          <Text style={styles.sectionTitle}>Parking Spaces</Text>
          {spaces.length > 0 ? (
            <FlatList
              data={spaces}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.spaceItem}>
                  <View style={styles.spaceInfo}>
                    <Text style={styles.spaceNumber}>Space #{item.number}</Text>
                    <Text style={styles.spaceStatus}>
                      Status: {item.isOccupied ? 'Occupied' : 'Available'}
                    </Text>
                    {item.currentBookingId && (
                      <Text style={styles.bookedUntil}>
                        Booking ID: {item.currentBookingId}
                      </Text>
                    )}
                  </View>
                  <View style={styles.spaceActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => handleEditSpace(item)}
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteSpace(item.id)}
                    >
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noSpaces}>No spaces in this lot</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  form: { marginBottom: 24 },
  selectContainer: { marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  select: { backgroundColor: '#fff', borderRadius: 8, padding: 8, elevation: 3 },
  lotButton: { 
    padding: 12, 
    marginRight: 8, 
    borderRadius: 6, 
    backgroundColor: '#f3f4f6',
    elevation: 1
  },
  lotButtonSelected: { backgroundColor: '#2563eb' },
  lotButtonText: { 
    color: '#2563eb',
    fontWeight: 'bold'
  },
  lotButtonSelectedText: { color: '#fff' },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12,
    fontSize: 16 
  },
  button: { 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 16
  },
  addButton: { backgroundColor: '#2563eb' },
  updateButton: { backgroundColor: '#10b981' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  spacesList: { marginTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  spaceItem: { 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    padding: 16, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  spaceInfo: { flex: 1 },
  spaceNumber: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  spaceStatus: { color: '#64748b', fontSize: 16, marginBottom: 8 },
  bookedUntil: { color: '#f59e0b', fontSize: 14, marginBottom: 4 },
  vehicleId: { color: '#10b981', fontSize: 14 },
  spaceActions: { flexDirection: 'row', gap: 8 },
  actionButton: { 
    padding: 8, 
    borderRadius: 6, 
    flex: 1 
  },
  editButton: { backgroundColor: '#10b981' },
  deleteButton: { backgroundColor: '#ef4444' },
  actionButtonText: { 
    color: '#fff', 
    textAlign: 'center', 
    fontWeight: 'bold' 
  },
  noSpaces: { color: '#64748b', textAlign: 'center', padding: 16 }
});
