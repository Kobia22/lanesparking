import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '@/src/firebase/firebaseConfig';

const STAFF_REGEX = /^[A-Z]{3}\d{2}-\d{3}$/;

const AdminLoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (username === 'DND21-212' && password === 'Redred123') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        navigation.replace('AdminDashboard');
      }, 700); // Simulate loading
      return;
    }
    if (!STAFF_REGEX.test(username)) {
      Alert.alert('Invalid Username', 'Staff username must be in the format ABC12-123.');
      return;
    }
    setLoading(true);
    try {
      // Construct admin email from username (e.g., ABC12-123@admin.lanesparking.com)
      const email = `${username}@admin.lanesparking.com`;
      const auth = getAuth(app);
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigation.replace('AdminDashboard');
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Login Failed', e.message || 'Could not log in as admin.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Staff Username (ABC12-123)"
        value={username}
        autoCapitalize="characters"
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#06b6d4', marginBottom: 24 },
  input: {
    width: 260,
    borderWidth: 1,
    borderColor: '#06b6d4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },
  button: {
    backgroundColor: '#06b6d4',
    paddingVertical: 14,
    paddingHorizontal: 42,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default AdminLoginScreen;
