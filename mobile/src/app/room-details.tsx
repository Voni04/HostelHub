// Imports the address of our HostelHub backend API.
import { API_URL } from '../services/api';

// router lets us navigate between screens.
// useLocalSearchParams receives the selected room ID.
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

// SecureStore lets us read the JWT token
// that was saved after login.
import * as SecureStore from 'expo-secure-store';

// useEffect runs code when the screen opens.
// useState stores data that can change.
import { useEffect, useState } from 'react';

// React Native components used to build the screen.
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// SafeAreaView keeps content inside
// the safe area of the phone.
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

export default function RoomDetailsScreen() {
  // Receive the MongoDB room ID from the Rooms screen.
  const { id } = useLocalSearchParams<{ id: string }>();

  // Stores the selected room.
  const [room, setRoom] = useState<Room | null>(null);

  // Controls the loading indicator.
  const [loading, setLoading] = useState(true);

  // Prevents repeated delete requests.
  const [deleting, setDeleting] = useState(false);

  // Get one specific room from the backend.
  const fetchRoomDetails = async () => {
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
      const token =
        await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please log in again.'
        );

        return;
      }

      // Request the selected room using its MongoDB ID.
      const response = await fetch(
        `${API_URL}/rooms/${id}`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Convert the JSON response into JavaScript data.
      const data = await response.json();

      if (response.ok) {
        // The actual room is inside data.room.
        setRoom(data.room);
      } else {
        Alert.alert(
          'Error',
          data.message ||
            'Could not load room details.'
        );
      }
    } catch (error) {
      console.log('Room details error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the HostelHub server.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch the selected room when the screen opens.
  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  // Actually delete the room from MongoDB.
  const deleteRoom = async () => {
    try {
      setDeleting(true);

      // Read the JWT saved during login.
      const token =
        await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please log in again.'
        );

        return;
      }

      // Send a DELETE request using the room ID.
      const response = await fetch(
        `${API_URL}/rooms/${id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Convert the backend response into JavaScript data.
      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Room Deleted',
          'The room was deleted successfully.',
          [
            {
              text: 'OK',

              // Return to the Rooms screen after deletion.
              onPress: () =>
                router.replace('/rooms'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Unable to Delete Room',
          data.message ||
            'Something went wrong.'
        );
      }
    } catch (error) {
      console.log('Delete room error:', error);

      Alert.alert(
        'Connection Error',
        'Could not connect to the HostelHub server.'
      );
    } finally {
      setDeleting(false);
    }
  };

  // Ask the user for confirmation before deleting.
  const handleDeleteRoom = () => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete Room ${room?.roomNumber}?`,
      [
        {
          // Close the confirmation box without deleting.
          text: 'Cancel',
          style: 'cancel',
        },
        {
          // Delete the room only when the user confirms.
          text: 'Delete',
          style: 'destructive',
          onPress: deleteRoom,
        },
      ]
    );
  };

  // Build the base address of the backend.
  // Therefore we remove "/api" from API_URL.
  const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        {/* Application name */}
        <Text style={styles.logo}>
          HostelHub
        </Text>

        {/* Screen heading */}
        <Text style={styles.title}>
          Room Details
        </Text>

        {loading ? (
          // Show while waiting for the backend.
          <ActivityIndicator size="large" />
        ) : room ? (
          <View style={styles.roomCard}>
            {/* Display the uploaded room image. */}
            {room.image ? (
              <Image
                source={{
  // New Cloudinary images already contain a complete HTTPS URL.
  // Old images contain only "uploads/...", so they still need
  // the backend server address added in front.
                    uri: room.image.startsWith('http')
                      ? room.image
                      : `${SERVER_URL}/${room.image}`,
                    }}
                style={styles.roomImage}
                resizeMode="cover"
              />
            ) : (
              // Older rooms may not have an image.
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>
                  No room image available
                </Text>
              </View>
            )}

            {/* Room number */}
            <Text style={styles.roomNumber}>
              Room {room.roomNumber}
            </Text>

            <Text style={styles.label}>
              Room Type
            </Text>

            <Text style={styles.value}>
              {room.roomType}
            </Text>

            <Text style={styles.label}>
              Monthly Price
            </Text>

            <Text style={styles.value}>
              Rs. {room.pricePerMonth}
            </Text>

            <Text style={styles.label}>
              Capacity
            </Text>

            <Text style={styles.value}>
              {room.capacity}
            </Text>

            <Text style={styles.label}>
              Current Occupancy
            </Text>

            <Text style={styles.value}>
              {room.currentOccupancy}
            </Text>

            <Text style={styles.label}>
              Availability Status
            </Text>

            <Text style={styles.value}>
              {room.availabilityStatus}
            </Text>

            <Text style={styles.label}>
              Description
            </Text>

            <Text style={styles.value}>
              {room.description ||
                'No description available.'}
            </Text>

            {/* Open Edit Room and send the room ID. */}
            <Pressable
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: '/edit-room',
                  params: {
                    id: room._id,
                  },
                })
              }
            >
              <Text style={styles.editButtonText}>
                EDIT ROOM
              </Text>
            </Pressable>

            {/* Ask for confirmation before deleting. */}
            <Pressable
              style={[
                styles.deleteButton,
                deleting &&
                  styles.disabledButton,
              ]}
              onPress={handleDeleteRoom}
              disabled={deleting}
            >
              <Text
                style={styles.deleteButtonText}
              >
                {deleting
                  ? 'DELETING...'
                  : 'DELETE ROOM'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.errorText}>
            Room details could not be loaded.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Visual styles for the Room Details screen.
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

  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Style for an uploaded room image.
  roomImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
  },

  // Placeholder area for old rooms
  // that do not have an image.
  noImageContainer: {
    height: 150,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  noImageText: {
    fontSize: 15,
    color: '#6B7280',
  },

  roomNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },

  value: {
    fontSize: 17,
    color: '#1F2937',
  },

  editButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 28,
  },

  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  disabledButton: {
    opacity: 0.6,
  },

  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 30,
  },
});