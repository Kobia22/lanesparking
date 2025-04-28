import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { fetchActiveOrAbandonedBookings } from '@/src/firebase/admin';

import { useNavigation } from '@react-navigation/native';

const AdminDashboardScreen = ({ navigation }: any) => {
  const nav = navigation || useNavigation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveOrAbandonedBookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Active/Abandoned Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>ID: {item.id}</Text>
            <Text>Status: {item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No bookings found.</Text>}
      />
      <TouchableOpacity style={styles.adminBtn} onPress={() => nav.navigate('ParkingLotAdminPanel')}>
        <Text style={styles.adminBtnText}>Manage Parking Lots</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.adminBtn} onPress={() => nav.navigate('ParkingSpaceAdminPanel', { lotId: null })}>
        <Text style={styles.adminBtnText}>Manage Parking Spaces</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, color: '#38bdf8' },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', width: 300, alignSelf: 'center' },
  adminBtn: { backgroundColor: '#06b6d4', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16, width: 220 },
  adminBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default AdminDashboardScreen;
