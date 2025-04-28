// AppNavigator - Handles main stack and tab navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ParkingListScreen from '@/app/screens/Parking/ParkingListScreen';
import ParkingDetailScreen from '@/app/screens/Parking/ParkingDetailScreen';
import BookingConfirmationScreen from '@/app/screens/Parking/BookingConfirmationScreen';
import LoginScreen from '@/app/screens/Auth/LoginScreen';
import HomeScreen from '@/app/screens/HomeScreen';
import BookingsListScreen from '@/app/screens/Bookings/BookingsListScreen';
import NotificationsScreen from '@/app/screens/Notifications/NotificationsScreen';
import AdminDashboardScreen from '@/app/screens/Admin/AdminDashboardScreen';
import AnalyticsScreen from '@/app/screens/Admin/AnalyticsScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ParkingStack() {
  return (
    <Stack.Navigator initialRouteName="ParkingList" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ParkingList" component={ParkingListScreen} options={{ title: 'Parking Spaces' }} />
      <Stack.Screen name="ParkingDetail" component={ParkingDetailScreen} options={{ title: 'Space Details' }} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ title: 'Booking Confirmation' }} />
    </Stack.Navigator>
  );
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminDashboard" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
    </Stack.Navigator>
  );
}

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: IoniconName = 'home';
          if (route.name === 'Parking') iconName = 'car';
          else if (route.name === 'Bookings') iconName = 'list';
          else if (route.name === 'Notifications') iconName = 'notifications';
          else if (route.name === 'Admin') iconName = 'settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#38bdf8',
        tabBarInactiveTintColor: '#888',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Parking" component={ParkingStack} />
      <Tab.Screen name="Bookings" component={BookingsListScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Admin" component={AdminStack} options={{ title: 'Admin' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // This should be wrapped in authentication logic in the main App
  return (
    <NavigationContainer>
      <HomeTabs />
    </NavigationContainer>
  );
}
