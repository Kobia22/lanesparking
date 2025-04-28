// LoginScreen - Handles login/register for students and guests
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/src/firebase/firebaseConfig';

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

  const auth = getAuth(app);

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
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Registration successful!');
        onLoginSuccess?.();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#b0b0b0"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#b0b0b0"
        />
      </View>
      <TouchableOpacity style={styles.switchButton} onPress={() => setIsRegister((v) => !v)}>
        <Text style={styles.switchText}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleAuth} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isRegister ? 'Register' : 'Login'}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5faff',
  },
  brand: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
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
    borderColor: '#38bdf8',
    borderWidth: 1,
  },
  guestRole: {
    backgroundColor: '#e0ffe0',
    color: '#15803d',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },
  input: {
    width: 300,
    height: 48,
    borderColor: '#d1d5db',
    borderWidth: 1.3,
    borderRadius: 10,
    marginBottom: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#222',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 80,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  switchButton: {
    marginBottom: 8,
  },
  switchText: {
    color: '#2563eb',
    fontSize: 15,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});
