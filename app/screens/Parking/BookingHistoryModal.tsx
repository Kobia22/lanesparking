import React, { useEffect, useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { fetchBookingHistory } from '@/src/firebase/admin';
import type { Booking } from '@/src/firebase/types';

interface BookingHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  userIdOrPlate: string;
}

export default function BookingHistoryModal({ visible, onClose, userIdOrPlate }: BookingHistoryModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetchBookingHistory(userIdOrPlate)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [visible, userIdOrPlate]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Booking History</Text>
          {loading ? (
            <ActivityIndicator color="#2563eb" />
          ) : bookings.length === 0 ? (
            <Text style={styles.empty}>No bookings found.</Text>
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.bookingItem}>
                  <Text style={styles.bookingText}>Plate: {item.plateNumber}</Text>
                  <Text style={styles.bookingText}>Lot: {item.lotId}</Text>
                  <Text style={styles.bookingText}>Space: {item.spaceId}</Text>
                  <Text style={styles.bookingText}>Status: {item.status}</Text>
                  <Text style={styles.bookingText}>Entry: {item.entryTime?.toDate ? item.entryTime.toDate().toLocaleString() : String(item.entryTime)}</Text>
                  {item.exitTime && <Text style={styles.bookingText}>Exit: {item.exitTime?.toDate ? item.exitTime.toDate().toLocaleString() : String(item.exitTime)}</Text>}
                </View>
              )}
              style={{ maxHeight: 350 }}
            />
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', borderRadius: 14, padding: 24, width: '90%', alignItems: 'stretch', elevation: 6 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2563eb', marginBottom: 18, textAlign: 'center' },
  bookingItem: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8 },
  bookingText: { fontSize: 15, color: '#222' },
  empty: { textAlign: 'center', color: '#aaa', marginVertical: 20 },
  closeBtn: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24, marginTop: 18, alignSelf: 'center' },
  closeTxt: { color: '#fff', fontWeight: 'bold' },
});
