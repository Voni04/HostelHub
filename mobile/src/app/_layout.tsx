// Stack is Expo Router's stack navigator.
// It lets us move between screens such as Login and Register.
import { Stack } from 'expo-router';

// This layout controls navigation for all screens
// inside the src/app folder.
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        // We create our own headings inside the screens,
        // so the default navigation header is hidden.
        headerShown: false,
      }}
    >
      {/* index.tsx is our Login screen. */}
      <Stack.Screen name="index" />

      {/* register.tsx is our Register screen. */}
      <Stack.Screen name="register" />
    </Stack>
  );
}