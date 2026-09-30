// Imports the address of our HostelHub backend API.
import { API_URL } from '../services/api';

// router lets us navigate back to the Rooms screen.
import { router } from 'expo-router';

// Expo fetch supports File objects inside FormData.
import { fetch } from 'expo/fetch';

// File lets us represent the image selected from the phone.
import { File } from 'expo-file-system';

// ImagePicker lets the user choose a room image from the phone gallery.
import * as ImagePicker from 'expo-image-picker';

// SecureStore lets us read the JWT token
// that was saved after login.
import * as SecureStore from 'expo-secure-store';

// useState stores values used by this screen.
import { useState } from 'react';

// React Native components used to build the form.
import {
  Alert,
  Image,
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

  // Store the complete image information returned
  // by Expo Image Picker.
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  // Prevents the button from being pressed repeatedly
  // while the room is being created.
  const [loading, setLoading] = useState(false);

  // This function runs when the user presses
  // CHOOSE ROOM IMAGE.
  const pickImage = async () => {
    // Ask permission to access the phone's photos.
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    // Stop if permission was not granted.
    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photos to select a room image.'
      );

      return;
    }

    // Open the phone's image library.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    // Save the complete selected image asset.
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImage(result.assets[0]);
    }
  };

  // This function runs when the user presses ADD ROOM.
  const handleAddRoom = async () => {
    // Remove unnecessary spaces.
    const cleanRoomNumber = roomNumber.trim();
    const cleanRoomType = roomType.trim();
    const cleanDescription = description.trim();

    // Check required text fields.
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

    // The backend Room model accepts only
    // Single, Double, or Triple.
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

    // Convert number fields from text into numbers.
    const priceNumber = Number(pricePerMonth);
    const capacityNumber = Number(capacity);

    // Validate monthly price.
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

    // Require an image for every new room.
    if (!selectedImage) {
      Alert.alert(
        'Image Required',
        'Please choose an image for the room.'
      );

      return;
    }

    try {
      // Disable the button while the request is running.
      setLoading(true);

      // Read the JWT token saved when the user logged in.
      const token =
        await SecureStore.getItemAsync('userToken');

      // A protected route needs a valid JWT.
      if (!token) {
        Alert.alert(
          'Authentication Error',
          'Please log in again.'
        );

        return;
      }

      // Create FormData because we are sending
      // normal text fields together with an image.
      const formData = new FormData();

      // Add the normal Room fields.
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

      // Create an Expo File directly from the URI
      // returned by ImagePicker.
      //
      // This is different from JavaScript's:
      // new File([blob], filename, options)
      //
      // expo-file-system understands the local
      // file URI on Android/iOS.
      const imageFile = new File(
        selectedImage.uri
      );

      // Add the image to FormData.
      //
      // The field name "image" must match:
      // upload.single("image")
      // in our Express backend.
      formData.append(
        'image',
        imageFile
      );

      // Send the multipart request to the backend.
      const response = await fetch(
        `${API_URL}/rooms`,
        {
          method: 'POST',

          headers: {
            // The backend's protect middleware
            // checks this JWT.
            Authorization: `Bearer ${token}`,

            // IMPORTANT:
            // Do not manually add Content-Type.
            // Expo fetch creates the multipart
            // boundary automatically.
          },

          body: formData,
        }
      );

      // Read the server response as text first.
      // This prevents the app from crashing if
      // Express/Multer sends a non-JSON error.
      const responseText =
        await response.text();

      // Try to convert the response to JSON.
      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        // If it was not JSON, keep the raw
        // server response as the error message.
        data = {
          message:
            responseText ||
            'Unexpected server response.',
        };
      }

      // Check whether the backend created the room.
      if (response.ok) {
        Alert.alert(
          'Room Created',
          'The new room and image were added successfully.',
          [
            {
              text: 'OK',

              // Return to the Rooms screen.
              onPress: () =>
                router.replace('/rooms'),
            },
          ]
        );
      } else {
        // Display an error returned by the backend.
        Alert.alert(
          'Unable to Create Room',
          data.message ||
            'Something went wrong.'
        );
      }
    } catch (error) {
      // Print the actual error in the Expo terminal.
      console.log(
        'Add room error:',
        error
      );

      Alert.alert(
        'Connection Error',
        'Could not connect to the HostelHub server.'
      );
    } finally {
      // Re-enable the button.
      setLoading(false);
    }
  };

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
          style={[
            styles.input,
            styles.descriptionInput,
          ]}
          placeholder="Enter room description"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />

        {/* Room Image */}
        <Text style={styles.label}>
          Room Image *
        </Text>

        {/* Preview the selected image. */}
        {selectedImage && (
          <Image
            source={{
              uri: selectedImage.uri,
            }}
            style={styles.imagePreview}
          />
        )}

        {/* Open the phone gallery. */}
        <Pressable
          style={styles.imageButton}
          onPress={pickImage}
          disabled={loading}
        >
          <Text
            style={styles.imageButtonText}
          >
            {selectedImage
              ? 'CHANGE ROOM IMAGE'
              : 'CHOOSE ROOM IMAGE'}
          </Text>
        </Pressable>

        {/* Submit button */}
        <Pressable
          style={[
            styles.addButton,
            loading &&
              styles.disabledButton,
          ]}
          onPress={handleAddRoom}
          disabled={loading}
        >
          <Text
            style={styles.addButtonText}
          >
            {loading
              ? 'ADDING ROOM...'
              : 'ADD ROOM'}
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

  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 10,
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