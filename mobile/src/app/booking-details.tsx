// useEffect runs code when the screen opens.
// useState stores data that can change.
import { useEffect, useState } from 'react';

// router lets us navigate between screens.
// useLocalSearchParams receives the booking ID.
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

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
  View,
} from 'react-native';

// SafeAreaView keeps content inside the safe area.
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our backend API URL.
import { API_URL } from '../services/api';


// ======================================================
// TYPES
// ======================================================

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
  capacity: number;
  currentOccupancy: number;
  availabilityStatus: string;
};

// Define the structure of one Booking.
type Booking = {
  _id: string;

  // Normally userId contains the populated User.
  userId: BookingUser;

  // IMPORTANT:
  // If the Room was deleted after the Booking was created,
  // Mongoose populate() returns null for roomId.
  //
  // Therefore roomId must be allowed to contain either
  // the populated Room object or null.
  roomId: BookingRoom | null;

  bookingDate: string;
  startDate: string;
  endDate: string;
  status: string;
};


// ======================================================
// DATE FORMATTER
// ======================================================

// Convert MongoDB dates into an easier-to-read format.
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};


// ======================================================
// BOOKING DETAILS SCREEN
// ======================================================

export default function BookingDetailsScreen() {
  // Receive the booking ID passed from bookings.tsx.
  const { id } = useLocalSearchParams<{ id: string }>();

  // Store the selected booking.
  const [booking, setBooking] = useState<Booking | null>(null);

  // Loading is shown while retrieving the booking.
  const [loading, setLoading] = useState(true);

  // Deleting prevents repeated Delete requests.
  const [deleting, setDeleting] = useState(false);

  // UpdatingStatus prevents repeated Approve/Reject requests.
  const [updatingStatus, setUpdatingStatus] = useState(false);


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

      // Store the booking returned by the backend.
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
  // APPROVE OR REJECT BOOKING
  // ======================================================

  const updateBookingStatus = async (
    newStatus: 'Approved' | 'Rejected'
  ) => {
    try {
      // A booking whose Room was deleted should not
      // be approved or rejected because the related
      // Room no longer exists.
      if (!booking?.roomId) {
        Alert.alert(
          'Room Not Available',
          'This booking belongs to a room that has been deleted.'
        );
        return;
      }

      // Disable the status buttons while the request runs.
      setUpdatingStatus(true);

      // Read the JWT saved during login.
      const token = await SecureStore.getItemAsync('userToken');

      // Send the new status to our backend.
      //
      // Example:
      // PATCH /api/bookings/BOOKING_ID/status
      //
      // Body:
      // {
      //   "status": "Approved"
      // }
      const response = await fetch(
        `${API_URL}/bookings/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      // Convert the backend response into JavaScript data.
      const data = await response.json();

      // Show the backend error if the request failed.
      if (!response.ok) {
        Alert.alert(
          'Status Update Failed',
          data.message || 'Unable to update booking status'
        );
        return;
      }

      // Tell the user whether approval or rejection succeeded.
      Alert.alert(
        'Success',
        newStatus === 'Approved'
          ? 'Booking approved successfully'
          : 'Booking rejected successfully'
      );

      // Reload the booking from the backend.
      //
      // This makes the displayed Status change from
      // Pending to Approved or Rejected.
      await fetchBooking();

    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };


  // ======================================================
  // CONFIRM APPROVAL
  // ======================================================

  const confirmApprove = () => {
    Alert.alert(
      'Approve Booking',
      'Are you sure you want to approve this booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          onPress: () =>
            updateBookingStatus('Approved'),
        },
      ]
    );
  };


  // ======================================================
  // CONFIRM REJECTION
  // ======================================================

  const confirmReject = () => {
    Alert.alert(
      'Reject Booking',
      'Are you sure you want to reject this booking?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () =>
            updateBookingStatus('Rejected'),
        },
      ]
    );
  };


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

      // If this was an Approved booking and the Room
      // still exists, the backend releases its occupancy.
      //
      // If the Room was already deleted, the backend
      // should simply remove the orphaned Booking.
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


  // ======================================================
  // LOADING SCREEN
  // ======================================================

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


  // ======================================================
  // SCREEN UI
  // ======================================================

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Screen heading */}
        <Text style={styles.title}>
          Booking Details
        </Text>


        {/* Main booking information card */}
        <View style={styles.card}>

          {/*
            If the related Room still exists,
            display all Room information normally.
          */}
          {booking.roomId ? (
            <>
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
                Occupancy: {booking.roomId.currentOccupancy}
                /{booking.roomId.capacity}
              </Text>

              <Text style={styles.detailText}>
                Room Availability:{' '}
                {booking.roomId.availabilityStatus}
              </Text>
            </>
          ) : (
            /*
              If the Room has been deleted, populate()
              returns null.

              Instead of crashing the app, show a clear
              message to the user.
            */
            <>
              <Text style={styles.roomNumber}>
                Room no longer available
              </Text>

              <Text style={styles.deletedRoomText}>
                The room connected to this booking has been deleted.
              </Text>
            </>
          )}


          {/* Booking information can still be displayed
              even when the related Room was deleted. */}
          <Text style={styles.detailText}>
            Start Date: {formatDate(booking.startDate)}
          </Text>

          <Text style={styles.detailText}>
            End Date: {formatDate(booking.endDate)}
          </Text>

          <Text style={styles.detailText}>
            Status: {booking.status}
          </Text>


          {/* User information */}
          <Text style={styles.detailText}>
            Booked By: {booking.userId.name}
          </Text>

          <Text style={styles.detailText}>
            Email: {booking.userId.email}
          </Text>

        </View>


        {/* =================================================
            APPROVE / REJECT

            These buttons only appear while:
            1. The booking is Pending
            2. The related Room still exists

            A booking cannot be approved if its Room
            has already been deleted.
        ================================================= */}
        {booking.status === 'Pending' && booking.roomId && (
          <View style={styles.statusButtons}>

            <Pressable
              style={[
                styles.approveButton,
                updatingStatus && styles.disabledButton,
              ]}
              onPress={confirmApprove}
              disabled={updatingStatus}
            >
              <Text style={styles.buttonText}>
                {updatingStatus
                  ? 'UPDATING...'
                  : 'APPROVE'}
              </Text>
            </Pressable>


            <Pressable
              style={[
                styles.rejectButton,
                updatingStatus && styles.disabledButton,
              ]}
              onPress={confirmReject}
              disabled={updatingStatus}
            >
              <Text style={styles.buttonText}>
                REJECT
              </Text>
            </Pressable>

          </View>
        )}


        {/* 
          Edit Booking button.

          Only show Edit when the related Room still exists.
          There is no useful reason to edit dates for a
          booking whose Room has already been deleted.
        */}
        {booking.roomId && (
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
        )}


        {/*
          Delete Booking remains available even when the
          Room has been deleted.

          This allows the user to clean up an old booking
          that references a Room that no longer exists.
        */}
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

  // Used when the related Room has been deleted.
  deletedRoomText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 16,
  },

  statusButtons: {
    marginBottom: 12,
  },

  approveButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },

  rejectButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
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