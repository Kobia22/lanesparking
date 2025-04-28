import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { fetchParkingLots, addParkingSpace } from '@/src/firebase/database';
import { addParkingLot, updateParkingLot, deleteParkingLot } from '@/src/firebase/database';
import { colors } from '@/app/constants/theme';
import type { ParkingLot } from '@/src/firebase/types';

import { useNavigation } from '@react-navigation/native';

const ParkingLotAdminPanel = () => {
  const navigation = useNavigation();
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);
  const [form, setForm] = useState({ name: '', location: '', totalSpaces: '', availableSpaces: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchParkingLots().then(lots => setLots(lots as ParkingLot[])).finally(() => setLoading(false));
  }, []);

  const openEditModal = (lot: ParkingLot) => {
    setEditingLot(lot);
    setForm({
      name: lot.name,
      location: lot.location,
      totalSpaces: lot.totalSpaces.toString(),
      availableSpaces: lot.availableSpaces.toString(),
    });
    setModalVisible(true);
  };

  const openAddModal = () => {
    setEditingLot(null);
    setForm({ name: '', location: '', totalSpaces: '', availableSpaces: '' });
    setModalVisible(true);
  };

  const handleDelete = async (lot: ParkingLot) => {
    Alert.alert('Delete Lot', `Are you sure you want to delete ${lot.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setSaving(true);
        await deleteParkingLot(lot.id);
        setLots(lots.filter(l => l.id !== lot.id));
        setSaving(false);
      }}
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editingLot) {
      try {
        await updateParkingLot(editingLot.id, {
          name: form.name,
          location: form.location,
          totalSpaces: Number(form.totalSpaces),
          availableSpaces: Number(form.availableSpaces),
        });
        setLots(lots.map(l => l.id === editingLot.id ? { ...l, ...form, totalSpaces: Number(form.totalSpaces), availableSpaces: Number(form.availableSpaces) } : l));
        setSaving(false);
        setModalVisible(false);
        navigation.goBack();
      } catch (e) {
        setSaving(false);
        Alert.alert('Error', 'Failed to update parking lot. Please try again.');
      }
    } else {
      const newLot = {
        name: form.name,
        location: form.location,
        totalSpaces: Number(form.totalSpaces),
        availableSpaces: Number(form.availableSpaces),
      };
      try {
        await addParkingLot(newLot);
        setSaving(false);
        setModalVisible(false);
        navigation.goBack();
      } catch (e) {
        setSaving(false);
        Alert.alert('Error', 'Failed to add parking lot. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Parking Lots</Text>
      {loading ? <ActivityIndicator color={colors.primary} size="large" /> : (
        <FlatList
          data={lots}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.lotCard}>
              <Text style={styles.lotName}>{item.name}</Text>
              <Text style={styles.lotLocation}>{item.location}</Text>
              <Text style={styles.lotSpaces}>{item.availableSpaces} / {item.totalSpaces} spaces</Text>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEditModal(item)}><Text style={styles.editTxt}>Edit</Text></TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}><Text style={styles.deleteTxt}>Delete</Text></TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text>No parking lots found.</Text>}
        />
      )}
      <TouchableOpacity style={styles.addBtn} onPress={openAddModal}><Text style={styles.addTxt}>+ Add Lot</Text></TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingLot ? 'Edit Lot' : 'Add Lot'}</Text>
            <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={name => setForm({ ...form, name })} />
            <TextInput style={styles.input} placeholder="Location" value={form.location} onChangeText={location => setForm({ ...form, location })} />
            <TextInput style={styles.input} placeholder="Total Spaces" value={form.totalSpaces} keyboardType="number-pad" onChangeText={totalSpaces => setForm({ ...form, totalSpaces })} />
            <TextInput style={styles.input} placeholder="Available Spaces" value={form.availableSpaces} keyboardType="number-pad" onChangeText={availableSpaces => setForm({ ...form, availableSpaces })} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelTxt}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}><Text style={styles.saveTxt}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={[styles.addBtn, { backgroundColor: '#22c55e', marginTop: 16 }]} onPress={async () => {
        setSaving(true);
        try {
          const testLots = [
            { name: 'Lot A', location: 'North Wing', totalSpaces: 10, availableSpaces: 10 },
            { name: 'Lot B', location: 'South Wing', totalSpaces: 10, availableSpaces: 10 },
            { name: 'Lot C', location: 'East Wing', totalSpaces: 10, availableSpaces: 10 },
            { name: 'Lot D', location: 'West Wing', totalSpaces: 10, availableSpaces: 10 },
          ];
          for (const lot of testLots) {
            await addParkingLot(lot);
            // Fetch the lot just inserted
            const updatedLots = await fetchParkingLots() as import('@/src/firebase/types').ParkingLot[];
            const insertedLot = updatedLots.find(l => l.name === lot.name && l.location === lot.location);
            if (insertedLot) {
              for (let i = 1; i <= 10; i++) {
                await addParkingSpace(insertedLot.id, i);
              }
            }
          }
          Alert.alert('Success', 'Test lots and spaces added.');
        } catch (e) {
          Alert.alert('Error', 'Failed to add test lots.');
        }
        setSaving(false);
      }}>
        <Text style={[styles.addTxt, { color: '#fff' }]}>Add 4 Test Lots (10 spaces each)</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 18, alignSelf: 'center' },
  lotCard: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 16, marginBottom: 14 },
  lotName: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  lotLocation: { fontSize: 14, color: '#888', marginBottom: 6 },
  lotSpaces: { fontSize: 14, color: colors.text, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  editBtn: { marginRight: 16 },
  editTxt: { color: '#06b6d4', fontWeight: 'bold' },
  deleteBtn: {},
  deleteTxt: { color: '#ef4444', fontWeight: 'bold' },
  addBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  addTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 24, width: 320 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#06b6d4', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { marginRight: 18 },
  cancelTxt: { color: '#888', fontWeight: 'bold' },
  saveBtn: {},
  saveTxt: { color: '#06b6d4', fontWeight: 'bold' },
});

export default ParkingLotAdminPanel;
