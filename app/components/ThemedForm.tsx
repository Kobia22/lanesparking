import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native';
import { colors, formShadow } from '../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ThemedFormProps {
  title: string;
  email: string;
  password: string;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onSubmit: (e: GestureResponderEvent) => void;
  loading?: boolean;
  error?: string;
  submitLabel?: string;
}

const ThemedForm: React.FC<ThemedFormProps> = ({
  title,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  error,
  submitLabel = 'Login',
}) => (
  <View style={styles.form}>
    <View style={styles.decorativeBackground} />
    <View style={styles.loginArea}>
      <Text style={styles.loginTitle}>{title}</Text>
    </View>
    <View style={styles.emailArea}>
      <View style={styles.inputContainer}>
        <Icon name="email" size={24} color="#06b6d4" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={onEmailChange}
          editable={!loading}
        />
      </View>
    </View>
    <View style={styles.passwordArea}>
      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#06b6d4" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ccc"
          secureTextEntry
          value={password}
          onChangeText={onPasswordChange}
          editable={!loading}
        />
      </View>
    </View>
    <View style={styles.footerArea}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={styles.button}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>{loading ? 'Loading...' : submitLabel}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  form: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: 280,
    height: 360,
    borderRadius: 16,
    ...formShadow,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 32,
    marginHorizontal: 'auto',
  },
  decorativeBackground: {
    width: 120,
    height: 120,
    backgroundColor: '#06b6d4',
    position: 'absolute',
    top: -60,
    left: -60,
    borderRadius: 60,
    zIndex: 1,
  },
  loginArea: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 2,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06b6d4',
  },
  emailArea: {
    width: '100%',
    paddingHorizontal: '10%',
    marginTop: 16,
    marginBottom: 8,
  },
  passwordArea: {
    width: '100%',
    paddingHorizontal: '10%',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#06b6d4',
    height: 40,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  footerArea: {
    width: '100%',
    paddingHorizontal: '10%',
    marginTop: 8,
    alignItems: 'center',
  },
  button: {
    width: '100%',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginTop: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default ThemedForm;
