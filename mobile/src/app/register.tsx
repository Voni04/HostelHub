// Imports the backend API address from our central configuration file.
import { API_URL } from '../services/api';
// useState stores the values entered by the user.
import { useState } from 'react';

// router lets us navigate back to the Login screen.
import { router } from 'expo-router';

// React Native components used to build the screen.
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// Keeps content inside the safe area of the phone screen.
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  // State variables for each registration field.
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Runs when the user presses CREATE ACCOUNT.
// "async" allows us to wait for the backend response.
const handleRegister = async () => {
  // Check whether any field is empty.
  if (!name || !email || !password || !confirmPassword) {
    Alert.alert('Missing Details', 'Please complete all fields.');
    return;
  }

  // Check whether both passwords match.
  if (password !== confirmPassword) {
    Alert.alert('Password Error', 'Passwords do not match.');
    return;
  }

  // Our backend requires passwords to have at least 6 characters.
  if (password.length < 6) {
    Alert.alert(
      'Password Error',
      'Password must be at least 6 characters long.'
    );
    return;
  }

  try {
    // Send the registration information to our Express backend.
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',

      // Tell the backend that we are sending JSON data.
      headers: {
        'Content-Type': 'application/json',
      },

      // Convert the JavaScript object into JSON before sending it.
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });

    // Convert the response from the backend into JavaScript data.
    const data = await response.json();

    // response.ok means the backend returned a successful status code.
    if (response.ok) {
      Alert.alert(
        'Registration Successful',
        'Your HostelHub account has been created.'
      );

      // After successful registration, return to the Login screen.
      router.replace('/');
    } else {
      // Show the error message returned by our backend.
      Alert.alert(
        'Registration Failed',
        data.message || 'Unable to create account.'
      );
    }
  } catch (error) {
    // This normally happens if the mobile app cannot reach the backend.
    console.log('Registration error:', error);

    Alert.alert(
      'Connection Error',
      'Could not connect to the HostelHub server.'
    );
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.logo}>HostelHub</Text>

          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.subtitle}>
            Register to start managing your hostel bookings
          </Text>

          {/* Full name input */}
          <Text style={styles.label}>Full Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={name}
            onChangeText={setName}
          />

          {/* Email input */}
          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {/* Password input */}
          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Confirm password input */}
          <Text style={styles.label}>Confirm Password</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your password again"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {/* Registration button */}
          <Pressable
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>
              CREATE ACCOUNT
            </Text>
          </Pressable>

          {/* Navigate back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?
            </Text>

            <Pressable
              style={styles.loginButton}
              onPress={() => router.replace('/')}
            >
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },

  formContainer: {
    width: '100%',
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2563EB',
    marginBottom: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 18,
  },

  registerButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loginContainer: {
    marginTop: 24,
    alignItems: 'center',
  },

  loginText: {
    color: '#6B7280',
    fontSize: 14,
  },

  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  loginLink: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 15,
  },
});