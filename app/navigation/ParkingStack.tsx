import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ParkingLotsScreen from '@/app/screens/Parking/ParkingLotsScreen';
import ParkingLotDetailScreen from '@/app/screens/Parking/ParkingLotDetailScreen';
import BookingScreen from '@/app/screens/Bookings/BookingScreen';

const Stack = createStackNavigator();

const ParkingStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="ParkingLots" component={ParkingLotsScreen} options={{ title: 'Parking Lots' }} />
    <Stack.Screen name="ParkingLotDetail" component={ParkingLotDetailScreen} options={{ title: 'Lot Details' }} />
    <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ title: 'Book Space' }} />
  </Stack.Navigator>
);

export default ParkingStack;
