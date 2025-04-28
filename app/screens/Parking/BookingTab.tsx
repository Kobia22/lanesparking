import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { fetchBookingHistory } from '@/src/firebase/admin';
import type { Booking } from '@/src/firebase/types';

interface BookingTabProps {
  userIdOrPlate: string;
}

export default function BookingTab({ userIdOrPlate }: BookingTabProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBookingHistory(userIdOrPlate)
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [userIdOrPlate]);

  const activeBooking = bookings.find(b => b.status === 'active' || b.status === 'pending');
  const history = bookings.filter(b => b.status !== 'active' && b.status !== 'pending');

  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>🚗 <Text style={{color:'#2563eb',fontWeight:'bold'}}>Active Booking</Text></Text>
      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : activeBooking ? (
        <View style={[styles.bookingBox, styles.activeBox]}>
          <View style={styles.rowBetween}>
            <Text style={styles.bookingTitle}>Plate: <Text style={{fontWeight:'bold'}}>{activeBooking.plateNumber}</Text></Text>
            <View style={[styles.statusBadge, {backgroundColor:'#34d399'}]}>
              <Text style={styles.statusText}>{activeBooking.status?.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.detail}><Text style={styles.label}>Lot:</Text> {activeBooking.lotId}</Text>
          <Text style={styles.detail}><Text style={styles.label}>Space:</Text> {activeBooking.spaceId}</Text>
          <Text style={styles.detail}><Text style={styles.label}>Entry:</Text> {activeBooking.entryTime?.toDate ? activeBooking.entryTime.toDate().toLocaleString() : String(activeBooking.entryTime)}</Text>
        </View>
      ) : (
        <Text style={styles.empty}>No active booking.</Text>
      )}

      <Text style={styles.sectionHeader}>🕓 <Text style={{color:'#2563eb',fontWeight:'bold'}}>Booking History</Text></Text>
      {loading ? (
        <ActivityIndicator color="#2563eb" />
      ) : history.length === 0 ? (
        <Text style={styles.empty}>No booking history found.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={[styles.bookingBox, styles.historyBox]}>
              <View style={styles.rowBetween}>
                <Text style={styles.bookingTitle}>Plate: <Text style={{fontWeight:'bold'}}>{item.plateNumber}</Text></Text>
                <View style={[styles.statusBadge, {backgroundColor:'#a1a1aa'}]}>
                  <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.detail}><Text style={styles.label}>Lot:</Text> {item.lotId}</Text>
              <Text style={styles.detail}><Text style={styles.label}>Space:</Text> {item.spaceId}</Text>
              <Text style={styles.detail}><Text style={styles.label}>Entry:</Text> {item.entryTime?.toDate ? item.entryTime.toDate().toLocaleString() : String(item.entryTime)}</Text>
              {item.exitTime && <Text style={styles.detail}><Text style={styles.label}>Exit:</Text> {item.exitTime?.toDate ? item.exitTime.toDate().toLocaleString() : String(item.exitTime)}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5faff' },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginTop: 18, marginBottom: 6, color: '#222' },
  bookingBox: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginVertical: 8, elevation: 2 },
  activeBox: { borderLeftWidth: 6, borderLeftColor: '#2563eb' },
  historyBox: { opacity: 0.9, borderLeftWidth: 4, borderLeftColor: '#a1a1aa' },
  bookingTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 2 },
  label: { color: '#2563eb', fontWeight: 'bold' },
  detail: { fontSize: 15, color: '#222', marginBottom: 1 },
  empty: { color: '#aaa', textAlign: 'center', marginVertical: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-end' },
  statusText: { color: '#fff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
});
