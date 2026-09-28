// React Native components used to build the Home screen.
import { StyleSheet, Text, View } from 'react-native';

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

        {/* Temporary message */}
        <Text style={styles.message}>
          You are successfully logged in!
        </Text>
      </View>
    </SafeAreaView>
  );
}

// Styles for the Home screen.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  logo: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },

  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});