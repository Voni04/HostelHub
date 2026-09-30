// useEffect runs code when the screen opens.
// useState stores values that can change.
import { useEffect, useState } from 'react';

// router is used for navigation.
// useLocalSearchParams receives the booking ID.
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

// SecureStore lets us read the JWT saved during login.
import * as SecureStore from 'expo-secure-store';

// React Native components used to build the form.
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

// SafeAreaView keeps content inside the safe area.
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our backend API URL.
import { API_URL } from '../services/api';


export default function EditBookingScreen() {
  // Receive the booking ID passed from Booking Details.
  const { id } = useLocalSearchParams<{ id: string }>();

  // Store the editable booking dates.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Loading is used while getting the existing booking.
  const [loading, setLoading] = useState(true);

  // Updating prevents multiple update requests.
  const [updating, setUpdating] = useState(false);


  // ======================================================
  // GET EXISTING BOOKING
  // ======================================================

  const fetchBooking = async () => {
    try {
      setLoading(true);

      // Read the JWT token saved during login.
      const token = await SecureStore.getItemAsync('userToken');

      // Get the selected booking from the backend.
      const response = await fetch(
        `${API_URL}/bookings/${id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Convert the response into JavaScript data.
      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Unable to load booking'
        );
        return;
      }

      // MongoDB dates include time information.
      // Example:
      // 2026-10-10T00:00:00.000Z
      //
      // split('T')[0] keeps only:
      // 2026-10-10
      setStartDate(
        data.booking.startDate.split('T')[0]
      );

      setEndDate(
        data.booking.endDate.split('T')[0]
      );
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server'
      );
    } finally {
      setLoading(false);
    }
  };


  // Load the existing booking when the screen opens.
  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);


  // ======================================================
  // UPDATE BOOKING
  // ======================================================

  const handleUpdateBooking = async () => {
    // Make sure both dates are entered.
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert(
        'Validation Error',
        'Please enter start date and end date'
      );
      return;
    }

    // Convert the entered values into Date objects.
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check that both dates are valid.
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      Alert.alert(
        'Validation Error',
        'Please enter dates in YYYY-MM-DD format'
      );
      return;
    }

    // End date must be later than start date.
    if (end <= start) {
      Alert.alert(
        'Validation Error',
        'End date must be later than start date'
      );
      return;
    }

    try {
      setUpdating(true);

      // Read the saved JWT token.
      const token = await SecureStore.getItemAsync('userToken');

      // Send the updated dates to the backend.
      const response = await fetch(
        `${API_URL}/bookings/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startDate: startDate,
            endDate: endDate,
          }),
        }
      );

      // Convert the response into JavaScript data.
      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Update Failed',
          data.message || 'Unable to update booking'
        );
        return;
      }

      // Tell the user that the update succeeded.
      Alert.alert(
        'Success',
        'Booking updated successfully',
        [
          {
            text: 'OK',

            // Return to the Bookings list.
            onPress: () => router.replace('/bookings'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server'
      );
    } finally {
      setUpdating(false);
    }
  };


  // Show loading indicator while retrieving the booking.
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Screen heading */}
        <Text style={styles.title}>
          Edit Booking
        </Text>

        {/* Start Date */}
        <Text style={styles.label}>
          Start Date
        </Text>

        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />

        {/* End Date */}
        <Text style={styles.label}>
          End Date
        </Text>

        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
        />

        {/* Update button */}
        <Pressable
          style={[
            styles.updateButton,
            updating && styles.disabledButton,
          ]}
          onPress={handleUpdateBooking}
          disabled={updating}
        >
          <Text style={styles.updateButtonText}>
            {updating
              ? 'UPDATING...'
              : 'UPDATE BOOKING'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}


// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 18,
  },

  updateButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
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