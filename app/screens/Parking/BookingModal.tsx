import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { createBooking } from '@/src/firebase/bookings';
import type { ParkingLot, ParkingSpace } from '@/src/firebase/types';

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  lot: ParkingLot;
  space: ParkingSpace;
  onBooked: () => void;
}

export default function BookingModal({ visible, onClose, lot, space, onBooked }: BookingModalProps) {
  const [plateNumber, setPlateNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!plateNumber) {
      Alert.alert('Error', 'Please enter your plate number.');
      return;
    }
    setLoading(true);
    try {
      await createBooking({
        plateNumber,
        lotId: lot.id,
        spaceId: space.id,
        userType: 'guest', // Assume guest for now; can be dynamic if you have auth
        email: email || undefined,
      });
      setLoading(false);
      Alert.alert('Success', 'Parking space booked!');
      setPlateNumber('');
      setEmail('');
      onBooked();
      onClose();
    } catch (e) {
      setLoading(false);
      Alert.alert('Booking Failed', 'Could not book this space.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Book Space #{space.number} ({lot.name})</Text>
          <TextInput
            style={styles.input}
            placeholder="Plate Number"
            value={plateNumber}
            onChangeText={setPlateNumber}
            autoCapitalize="characters"
          />
          <TextInput
            style={styles.input}
            placeholder="Email (optional)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookBtn} onPress={handleBook} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bookTxt}>Book</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 14, padding: 24, width: '90%', alignItems: 'stretch', elevation: 6 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginBottom: 18, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { backgroundColor: '#eee', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  cancelTxt: { color: '#444', fontWeight: 'bold' },
  bookBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  bookTxt: { color: '#fff', fontWeight: 'bold' },
});
