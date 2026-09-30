// Imports the address of our HostelHub backend API.
import { API_URL } from '../services/api';

// router lets us navigate to other screens.
import { router } from 'expo-router';

// SecureStore lets us read the JWT token
// that was saved securely after login.
import * as SecureStore from 'expo-secure-store';

// useEffect runs code when the screen opens.
// useState stores data that can change.
import { useEffect, useState } from 'react';

// React Native components used to build the Rooms screen.
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

// SafeAreaView keeps content inside the safe area of the phone.
import { SafeAreaView } from 'react-native-safe-area-context';

// This type describes one Room object
// returned by our backend.
type Room = {
  _id: string;
  roomNumber: string;
  roomType: string;
  pricePerMonth: number;
  capacity: number;
  currentOccupancy: number;
  description: string;
  image: string;
  availabilityStatus: string;
};

export default function RoomsScreen() {
  // Stores the array of rooms received from MongoDB.
  const [rooms, setRooms] = useState<Room[]>([]);

  // Controls whether the loading indicator is displayed.
  const [loading, setLoading] = useState(true);

  // This function gets all rooms from our backend.
  const fetchRooms = async () => {
    try {
      // Start the loading indicator.
      setLoading(true);

      // Read the JWT saved after successful login.
      const token = await SecureStore.getItemAsync('userToken');

      // If there is no token, the user is not authenticated.
      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please log in again.'
        );

        return;
      }

      // Send a GET request to the protected Room API.
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'GET',

        // Send the JWT in the Authorization header.
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Convert the JSON response into JavaScript data.
      const data = await response.json();

      if (response.ok) {
        // The backend returns the room array
        // inside the "rooms" property.
        setRooms(data.rooms);
      } else {
        Alert.alert(
          'Error',
          data.message || 'Could not load rooms.'
        );
      }
    } catch (error) {
      console.log('Room fetch error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the HostelHub server.'
      );
    } finally {
      // Stop displaying the loading indicator.
      setLoading(false);
    }
  };

  // Run fetchRooms once when the screen opens.
  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Application name */}
        <Text style={styles.logo}>
          HostelHub
        </Text>

        {/* Screen heading */}
        <Text style={styles.title}>
          Hostel Rooms
        </Text>

        {/* Opens the Add Room screen. */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/add-room')}
        >
          <Text style={styles.addButtonText}>
            ADD ROOM
          </Text>
        </Pressable>

        {/* Display loading indicator while fetching rooms. */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : rooms.length === 0 ? (
          // Display this if there are no rooms.
          <Text style={styles.emptyText}>
            No rooms are currently available.
          </Text>
        ) : (
          // Create one clickable card for every room.
          rooms.map((room) => (
            <Pressable
              key={room._id}
              style={styles.roomCard}

              // Send the selected room's MongoDB ID
              // to the Room Details screen.
              onPress={() =>
                router.push({
                  pathname: '/room-details',
                  params: {
                    id: room._id,
                  },
                })
              }
            >
              {/* Room number */}
              <Text style={styles.roomNumber}>
                Room {room.roomNumber}
              </Text>

              {/* Room type */}
              <Text style={styles.roomDetail}>
                Type: {room.roomType}
              </Text>

              {/* Monthly price */}
              <Text style={styles.roomDetail}>
                Price: Rs. {room.pricePerMonth} / month
              </Text>

              {/* Current occupancy compared with capacity */}
              <Text style={styles.roomDetail}>
                Occupancy: {room.currentOccupancy} / {room.capacity}
              </Text>

              {/* Room availability */}
              <Text style={styles.roomDetail}>
                Status: {room.availabilityStatus}
              </Text>

              {/* Only display description when one exists. */}
              {room.description ? (
                <Text style={styles.description}>
                  {room.description}
                </Text>
              ) : null}

              {/* Shows the user that the card can be opened. */}
              <Text style={styles.viewDetails}>
                Tap to view details
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Visual styles for the Rooms screen.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    padding: 24,
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
    marginBottom: 18,
  },

  addButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 30,
  },

  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  roomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },

  roomDetail: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },

  viewDetails: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 14,
  },
});