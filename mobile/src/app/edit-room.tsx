// Imports the address of our HostelHub backend API.
import { API_URL } from '../services/api';

// router lets us navigate after updating.
// useLocalSearchParams receives the selected room ID.
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

// SecureStore lets us read the JWT token
// that was saved after login.
import * as SecureStore from 'expo-secure-store';

// useEffect runs code when the screen opens.
// useState stores form values and loading states.
import { useEffect, useState } from 'react';

// React Native components used to build the edit form.
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

// SafeAreaView keeps content inside
// the safe area of the phone.
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditRoomScreen() {
  // Receive the MongoDB room ID from Room Details.
  const { id } = useLocalSearchParams<{ id: string }>();

  // Store the values displayed in the form.
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [pricePerMonth, setPricePerMonth] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  // loading is used while getting the existing room.
  const [loading, setLoading] = useState(true);

  // updating is used while sending the PUT request.
  const [updating, setUpdating] = useState(false);

  // Get the existing room information from the backend.
  const fetchRoom = async () => {
    try {
      setLoading(true);

      // Make sure a room ID was received.
      if (!id) {
        Alert.alert(
          'Error',
          'No room was selected.'
        );

        return;
      }

      // Read the JWT saved during login.
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please log in again.'
        );

        return;
      }

      // Get the selected room from the backend.
      const response = await fetch(
        `${API_URL}/rooms/${id}`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Convert the backend response into JavaScript data.
      const data = await response.json();

      if (response.ok) {
        // The actual room is inside data.room.
        const room = data.room;

        // Put the existing room information
        // into each form field.
        setRoomNumber(room.roomNumber);
        setRoomType(room.roomType);
        setPricePerMonth(
          String(room.pricePerMonth)
        );
        setCapacity(
          String(room.capacity)
        );
        setDescription(
          room.description || ''
        );
      } else {
        Alert.alert(
          'Error',
          data.message || 'Could not load the room.'
        );
      }
    } catch (error) {
      console.log('Load room error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the HostelHub server.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get the existing room when the screen opens.
  useEffect(() => {
    fetchRoom();
  }, [id]);

  // This function runs when UPDATE ROOM is pressed.
  const handleUpdateRoom = async () => {
    // Remove unnecessary spaces.
    const cleanRoomNumber = roomNumber.trim();
    const cleanRoomType = roomType.trim();
    const cleanDescription = description.trim();

    // Check required fields.
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

    // The Room model only accepts these room types.
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

    // Convert text input into numbers.
    const priceNumber = Number(pricePerMonth);
    const capacityNumber = Number(capacity);

    // Validate monthly price.
    if (
      Number.isNaN(priceNumber) ||
      priceNumber < 0
    ) {
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
      // Disable the button while updating.
      setUpdating(true);

      // Read the saved JWT.
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please log in again.'
        );

        return;
      }

      // Send the updated information to the backend.
      const response = await fetch(
        `${API_URL}/rooms/${id}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          // Send the edited room values.
          body: JSON.stringify({
            roomNumber: cleanRoomNumber,
            roomType: cleanRoomType,
            pricePerMonth: priceNumber,
            capacity: capacityNumber,
            description: cleanDescription,
          }),
        }
      );

      // Convert the backend response into JavaScript data.
      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Room Updated',
          'The room was updated successfully.',
          [
            {
              text: 'OK',

              // Return to the Rooms screen after success.
              onPress: () => router.replace('/rooms'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Unable to Update Room',
          data.message || 'Something went wrong.'
        );
      }
    } catch (error) {
      console.log('Update room error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the HostelHub server.'
      );
    } finally {
      // Enable the update button again.
      setUpdating(false);
    }
  };

  // Show a loading indicator while the existing
  // room information is being downloaded.
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading room...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Application name */}
        <Text style={styles.logo}>
          HostelHub
        </Text>

        {/* Screen heading */}
        <Text style={styles.title}>
          Edit Room
        </Text>

        {/* Room Number */}
        <Text style={styles.label}>
          Room Number *
        </Text>

        <TextInput
          style={styles.input}
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
          value={roomType}
          onChangeText={setRoomType}
          placeholder="Single, Double, or Triple"
          autoCapitalize="words"
        />

        {/* Monthly Price */}
        <Text style={styles.label}>
          Monthly Price (Rs.) *
        </Text>

        <TextInput
          style={styles.input}
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
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="numeric"
        />

        {/* Description */}
        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.descriptionInput,
          ]}
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Update button */}
        <Pressable
          style={[
            styles.updateButton,
            updating && styles.disabledButton,
          ]}
          onPress={handleUpdateRoom}
          disabled={updating}
        >
          <Text style={styles.updateButtonText}>
            {updating
              ? 'UPDATING ROOM...'
              : 'UPDATE ROOM'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// Visual styles for the Edit Room screen.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
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

  updateButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});