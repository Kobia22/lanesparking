// Main App entry point - handles auth and navigation
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import { app } from '@/src/firebase/firebaseConfig';
import LoginScreen from '@/app/screens/Auth/LoginScreen';
import AppNavigator from '@/app/navigation/AppNavigator';

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
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
    return <LoginScreen onLoginSuccess={() => setUser(getAuth(app).currentUser)} />;
  }

  return <AppNavigator />;
}
