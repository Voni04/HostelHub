// useEffect runs code when the screen opens.
// useState stores data that can change on the screen.
import { useEffect, useState } from 'react';

// router lets us navigate between screens.
import { router } from 'expo-router';

// SecureStore lets us securely read the saved JWT token.
import * as SecureStore from 'expo-secure-store';

// React Native components used to build the screen.
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

// Import the base URL of our backend API.
import { API_URL } from '../services/api';


// Define the structure of User information
// returned by populate() from the backend.
type BookingUser = {
  _id: string;
  name: string;
  email: string;
};

// Define the structure of Room information
// returned by populate() from the backend.
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


// This function converts a MongoDB date into
// an easier-to-read date for the mobile screen.
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};


export default function BookingsScreen() {
  // Store all bookings returned by the backend.
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Controls whether the loading indicator is visible.
  const [loading, setLoading] = useState(true);


  // ======================================================
  // GET ALL BOOKINGS
  // ======================================================

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Read the JWT saved during login.
      const token = await SecureStore.getItemAsync('userToken');

      // Send a protected GET request to the Booking API.
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Convert the response into JavaScript data.
      const data = await response.json();

      // If the request failed, show the backend message.
      if (!response.ok) {
        Alert.alert(
          'Error',
          data.message || 'Unable to load bookings'
        );
        return;
      }

      // Our backend returns:
      // {
      //   message: "...",
      //   count: ...,
      //   bookings: [...]
      // }
      //
      // Therefore, the actual array is data.bookings.
      setBookings(data.bookings);
    } catch (error) {
      // This usually means the mobile app could not
      // communicate with the backend.
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server'
      );
    } finally {
      // Stop showing the loading indicator.
      setLoading(false);
    }
  };


  // Run fetchBookings when this screen first opens.
  useEffect(() => {
    fetchBookings();
  }, []);


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Screen heading */}
        <Text style={styles.title}>Bookings</Text>

        {/* Open the Create Booking screen. */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/add-booking')}
        >
          <Text style={styles.addButtonText}>
            ADD BOOKING
          </Text>
        </Pressable>

        {/* Show a loading indicator while fetching data. */}
        {loading ? (
          <ActivityIndicator
            size="large"
            style={styles.loader}
          />
        ) : bookings.length === 0 ? (
          // Show this message if there are no bookings.
          <Text style={styles.emptyText}>
            No bookings found.
          </Text>
        ) : (
          // Display every booking returned by the backend.
          bookings.map((booking) => (
            <Pressable
              key={booking._id}
              style={styles.bookingCard}

              // When the user taps a booking,
              // navigate to Booking Details.
              //
              // We pass the MongoDB booking _id
              // to the next screen as a route parameter.
              onPress={() =>
                router.push({
                  pathname: '/booking-details',
                  params: {
                    id: booking._id,
                  },
                })
              }
            >
              <Text style={styles.roomNumber}>
                Room {booking.roomId.roomNumber}
              </Text>

              <Text style={styles.detailText}>
                Room Type: {booking.roomId.roomType}
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

              {/* Tell the user that the card can be opened. */}
              <Text style={styles.tapText}>
                Tap to view details
              </Text>
            </Pressable>
          ))
        )}
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
    marginBottom: 20,
  },

  addButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  loader: {
    marginTop: 40,
  },

  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },

  bookingCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
  },

  roomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },

  detailText: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 5,
  },

  tapText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: 'bold',
    marginTop: 10,
  },
});