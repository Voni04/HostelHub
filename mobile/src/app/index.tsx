// Imports the address of our HostelHub backend API.
import { API_URL } from '../services/api';

// SecureStore lets us securely save and read the JWT token on the phone.
import * as SecureStore from 'expo-secure-store';

// useState stores values that can change.
import { useState } from 'react';

// router lets us navigate between screens.
import { router } from 'expo-router';

// React Native components used to build the Login screen.
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// SafeAreaView keeps content away from unsafe areas of the phone screen.
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  // Stores the email entered by the user.
  const [email, setEmail] = useState('');

  // Stores the password entered by the user.
  const [password, setPassword] = useState('');

  // Runs when the LOGIN button is pressed.
  const handleLogin = async () => {
    // Check whether both fields are completed.
    if (!email || !password) {
      Alert.alert(
        'Missing Details',
        'Please enter your email and password.'
      );
      return;
    }

    try {
      // Send the login details to our Express backend.
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',

        // Tell the backend that we are sending JSON.
        headers: {
          'Content-Type': 'application/json',
        },

        // Convert the login details into JSON.
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // Convert the backend response into JavaScript data.
      const data = await response.json();

      // Check whether the login was successful.
      if (response.ok) {
        // Securely save the JWT token on the phone.
        await SecureStore.setItemAsync('userToken', data.token);

        // Read the stored JWT token.
        const savedToken =
          await SecureStore.getItemAsync('userToken');

        // Test the stored token using our protected profile route.
        const profileResponse = await fetch(
          `${API_URL}/auth/profile`,
          {
            method: 'GET',

            // Send the JWT in the Authorization header.
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          }
        );

        // Convert the protected route response into JavaScript data.
        const profileData = await profileResponse.json();

        // If the protected route accepts the JWT,
        // authentication is completely successful.
        if (profileResponse.ok) {
          console.log(
            'Protected profile request successful'
          );

          // Show the user's name after successful authentication.
          Alert.alert(
            'Login Successful',
            `Welcome ${profileData.user.name}!`,
            [
              {
                text: 'Continue',

                // After the user presses Continue,
                // navigate to the HostelHub Home screen.
                onPress: () => router.replace('/home'),
              },
            ]
          );
        } else {
          // The login worked, but the protected route failed.
          Alert.alert(
            'Authentication Error',
            profileData.message ||
              'Could not access the protected profile.'
          );
        }
      } else {
        // Login details were rejected by the backend.
        Alert.alert(
          'Login Failed',
          data.message || 'Invalid email or password.'
        );
      }
    } catch (error) {
      // This usually means the app cannot reach the backend.
      console.log('Login error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the HostelHub server.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        {/* Application name */}
        <Text style={styles.logo}>HostelHub</Text>

        {/* Login heading */}
        <Text style={styles.title}>Welcome Back</Text>

        <Text style={styles.subtitle}>
          Sign in to continue to your hostel account
        </Text>

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

        {/* Login button */}
        <Pressable
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>
            LOGIN
          </Text>
        </Pressable>

        {/* Registration section */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Don't have an account?
          </Text>

          {/* Navigate to Register screen */}
          <Pressable
            style={styles.createAccountButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.registerLink}>
              Create Account
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Visual styles for the Login screen.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
    marginBottom: 32,
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
    marginBottom: 20,
  },

  loginButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  registerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },

  registerText: {
    color: '#6B7280',
    fontSize: 14,
  },

  createAccountButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 4,
  },

  registerLink: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 15,
  },
});