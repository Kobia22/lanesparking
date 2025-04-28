import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchParkingLots } from '@/src/firebase/database';
import { colors } from '@/app/constants/theme';
import type { ParkingLot } from '@/src/firebase/types';
import { useNavigation } from '@react-navigation/native';



const ParkingLotsScreen = () => {
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Reload lots when screen is focused (e.g., after admin adds/edits)
  useEffect(() => {
    fetchParkingLots().then((lotsData) => setLots(lotsData as ParkingLot[])).finally(() => setLoading(false));
  }, []);

  // Reload on focus
  const { addListener } = useNavigation();
  useEffect(() => {
    const unsubscribe = addListener('focus', () => {
      setLoading(true);
      fetchParkingLots().then((lotsData) => setLots(lotsData as ParkingLot[])).finally(() => setLoading(false));
    });
    return unsubscribe;
  }, [addListener]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  if (!lots || lots.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No Parking Lots Found</Text>
        <Text style={styles.emptySubtitle}>Please contact the admin or add lots from the admin panel.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Parking Lots</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => {
          setLoading(true);
          fetchParkingLots().then((lotsData) => setLots(lotsData as ParkingLot[])).finally(() => setLoading(false));
        }}>
          <Text style={styles.refreshTxt}>Refresh</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={lots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const available = item.availableSpaces;
          const total = item.totalSpaces;
          const allFull = available === 0;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => (navigation as any).navigate('ParkingLotDetail', { lot: item })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={styles.lotName}>{item.name}</Text>
                  <Text style={styles.lotLocation}>{item.location}</Text>
                </View>
                <View style={[styles.badge, allFull ? styles.fullBadge : styles.availableBadge]}>
                  <Text style={styles.badgeText}>{allFull ? 'Full' : 'Spaces'}</Text>
                  <Text style={styles.badgeCount}>{available}</Text>
                </View>
              </View>
              <Text style={styles.lotSpaces}>{available} / {total} spaces available</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fafc' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 24, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.primary, letterSpacing: 0.5 },
  refreshBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 18 },
  refreshTxt: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 16, paddingTop: 0 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  lotName: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 2 },
  lotLocation: { fontSize: 15, color: '#888', marginBottom: 2 },
  lotSpaces: { fontSize: 14, color: '#555', marginTop: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, minWidth: 56, justifyContent: 'center' },
  availableBadge: { backgroundColor: '#22c55e' },
  fullBadge: { backgroundColor: '#ef4444' },
  badgeText: { color: '#fff', fontWeight: 'bold', marginRight: 6 },
  badgeCount: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyTitle: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  emptySubtitle: { fontSize: 16, color: '#888', textAlign: 'center', marginHorizontal: 24 },
});

export default ParkingLotsScreen;
