// router lets us navigate to other screens in the application.
import { router } from 'expo-router';

// React Native components used to build the Home screen.
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// SafeAreaView keeps content inside the safe area of the phone.
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Application name */}
        <Text style={styles.logo}>HostelHub</Text>

        {/* Home screen heading */}
        <Text style={styles.title}>Home</Text>

        <Text style={styles.message}>
          Welcome to your hostel management system.
        </Text>

        {/* This button navigates to the Rooms screen. */}
        <Pressable
          style={styles.roomsButton}
          onPress={() => router.push('/rooms')}
        >
          <Text style={styles.roomsButtonText}>
            VIEW ROOMS
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Visual styles for the Home screen.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2563EB',
    textAlign: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },

  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },

  roomsButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  roomsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});