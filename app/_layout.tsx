import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext"; // Adjust path as needed
import { SiteProvider } from "@/contexts/SiteContext";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import "./global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SiteProvider>
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
      </SiteProvider>
      <Toast />
    </AuthProvider>
  );
}
