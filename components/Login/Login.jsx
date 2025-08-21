import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import translations from './translations.json';

export default function LoginComponent() {
  const router = useRouter();
  const { t, currentLanguage, changeLanguage } = useTranslation(translations);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleLogin = () => {
    router.push("/otp");
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en';
    await changeLanguage(newLanguage);
  };

  return (
    <View className="flex-1 bg-white pb-6">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header with app title */}
      <View className="px-4 pt-12 pb-6">
        <Text className="text-xl font-semibold text-center">
          {t('appTitle')}
        </Text>
      </View>

      {/* Language Switcher - Absolutely positioned */}
      <TouchableOpacity
        onPress={handleLanguageToggle}
        className="absolute top-12 right-4 bg-gray-100 rounded-full px-3 py-2 flex-row items-center min-w-[60px] justify-center z-10"
        style={{ zIndex: 10 }}
      >
        <View className={`w-2 h-2 rounded-full mr-2 ${
          currentLanguage === 'en' ? 'bg-green-500' : 'bg-blue-500'
        }`} />
        <Text className="text-sm font-bold text-gray-700">
          {currentLanguage.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          {/* Hero Image */}
          <View className="items-center mb-8">
            <Image 
              source={require('../../assets/images/login.jpg')}
              className="w-full h-80 object-cover rounded-2xl"
              resizeMode="cover"
            />
          </View>

          {/* Title */}
          <Text className="text-lg font-semibold text-black mb-4 text-center">
            {t('enterPhoneNumber')}
          </Text>

          {/* Phone number input */}
          <View className="mb-6">
            <TextInput
              className="bg-green-50 border border-green-100 rounded-full px-4 text-center py-4 text-base text-gray-600"
              placeholder={t('phoneNumberPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
            />
          </View>

          {/* Login button */}
          <TouchableOpacity
            className="bg-green-600 rounded-full py-4 mb-6"
            onPress={handleLogin}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {t('login')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Terms and Privacy */}
        <View className="pb-8">
          <Text className="text-center text-gray-500 text-sm leading-5">
            {t('termsText')}{" "}
            <Text className="text-green-600">{t('termsOfService')}</Text> {t('and')}{" "}
            <Text className="text-green-600">{t('privacyPolicy')}</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}