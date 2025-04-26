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

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
        <Stack.Screen
  name="Login"
  children={(props) => (
    <LoginScreen
      {...props}
      onLoginSuccess={() => {
        // Example: Navigate to ParkingList on successful login
        // You can customize this logic as needed
        props.navigation.replace('ParkingList');
      }}
    />
  )}
/>
        <Stack.Screen name="ParkingList" component={ParkingListScreen} />
        <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} />
        <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
