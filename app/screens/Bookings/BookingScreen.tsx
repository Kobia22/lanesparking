import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createBooking } from '@/src/firebase/bookings';
import { colors } from '@/app/constants/theme';

const BookingScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { lot, space } = route.params;

  const handleConfirm = async () => {
    // TODO: Get user info from context/auth
    try {
      await createBooking({
        lotId: lot.id,
        spaceId: space.id,
        plateNumber: 'KAA123A', // TODO: collect from user
        userType: 'student', // TODO: get from auth
      });
      Alert.alert('Success', 'Booking created!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not book this space.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Space #{space.number}</Text>
      <Text style={styles.lot}>{lot.name}</Text>
      <Button title="Confirm Booking" onPress={handleConfirm} color={colors.primary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  lot: { fontSize: 15, color: colors.primary, marginBottom: 18 },
});

export default BookingScreen;
