// useEffect runs code when the screen opens.
// useState stores data that can change.
import { useEffect, useState } from 'react';

// useLocalSearchParams lets us receive the booking ID
// that was passed from the Bookings screen.
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

// SecureStore lets us read the saved JWT token.
import * as SecureStore from 'expo-secure-store';

// React Native components used to build the screen.
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// SafeAreaView keeps content inside the safe area.
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our backend API URL.
import { API_URL } from '../services/api';


// Define the User information returned by populate().
type BookingUser = {
  _id: string;
  name: string;
  email: string;
};

// Define the Room information returned by populate().
type BookingRoom = {
  _id: string;
  roomNumber: string;
  roomType: string;
  pricePerMonth: number;
  availabilityStatus: string;
};

// Define the structure of one Booking.
type Booking = {
  _id: string;
  userId: BookingUser;
  roomId: BookingRoom;
  bookingDate: string;
  startDate: string;
  endDate: string;
  status: string;
};


// Convert MongoDB dates into an easier-to-read format.
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};


export default function BookingDetailsScreen() {
  // Receive the booking ID passed from bookings.tsx.
  const { id } = useLocalSearchParams<{ id: string }>();

  // Store the selected booking.
  const [booking, setBooking] = useState<Booking | null>(null);

  // Loading is shown while retrieving the booking.
  const [loading, setLoading] = useState(true);

  // Deleting prevents the Delete button from being
  // pressed repeatedly while deletion is happening.
  const [deleting, setDeleting] = useState(false);


  // ======================================================
  // GET ONE BOOKING
  // ======================================================

  const fetchBooking = async () => {
    try {
      setLoading(true);

      // Read the JWT token saved during login.
      const token = await SecureStore.getItemAsync('userToken');

      // Request the selected booking using its MongoDB ID.
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

      // Show an error if the backend request failed.
      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Unable to load booking'
        );
        return;
      }

      // Backend returns:
      // {
      //   message: "...",
      //   booking: {...}
      // }
      setBooking(data.booking);
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server'
      );
    } finally {
      setLoading(false);
    }
  };


  // Get the booking when the screen opens.
  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);


  // ======================================================
  // DELETE BOOKING
  // ======================================================

  const deleteBooking = async () => {
    try {
      setDeleting(true);

      // Read the saved JWT token.
      const token = await SecureStore.getItemAsync('userToken');

      // Send DELETE request to the backend.
      const response = await fetch(
        `${API_URL}/bookings/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Convert the backend response into JavaScript data.
      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          'Delete Failed',
          data.message || 'Unable to delete booking'
        );
        return;
      }

      // Tell the user deletion was successful.
      Alert.alert(
        'Success',
        'Booking deleted successfully',
        [
          {
            text: 'OK',
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
      setDeleting(false);
    }
  };


  // Ask for confirmation before deleting.
  const confirmDelete = () => {
    Alert.alert(
      'Delete Booking',
      'Are you sure you want to delete this booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: deleteBooking,
        },
      ]
    );
  };


  // Show loading indicator while fetching data.
  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }


  // Show this if the booking could not be found.
  if (!booking) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>
          Booking not found.
        </Text>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Screen heading */}
        <Text style={styles.title}>
          Booking Details
        </Text>

        {/* Main booking information card */}
        <View style={styles.card}>
          <Text style={styles.roomNumber}>
            Room {booking.roomId.roomNumber}
          </Text>

          <Text style={styles.detailText}>
            Room Type: {booking.roomId.roomType}
          </Text>

          <Text style={styles.detailText}>
            Price: Rs. {booking.roomId.pricePerMonth}/month
          </Text>

          <Text style={styles.detailText}>
            Start Date: {formatDate(booking.startDate)}
          </Text>

          <Text style={styles.detailText}>
            End Date: {formatDate(booking.endDate)}
          </Text>

          <Text style={styles.detailText}>
            Status: {booking.status}
          </Text>

          <Text style={styles.detailText}>
            Booked By: {booking.userId.name}
          </Text>

          <Text style={styles.detailText}>
            Email: {booking.userId.email}
          </Text>
        </View>

        {/* Later this button will open the Edit Booking screen. */}
        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: '/edit-booking',
              params: {
                id: booking._id,
              },
            })
          }
        >
          <Text style={styles.buttonText}>
            EDIT BOOKING
          </Text>
        </Pressable>

        {/* Delete Booking button */}
        <Pressable
          style={[
            styles.deleteButton,
            deleting && styles.disabledButton,
          ]}
          onPress={confirmDelete}
          disabled={deleting}
        >
          <Text style={styles.buttonText}>
            {deleting
              ? 'DELETING...'
              : 'DELETE BOOKING'}
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
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },

  roomNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },

  detailText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },

  editButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },

  deleteButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  errorText: {
    fontSize: 17,
    color: '#6B7280',
  },
});