import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { onAuthStateChanged, getAuth, User } from 'firebase/auth';
import LoginScreen from '@/src/screens/LoginScreen';
import { useRouter, Slot } from 'expo-router';
import { app } from '@/src/firebase/firebaseConfig';

export default function AppEntry() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        router.replace('/(tabs)/home');
      }
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
    return <LoginScreen onLoginSuccess={() => router.replace('/(tabs)/home')} />;
  }

  return <Slot />;
}

