import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { fetchParkingSpaces } from '@/src/firebase/database';
import { addParkingSpace } from '@/src/firebase/database';
import { colors } from '@/app/constants/theme';
import type { ParkingSpace } from '@/src/firebase/types';

const ParkingSpaceAdminPanel = ({ lotId }: { lotId: string }) => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ number: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchParkingSpaces().then(spaces => setSpaces(spaces.filter(s => s.lotId === lotId))).finally(() => setLoading(false));
  }, [lotId]);

  const openAddModal = () => {
    setForm({ number: '' });
    setModalVisible(true);
  };

  const handleAdd = async () => {
    setSaving(true);
    // Add parking space with lotId and number, set isOccupied to false by default
    await addParkingSpace(lotId, Number(form.number));
    const updatedSpaces = await fetchParkingSpaces();
    setSpaces(updatedSpaces.filter(s => s.lotId === lotId));
    setSaving(false);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Spaces</Text>
      {loading ? <ActivityIndicator color={colors.primary} size="large" /> : (
        <FlatList
          data={spaces}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.spaceCard}>
              <Text style={styles.spaceNum}>#{item.number}</Text>
              <Text style={item.isOccupied ? styles.occupied : styles.free}>{item.isOccupied ? 'Occupied' : 'Free'}</Text>
            </View>
          )}
          ListEmptyComponent={<Text>No spaces found.</Text>}
        />
      )}
      <TouchableOpacity style={styles.addBtn} onPress={openAddModal}><Text style={styles.addTxt}>+ Add Space</Text></TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Space</Text>
            <TextInput style={styles.input} placeholder="Number" value={form.number} keyboardType="number-pad" onChangeText={number => setForm({ ...form, number })} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}><Text style={styles.cancelTxt}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={saving}><Text style={styles.saveTxt}>{saving ? 'Saving...' : 'Save'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 18, alignSelf: 'center' },
  spaceCard: { backgroundColor: '#f1f5f9', borderRadius: 10, padding: 16, marginBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  spaceNum: { fontSize: 18, fontWeight: 'bold', color: colors.primary },
  occupied: { color: '#a3a3a3', fontWeight: 'bold' },
  free: { color: colors.primary, fontWeight: 'bold' },
  addBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  addTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, padding: 24, width: 320 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#06b6d4', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 16 },
  toggleBtn: { padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8, marginBottom: 12, alignItems: 'center' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { marginRight: 18 },
  cancelTxt: { color: '#888', fontWeight: 'bold' },
  saveBtn: {},
  saveTxt: { color: '#06b6d4', fontWeight: 'bold' },
});

export default ParkingSpaceAdminPanel;
