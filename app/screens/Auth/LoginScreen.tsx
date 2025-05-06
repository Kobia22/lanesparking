// LoginScreen - Handles login/register for students and guests
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth } from '@/src/firebase/firebaseConfig'; // Use the React Native Firebase import
import ThemedForm from '@/app/components/ThemedForm';
import { colors } from '@/app/constants/theme';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const STUDENT_EMAIL_REGEX = /^[a-zA-Z]+\.[a-zA-Z]+@students\.jkuat\.ac\.ke$/;

  function getRole(email: string) {
    if (STUDENT_EMAIL_REGEX.test(email)) return 'student';
    return 'guest';
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  // No need to initialize auth here as we're importing it directly

  const handleAuth = async () => {
    setLoading(true);
    const role = getRole(email);
    try {
      if (role === 'student' && !STUDENT_EMAIL_REGEX.test(email)) {
        Alert.alert('Error', 'Student emails must be in the format name.name@students.jkuat.ac.ke');
        setLoading(false);
        return;
      }
      if (isRegister) {
        // React Native Firebase syntax
        await auth.createUserWithEmailAndPassword(email, password);
        Alert.alert('Registration successful!');
        onLoginSuccess?.();
      } else {
        // React Native Firebase syntax
        await auth.signInWithEmailAndPassword(email, password);
        Alert.alert('Login successful!');
        onLoginSuccess?.();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>LanesParking</Text>
      <Text style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
      <Text style={[styles.roleInfo, getRole(email) === 'student' ? styles.studentRole : styles.guestRole]}>
        {getRole(email) === 'student' ? 'Student Login' : 'Guest Login'}
      </Text>
      <TouchableOpacity style={styles.switchButton} onPress={() => setIsRegister((v) => !v)}>
        <Text style={styles.switchText}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
      <ThemedForm
        title={isRegister ? 'Register' : 'Login'}
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleAuth}
        loading={loading}
        submitLabel={isRegister ? 'Register' : 'Login'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff', // white
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.text,
  },
  roleInfo: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  studentRole: {
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    borderColor: colors.accent,
    borderWidth: 1,
  },
  guestRole: {
    backgroundColor: '#ede9fe',
    color: '#06b6d4',
    borderColor: colors.primary,
    borderWidth: 1,
  },
  switchButton: {
    marginBottom: 8,
  },
  switchText: {
    color: '#06b6d4',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});