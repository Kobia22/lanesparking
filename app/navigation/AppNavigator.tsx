// AppNavigator - Handles main stack and tab navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ParkingLotsScreen from '@/app/screens/Parking/ParkingLotsScreen';
import ParkingLotDetailScreen from '@/app/screens/Parking/ParkingLotDetailScreen';
import BookingScreen from '@/app/screens/Bookings/BookingScreen';
import LoginScreen from '@/app/screens/Auth/LoginScreen';
import HomeScreen from '@/app/screens/HomeScreen';
import BookingsListScreen from '@/app/screens/Bookings/BookingsListScreen';
import NotificationsScreen from '@/app/screens/Notifications/NotificationsScreen';
import AdminDashboardScreen from '@/app/screens/Admin/AdminDashboardScreen';
import AdminLoginScreen from '@/app/screens/Admin/AdminLoginScreen';
import AnalyticsScreen from '@/app/screens/Admin/AnalyticsScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function ParkingStack() {
  return (
    <Stack.Navigator initialRouteName="ParkingLots" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="ParkingLots" component={ParkingLotsScreen} options={{ title: 'Parking Lots' }} />
      <Stack.Screen name="ParkingLotDetail" component={ParkingLotDetailScreen} options={{ title: 'Lot Details' }} />
      <Stack.Screen name="BookingScreen" component={BookingScreen} options={{ title: 'Book Space' }} />
    </Stack.Navigator>
  );
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function AdminStack() {
  return (
    <Stack.Navigator initialRouteName="AdminLogin" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: 'Admin Login', headerShown: false }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="ParkingLotAdminPanel" component={require('@/app/screens/Admin/ParkingLotAdminPanel').default} options={{ title: 'Manage Lots' }} />
      <Stack.Screen name="ParkingSpaceAdminPanel" component={require('@/app/screens/Admin/ParkingSpaceAdminPanel').default} options={{ title: 'Manage Spaces' }} />
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
