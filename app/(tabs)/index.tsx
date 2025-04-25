import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import LoginScreen from '@/src/screens/LoginScreen';
import ParkingListScreen from '@/src/screens/ParkingListScreen';
import ParkingDetailScreen from '@/src/screens/ParkingDetailScreen';
import BookingConfirmationScreen from '@/src/screens/BookingConfirmationScreen';

import type { ParkingSpace } from '@/src/types';

export type RootStackParamList = {
  Login: undefined;
  ParkingList: undefined;
  ParkingDetail: { parkingSpace: ParkingSpace };
  BookingConfirmation: { parkingSpace: ParkingSpace };
};

const Stack = createStackNavigator<RootStackParamList>();

// Optional: Default screen options for a consistent look
const screenOptions: StackNavigationOptions = {
  headerStyle: {
    backgroundColor: '#A1CEDC',
    shadowColor: 'transparent',
  },
  headerTitleAlign: 'center',
  headerTintColor: '#222',
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
};

export default function App() {
  // Optionally, you could add a loading state if you use async providers (e.g., auth, fonts)
  // const [isReady, setIsReady] = React.useState(true);
  // if (!isReady) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
        <Stack.Screen name="ParkingList" component={ParkingListScreen} options={{ title: 'Available Parking' }} />
        <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} options={{ title: 'Parking Details' }} />
        <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ title: 'Booking Confirmed' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// All unused styles and StyleSheet import have been removed for clarity.
