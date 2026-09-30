// useEffect runs code when the screen opens.
// useState stores values that can change on the screen.
import { useEffect, useState } from 'react';

// router lets us navigate between screens.
import { router } from 'expo-router';

// SecureStore lets us read the JWT token saved during login.
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
  View,
} from 'react-native';

// SafeAreaView keeps content inside the safe area of the phone.
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our backend API URL.
import { API_URL } from '../services/api';


// Define the structure of a Room returned by the backend.
type Room = {
  _id: string;
  roomNumber: string;
  roomType: string;
  pricePerMonth: number;
  capacity: number;
  currentOccupancy: number;
  availabilityStatus: string;
};


export default function AddBookingScreen() {
  // Store the rooms returned by the backend.
  const [rooms, setRooms] = useState<Room[]>([]);

  // Store the ID of the room selected by the user.
  const [selectedRoomId, setSelectedRoomId] = useState('');

  // Store the dates entered by the user.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Loading is used while retrieving rooms.
  const [loading, setLoading] = useState(true);

  // Submitting prevents multiple booking requests
  // while one request is already being processed.
  const [submitting, setSubmitting] = useState(false);


  // ======================================================
  // GET ROOMS
  // ======================================================

  const fetchRooms = async () => {
    try {
      setLoading(true);

      // Read the JWT token saved during login.
      const token = await SecureStore.getItemAsync('userToken');

      // Request all rooms from the backend.
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Convert the response into JavaScript data.
      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Unable to load rooms'
        );
        return;
      }

      // Keep only rooms that are currently available.
      const availableRooms = data.rooms.filter(
        (room: Room) =>
          room.availabilityStatus === 'Available'
      );

      setRooms(availableRooms);
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server'
      );
    } finally {
      setLoading(false);
    }
  };


  // Load rooms when the screen first opens.
  useEffect(() => {
    fetchRooms();
  }, []);


  // ======================================================
  // CREATE BOOKING
  // ======================================================

  const handleCreateBooking = async () => {
    // Make sure the user selected a room.
    if (!selectedRoomId) {
      Alert.alert(
        'Validation Error',
        'Please select a room'
      );
      return;
    }

    // Make sure both dates were entered.
    if (!startDate.trim() || !endDate.trim()) {
      Alert.alert(
        'Validation Error',
        'Please enter start date and end date'
      );
      return;
    }

    // Convert the entered text into Date objects.
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check whether the dates are valid.
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
      setSubmitting(true);

      // Read the JWT token saved during login.
      const token = await SecureStore.getItemAsync('userToken');

      // Send the new booking to the backend.
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        // The backend automatically gets userId
        // from the JWT token.
        body: JSON.stringify({
          roomId: selectedRoomId,
          startDate: startDate,
          endDate: endDate,
        }),
      });

      // Convert the backend response into JavaScript data.
      const data = await response.json();

      // Show the backend error if creation failed.
      if (!response.ok) {
        Alert.alert(
          'Booking Failed',
          data.message || 'Unable to create booking'
        );
        return;
      }

      // Tell the user that the booking was created.
      Alert.alert(
        'Success',
        'Booking created successfully',
        [
          {
            text: 'OK',

            // Return to the Bookings screen.
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
      setSubmitting(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Screen heading */}
        <Text style={styles.title}>Add Booking</Text>

        <Text style={styles.label}>
          Select Room
        </Text>

        {/* Show loading indicator while rooms are loading. */}
        {loading ? (
          <ActivityIndicator
            size="large"
            style={styles.loader}
          />
        ) : rooms.length === 0 ? (
          // Show this if there are no available rooms.
          <Text style={styles.emptyText}>
            No available rooms found.
          </Text>
        ) : (
          // Display each available room as a selectable button.
          rooms.map((room) => (
            <Pressable
              key={room._id}
              style={[
                styles.roomOption,

                // Change the appearance of the selected room.
                selectedRoomId === room._id &&
                  styles.selectedRoomOption,
              ]}
              onPress={() => setSelectedRoomId(room._id)}
            >
              <Text
                style={[
                  styles.roomNumber,
                  selectedRoomId === room._id &&
                    styles.selectedRoomText,
                ]}
              >
                Room {room.roomNumber}
              </Text>

              <Text
                style={[
                  styles.roomDetails,
                  selectedRoomId === room._id &&
                    styles.selectedRoomText,
                ]}
              >
                {room.roomType} - Rs. {room.pricePerMonth}/month
              </Text>

              <Text
                style={[
                  styles.roomDetails,
                  selectedRoomId === room._id &&
                    styles.selectedRoomText,
                ]}
              >
                Occupancy: {room.currentOccupancy}/{room.capacity}
              </Text>
            </Pressable>
          ))
        )}

        {/* Start date input */}
        <Text style={styles.label}>
          Start Date
        </Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
        />

        {/* End date input */}
        <Text style={styles.label}>
          End Date
        </Text>

        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={setEndDate}
        />

        {/* Create Booking button */}
        <Pressable
          style={[
            styles.createButton,
            submitting && styles.disabledButton,
          ]}
          onPress={handleCreateBooking}
          disabled={submitting}
        >
          <Text style={styles.createButtonText}>
            {submitting
              ? 'CREATING...'
              : 'CREATE BOOKING'}
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
    marginTop: 10,
  },

  loader: {
    marginVertical: 20,
  },

  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 15,
  },

  roomOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  selectedRoomOption: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  roomNumber: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },

  roomDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },

  selectedRoomText: {
    color: '#FFFFFF',
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 12,
  },

  createButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});