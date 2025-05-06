// Main App entry point - handles auth and navigation
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
// Replace web SDK imports with React Native Firebase import
import { auth } from '@/src/firebase/firebaseConfig';
import LoginScreen from '@/app/screens/Auth/LoginScreen';
import AppNavigator from '@/app/navigation/AppNavigator';

export default function App() {
  // Update type to match React Native Firebase user
  const [user, setUser] = useState<any | null | undefined>(undefined);

  useEffect(() => {
    // Use React Native Firebase auth listener
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    // Use React Native Firebase auth
    return <LoginScreen onLoginSuccess={() => setUser(auth.currentUser)} />;
  }

  return <AppNavigator />;
}