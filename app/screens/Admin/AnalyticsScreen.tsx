import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { fetchAnalytics } from '@/src/firebase/admin';

const AnalyticsScreen = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(setAnalytics)
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
      <Text style={styles.text}>Analytics</Text>
      {analytics ? (
        <View style={{ marginTop: 20 }}>
          <Text>Daily Revenue: {analytics.dailyRevenue}</Text>
          <Text>Weekly Revenue: {analytics.weeklyRevenue}</Text>
          <Text>Occupancy Rate: {analytics.occupancyRate}</Text>
          <Text>Abandoned Count: {analytics.abandonedCount}</Text>
        </View>
      ) : (
        <Text>No analytics data.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, color: '#38bdf8' },
});

export default AnalyticsScreen;
