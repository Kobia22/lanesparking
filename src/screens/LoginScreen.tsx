import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Alert, TouchableOpacity, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For icons

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../firebase/firebaseConfig';

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [resetSent, setResetSent] = useState(false);

  const auth = getAuth(app);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Registration successful!');
        onLoginSuccess();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Login successful!');
        onLoginSuccess();
        setFailedAttempts(0);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred.');
      if (!isRegister) setFailedAttempts((prev) => prev + 1);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Please enter your email to reset password.');
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      Alert.alert('Password reset email sent!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send reset email.');
    }
    setLoading(false);
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
          <Text style={styles.subtitle}>{isRegister ? 'Register to get started' : 'Login to your account'}</Text>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
{!isRegister && failedAttempts >= 3 && (
  <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer} disabled={loading || resetSent}>
    <Text style={styles.forgotText}>
      {resetSent ? 'Check your email for a reset link.' : 'Forgot password?'}
    </Text>
  </TouchableOpacity>
) }
          {/* Email input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              textContentType="emailAddress"
              accessible accessibilityLabel="Email"
              returnKeyType="next"
              placeholderTextColor="#aaa"
            />
          </View>
          {/* Password input */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              textContentType="password"
              accessible accessibilityLabel="Password"
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
            </TouchableOpacity>
          </View>
          {/* Auth Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={isRegister ? 'Register' : 'Login'}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isRegister ? 'Register' : 'Login'}</Text>
            )}
          </TouchableOpacity>
          {/* Switch mode */}
          <TouchableOpacity onPress={() => setIsRegister((v) => !v)} accessibilityRole="button" style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.switchTextBold}>{isRegister ? 'Login' : 'Register'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  forgotContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  forgotText: {
    color: '#3b82f6',
    fontSize: 15,
    textDecorationLine: 'underline',
    marginTop: 4,
    marginBottom: 4,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafd',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
    color: '#222',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    color: '#c00',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fafbfc',
    paddingLeft: 8,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  switchText: {
    color: '#444',
    fontSize: 15,
  },
  switchTextBold: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});
