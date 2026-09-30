// Imports the address of our HostelHub backend API.
import { API_URL } from '../services/api';

// router lets us navigate back to the Rooms screen.
import { router } from 'expo-router';

// SecureStore lets us read the JWT token
// that was saved after login.
import * as SecureStore from 'expo-secure-store';

// useState stores the values entered into the form.
import { useState } from 'react';

// React Native components used to build the form.
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

// SafeAreaView keeps content inside the safe area of the phone.
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddRoomScreen() {
  // Store the value entered into each form field.
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  // Prevents the button from being pressed repeatedly
  // while the room is being created.
  const [loading, setLoading] = useState(false);

  // This function runs when the user presses ADD ROOM.
  const handleAddRoom = async () => {
    // Remove unnecessary spaces from text fields.
    const cleanRoomNumber = roomNumber.trim();
    const cleanRoomType = roomType.trim();
    const cleanDescription = description.trim();

    // Check that the required fields are not empty.
    if (
      !cleanRoomNumber ||
      !cleanRoomType ||
      !pricePerMonth ||
      !capacity
    ) {
      Alert.alert(
        'Validation Error',
        'Please complete all required fields.'
      );

      return;
    }

    // Our backend only accepts these three room types.
    if (
      cleanRoomType !== 'Single' &&
      cleanRoomType !== 'Double' &&
      cleanRoomType !== 'Triple'
    ) {
      Alert.alert(
        'Validation Error',
        'Room type must be Single, Double, or Triple.'
      );

      return;
    }

    // Convert the price and capacity from text into numbers.
    const priceNumber = Number(pricePerMonth);
    const capacityNumber = Number(capacity);

    // Validate the monthly price.
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      Alert.alert(
        'Validation Error',
        'Please enter a valid monthly price.'
      );

      return;
    }

    // Capacity must be a whole number greater than zero.
    if (
      !Number.isInteger(capacityNumber) ||
      capacityNumber < 1
    ) {
      Alert.alert(
        'Validation Error',
        'Capacity must be a whole number greater than 0.'
      );

      return;
    }

    try {
      // Disable the button while the request is running.
      setLoading(true);

      // Read the JWT saved during login.
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please log in again.'
        );

        return;
      }

      // Send the new room information to the backend.
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',

        headers: {
          // Tell Express that we are sending JSON data.
          'Content-Type': 'application/json',

          // Send the JWT because this is a protected route.
          Authorization: `Bearer ${token}`,
        },

        // Convert the JavaScript object into JSON.
        body: JSON.stringify({
          roomNumber: cleanRoomNumber,
          roomType: cleanRoomType,
          pricePerMonth: priceNumber,
          capacity: capacityNumber,
          description: cleanDescription,
        }),
      });

      // Convert the backend response into JavaScript data.
      const data = await response.json();

      if (response.ok) {
        // The backend successfully created the room.
        Alert.alert(
          'Room Created',
          'The new room was added successfully.',
          [
            {
              text: 'OK',

              // Return to the Rooms screen.
              onPress: () => router.replace('/rooms'),
            },
          ]
        );
      } else {
        // Display an error returned by the backend.
        Alert.alert(
          'Unable to Create Room',
          data.message || 'Something went wrong.'
        );
      }
    } catch (error) {
      console.log('Add room error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the HostelHub server.'
      );
    } finally {
      // Enable the button again.
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Application name */}
        <Text style={styles.logo}>
          HostelHub
        </Text>

        {/* Screen heading */}
        <Text style={styles.title}>
          Add New Room
        </Text>

        {/* Room Number */}
        <Text style={styles.label}>
          Room Number *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: A102"
          value={roomNumber}
          onChangeText={setRoomNumber}
          autoCapitalize="characters"
        />

        {/* Room Type */}
        <Text style={styles.label}>
          Room Type *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Single, Double, or Triple"
          value={roomType}
          onChangeText={setRoomType}
          autoCapitalize="words"
        />

        {/* Monthly Price */}
        <Text style={styles.label}>
          Monthly Price (Rs.) *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: 30000"
          value={pricePerMonth}
          onChangeText={setPricePerMonth}
          keyboardType="numeric"
        />

        {/* Capacity */}
        <Text style={styles.label}>
          Capacity *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Example: 2"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />

        {/* Description */}
        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Enter room description"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Submit button */}
        <Pressable
          style={[
            styles.addButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleAddRoom}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>
            {loading ? 'ADDING ROOM...' : 'ADD ROOM'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// Visual styles for the Add Room screen.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 7,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 18,
  },

  descriptionInput: {
    minHeight: 100,
  },

  addButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});