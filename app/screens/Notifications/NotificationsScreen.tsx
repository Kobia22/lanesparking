import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const mockNotifications = [
  { id: '1', message: 'Your booking will expire soon.' },
  { id: '2', message: 'Payment received for booking #123.' },
  { id: '3', message: 'Booking marked as abandoned.' },
];

const NotificationsScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Notifications</Text>
    <FlatList
      data={mockNotifications}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.message}</Text>
        </View>
      )}
      ListEmptyComponent={<Text>No notifications.</Text>}
    />
  </View>
);


const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  text: { fontSize: 20, color: '#38bdf8' },
  item: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', width: 300, alignSelf: 'center' },
});

export default NotificationsScreen;
