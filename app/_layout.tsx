import { Stack } from "expo-router";
import { LanguageProvider } from "@/contexts/LanguageContext"; // Adjust path as needed
import "./global.css";
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="otp" options={{ headerShown: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </LanguageProvider>
    </AuthProvider>
    
  );
}