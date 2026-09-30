// Imports the address of our HostelHub backend API.
import { API_URL } from '../services/api';

// router lets us navigate after updating.
// useLocalSearchParams receives the selected room ID.
import {
  router,
  useLocalSearchParams,
} from 'expo-router';

// Expo fetch supports File objects inside FormData.
import { fetch } from 'expo/fetch';

// File represents the new image selected from the phone.
import { File } from 'expo-file-system';

// ImagePicker lets the user choose a new room image.
import * as ImagePicker from 'expo-image-picker';

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
  Image,
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

  // Store the existing image path from MongoDB.
  //
  // Example:
  // uploads/123456789-room.jpg
  const [existingImage, setExistingImage] = useState('');

  // Store a NEW image selected by the user.
  //
  // This remains null if the user does not
  // want to replace the existing image.
  const [newImage, setNewImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  // loading is used while getting the existing room.
  const [loading, setLoading] = useState(true);

  // updating is used while sending the PUT request.
  const [updating, setUpdating] = useState(false);

  // API_URL contains /api at the end.
  //
  // Example:
  // http://192.168.1.3:5000/api
  //
  // Uploaded images are available from:
  // http://192.168.1.3:5000/uploads/...
  //
  // Therefore we remove /api when displaying images.
  const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

  // ======================================================
  // GET EXISTING ROOM
  // ======================================================

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
      const token =
        await SecureStore.getItemAsync('userToken');

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

        // Save the existing image path.
        setExistingImage(
          room.image || ''
        );
      } else {
        Alert.alert(
          'Error',
          data.message ||
            'Could not load the room.'
        );
      }
    } catch (error) {
      console.log(
        'Load room error:',
        error
      );

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

  // ======================================================
  // CHOOSE A NEW IMAGE
  // ======================================================

  const pickNewImage = async () => {
    // Ask permission to access the phone's photos.
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photos to select a room image.'
      );

      return;
    }

    // Open the phone gallery.
    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

    // Store the newly selected image.
    if (
      !result.canceled &&
      result.assets.length > 0
    ) {
      setNewImage(result.assets[0]);
    }
  };

  // ======================================================
  // UPDATE ROOM
  // ======================================================

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
      const token =
        await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please log in again.'
        );

        return;
      }

      // Create FormData because the request may contain
      // both normal text fields and an image.
      const formData = new FormData();

      // Add the edited room information.
      formData.append(
        'roomNumber',
        cleanRoomNumber
      );

      formData.append(
        'roomType',
        cleanRoomType
      );

      formData.append(
        'pricePerMonth',
        String(priceNumber)
      );

      formData.append(
        'capacity',
        String(capacityNumber)
      );

      formData.append(
        'description',
        cleanDescription
      );

      // Only add an image to FormData if the user
      // selected a NEW image.
      //
      // If newImage is null, no image is sent.
      // The backend therefore keeps the old image.
      if (newImage) {
        // Create an Expo File from the local image URI.
        const imageFile = new File(
          newImage.uri
        );

        // "image" must match:
        // upload.single("image")
        // in roomRoutes.js.
        formData.append(
          'image',
          imageFile
        );
      }

      // Send the updated information to the backend.
      const response = await fetch(
        `${API_URL}/rooms/${id}`,
        {
          method: 'PUT',

          headers: {
            // This is a protected route.
            Authorization: `Bearer ${token}`,

            // Do NOT manually set Content-Type.
            // Expo creates the multipart/form-data
            // boundary automatically.
          },

          body: formData,
        }
      );

      // Read as text first so an HTML server error
      // does not cause a JSON parsing crash.
      const responseText =
        await response.text();

      let data: any = {};

      try {
        // Try to convert the response into JSON.
        data = JSON.parse(responseText);
      } catch {
        // Keep a readable message if the server
        // returned something other than JSON.
        data = {
          message:
            responseText ||
            'Unexpected server response.',
        };
      }

      if (response.ok) {
        Alert.alert(
          'Room Updated',
          newImage
            ? 'The room and image were updated successfully.'
            : 'The room was updated successfully.',
          [
            {
              text: 'OK',

              // Return to the Rooms screen after success.
              onPress: () =>
                router.replace('/rooms'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Unable to Update Room',
          data.message ||
            'Something went wrong.'
        );
      }
    } catch (error) {
      console.log(
        'Update room error:',
        error
      );

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
      <SafeAreaView
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading room...
        </Text>
      </SafeAreaView>
    );
  }

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

        {/* Room Image */}
        <Text style={styles.label}>
          Room Image
        </Text>

        {/*
          If a NEW image has been selected,
          show the new image preview.
        */}
        {newImage ? (
          <Image
            source={{
              uri: newImage.uri,
            }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : existingImage ? (
          /*
            Otherwise display the room's
            current image from the backend.
          */
          <Image
            source={{
              uri: `${SERVER_URL}/${existingImage}`,
            }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        ) : (
          // Older rooms may not have an image.
          <Text style={styles.noImageText}>
            No room image available.
          </Text>
        )}

        {/* Choose another image from the phone. */}
        <Pressable
          style={styles.imageButton}
          onPress={pickNewImage}
          disabled={updating}
        >
          <Text style={styles.imageButtonText}>
            {newImage
              ? 'CHOOSE ANOTHER IMAGE'
              : 'CHANGE ROOM IMAGE'}
          </Text>
        </Pressable>

        {/* Update button */}
        <Pressable
          style={[
            styles.updateButton,
            updating &&
              styles.disabledButton,
          ]}
          onPress={handleUpdateRoom}
          disabled={updating}
        >
          <Text
            style={styles.updateButtonText}
          >
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

  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
  },

  noImageText: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },

  imageButton: {
    backgroundColor: '#374151',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },

  imageButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
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