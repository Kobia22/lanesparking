import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { fetchParkingLots, addParkingLot, updateParkingLot, deleteParkingLot, addParkingSpace } from '@/src/firebase/database';
import type { ParkingLot, ParkingSpace } from '@/src/firebase/types';
import { colors } from '@/app/constants/theme';

const ParkingLotAdminPanel = () => {
  // Ensure imported type is used from src/firebase/types
  const [lots, setLots] = useState<import('@/src/firebase/types').ParkingLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [form, setForm] = useState({
    name: '',
    location: '',
    totalSpaces: 0,
    availableSpaces: 0,
    occupiedSpaces: 0,
    bookedSpaces: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadLots = async () => {
      try {
        setLoading(true);
        const fetchedLots = await fetchParkingLots();
        // No need for type assertion as fetchParkingLots now returns the correct type
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

  const openEditModal = (lot: ParkingLot) => {
    setSelectedLot(lot);
    setForm({
      name: lot.name,
      location: lot.location,
      totalSpaces: lot.totalSpaces,
      availableSpaces: lot.availableSpaces,
      occupiedSpaces: lot.occupiedSpaces,
      bookedSpaces: lot.bookedSpaces
    });
    setIsEditModalVisible(true);
  };

  const openAddModal = () => {
    setSelectedLot(null);
    setForm({
      name: '',
      location: '',
      totalSpaces: 0,
      availableSpaces: 0,
      occupiedSpaces: 0,
      bookedSpaces: 0
    });
    setIsAddModalVisible(true);
  };

  const handleAddLot = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      // addParkingLot now returns the complete lot object with id
      const insertedLot = await addParkingLot({
        name: form.name,
        location: form.location,
        totalSpaces: form.totalSpaces,
        availableSpaces: form.totalSpaces,
        occupiedSpaces: 0,
        bookedSpaces: 0
      });

      // Create parking spaces for the new lot
      for (let i = 1; i <= form.totalSpaces; i++) {
        await addParkingSpace({
          lotId: insertedLot.id,
          number: i,
          isOccupied: false,
          currentBookingId: null
        });
      }

      setSuccessMessage('Parking lot added successfully');
      setIsAddModalVisible(false);
      setForm({
        name: '',
        location: '',
        totalSpaces: 0,
        availableSpaces: 0,
        occupiedSpaces: 0,
        bookedSpaces: 0
      });
    } catch (err) {
      setError('Failed to add parking lot');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLot = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      await updateParkingLot(selectedLot!.id, {
        name: form.name,
        location: form.location,
        totalSpaces: form.totalSpaces,
        availableSpaces: form.availableSpaces,
        occupiedSpaces: form.occupiedSpaces,
        bookedSpaces: form.bookedSpaces
      });

      setSuccessMessage('Parking lot updated successfully');
      setIsEditModalVisible(false);
      setForm({
        name: '',
        location: '',
        totalSpaces: 0,
        availableSpaces: 0,
        occupiedSpaces: 0,
        bookedSpaces: 0
      });
    } catch (err) {
      setError('Failed to update parking lot');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLot = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      await deleteParkingLot(id);

      setSuccessMessage('Parking lot deleted successfully');
    } catch (err) {
      setError('Failed to delete parking lot');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Parking Lots</Text>
      
      <View style={styles.form}>
        <Modal visible={isAddModalVisible} animationType="slide" transparent>
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Lot</Text>
              <TextInput
                style={styles.input}
                placeholder="Lot Name"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Total Spaces"
                value={form.totalSpaces.toString()}
                onChangeText={(text) => setForm({ ...form, totalSpaces: parseInt(text) })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Available Spaces"
                value={form.availableSpaces.toString()}
                onChangeText={(text) => setForm({ ...form, availableSpaces: parseInt(text) })}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleAddLot}
              >
                <Text style={styles.buttonText}>Add New Lot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsAddModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal visible={isEditModalVisible} animationType="slide" transparent>
          <View style={styles.modalBg}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Lot</Text>
              <TextInput
                style={styles.input}
                placeholder="Lot Name"
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Total Spaces"
                value={form.totalSpaces.toString()}
                onChangeText={(text) => setForm({ ...form, totalSpaces: parseInt(text) })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Available Spaces"
                value={form.availableSpaces.toString()}
                onChangeText={(text) => setForm({ ...form, availableSpaces: parseInt(text) })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Occupied Spaces"
                value={form.occupiedSpaces.toString()}
                onChangeText={(text) => setForm({ ...form, occupiedSpaces: parseInt(text) })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Booked Spaces"
                value={form.bookedSpaces.toString()}
                onChangeText={(text) => setForm({ ...form, bookedSpaces: parseInt(text) })}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleUpdateLot}
              >
                <Text style={styles.buttonText}>Update Lot</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.button}
          onPress={openAddModal}
        >
          <Text style={styles.buttonText}>+ Add Lot</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={styles.sectionTitle}>Parking Lots</Text>
        <FlatList
          data={lots}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.lotItem}>
              <View style={styles.lotInfo}>
                <Text style={styles.lotName}>{item.name}</Text>
                <Text style={styles.lotLocation}>{item.location}</Text>
                <View style={styles.spacesInfo}>
                  <Text style={styles.spacesText}>
                    Total: {item.totalSpaces}
                  </Text>
                  <Text style={[styles.spacesText, styles.available]}>
                    Available: {item.availableSpaces}
                  </Text>
                  <Text style={[styles.spacesText, styles.occupied]}>
                    Occupied: {item.occupiedSpaces}
                  </Text>
                  <Text style={[styles.spacesText, styles.booked]}>
                    Booked: {item.bookedSpaces}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteLot(item.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#10b981', marginTop: 16 }]} 
        onPress={async () => {
          setSaving(true);
          try {
            const testLots = [
              { 
                name: 'Lot A', 
                location: 'North Wing', 
                totalSpaces: 10, 
                availableSpaces: 10,
                occupiedSpaces: 0,
                bookedSpaces: 0
              },
              { 
                name: 'Lot B', 
                location: 'South Wing', 
                totalSpaces: 10, 
                availableSpaces: 10,
                occupiedSpaces: 0,
                bookedSpaces: 0
              },
              { 
                name: 'Lot C', 
                location: 'East Wing', 
                totalSpaces: 10, 
                availableSpaces: 10,
                occupiedSpaces: 0,
                bookedSpaces: 0
              },
              { 
                name: 'Lot D', 
                location: 'West Wing', 
                totalSpaces: 10, 
                availableSpaces: 10,
                occupiedSpaces: 0,
                bookedSpaces: 0
              },
            ];
            for (const lot of testLots) {
              // addParkingLot now returns the complete lot with ID
              const insertedLot = await addParkingLot(lot);
              // Create spaces directly using the returned lot
              for (let i = 1; i <= lot.totalSpaces; i++) {
                await addParkingSpace({
                  lotId: insertedLot.id,
                  number: i,
                  isOccupied: false,
                  currentBookingId: null
                });
              }
            }
            Alert.alert('Success', 'Test lots and spaces added.');
          } catch (e) {
            console.error('Error adding test lots:', e);
            Alert.alert('Error', 'Failed to add test lots.');
          }
          setSaving(false);
        }}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>Add 4 Test Lots (10 spaces each)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  lotItem: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  lotInfo: {
    marginBottom: 10,
  },
  lotName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lotLocation: {
    color: '#666',
  },
  spacesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  spacesText: {
    fontSize: 14,
  },
  available: {
    color: '#4CAF50',
  },
  occupied: {
    color: '#F44336',
  },
  booked: {
    color: '#FFC107',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default ParkingLotAdminPanel;
