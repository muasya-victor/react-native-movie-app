import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import { useUserStore } from '../../store/userStore';
import translations from './translations.json';

export default function LoginComponent() {
  const router = useRouter();
  const { t, currentLanguage, changeLanguage } = useTranslation(translations);
  
  // Zustand store
  const { 
    phoneNumber, 
    setPhoneNumber, 
    isValidPhoneNumber, 
    clearError,
    error 
  } = useUserStore();
  
  // Local state for input focus and validation
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const handlePhoneNumberChange = (value) => {
    // Clear any previous errors when user starts typing
    clearError();
    setPhoneNumber(value);
  };

  const validateAndProceed = () => {
    setHasAttemptedSubmit(true);
    
    if (!phoneNumber.trim()) {
      Alert.alert(
        t('validationError'),
        t('phoneNumberRequired'),
        [{ text: t('ok'), style: 'default' }]
      );
      return;
    }

    if (!isValidPhoneNumber()) {
      Alert.alert(
        t('validationError'),
        t('phoneNumberInvalid'),
        [{ text: t('ok'), style: 'default' }]
      );
      return;
    }

    // Phone number is valid, proceed to password screen
    router.push("/otp");
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en';
    await changeLanguage(newLanguage);
  };

  // Check if phone number is invalid and user has attempted submit
  const showPhoneError = hasAttemptedSubmit && (!phoneNumber.trim() || !isValidPhoneNumber());

  return (
    <View className="flex-1 bg-app-background pb-6">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header with app title */}
      <View className="px-4 pt-12 pb-6">
        <Text className="text-xl font-semibold text-center text-app-text-primary">
          {t('appTitle')}
        </Text>
      </View>

      {/* Language Switcher - Absolutely positioned */}
      <TouchableOpacity
        onPress={handleLanguageToggle}
        className="absolute top-12 right-4 bg-app-surface rounded-full px-3 py-2 flex-row items-center min-w-[60px] justify-center z-10"
        style={{ zIndex: 10 }}
      >
        <View className={`w-2 h-2 rounded-full mr-2 ${
          currentLanguage === 'en' ? 'bg-app-primary' : 'bg-app-accent'
        }`} />
        <Text className="text-sm font-bold text-app-text-secondary">
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
          <Text className="text-lg font-semibold text-app-text-primary mb-4 text-center">
            {t('enterPhoneNumber')}
          </Text>

          {/* Phone number input */}
          <View className="mb-2">
            <TextInput
              className={`border rounded-full px-4 text-center py-4 text-base ${
                showPhoneError 
                  ? 'bg-app-danger-light border-app-danger text-app-text-primary' 
                  : isPhoneFocused 
                    ? 'bg-app-primary-light border-app-primary text-app-text-primary'
                    : 'bg-app-primary-light border-app-border text-app-text-secondary'
              }`}
              placeholder={t('phoneNumberPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              onFocus={() => setIsPhoneFocused(true)}
              onBlur={() => setIsPhoneFocused(false)}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={15}
            />
          </View>

          {/* Error message */}
          {showPhoneError && (
            <View className="mb-4">
              <Text className="text-app-danger text-sm text-center">
                {!phoneNumber.trim() ? t('phoneNumberRequired') : t('phoneNumberInvalid')}
              </Text>
            </View>
          )}

          {/* Continue button */}
          <TouchableOpacity
            className={`rounded-full py-4 mb-6 ${
              phoneNumber.trim() && isValidPhoneNumber()
                ? 'bg-app-primary' 
                : 'bg-app-text-tertiary'
            }`}
            onPress={validateAndProceed}
            disabled={!phoneNumber.trim()}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {t('continue')}
            </Text>
          </TouchableOpacity>

          {/* Helper text */}
          <Text className="text-center text-app-text-secondary text-sm mb-6">
            {t('phoneNumberHint')}
          </Text>
        </View>

        {/* Terms and Privacy */}
        <View className="pb-8">
          <Text className="text-center text-app-text-secondary text-sm leading-5">
            {t('termsText')}{" "}
            <Text className="text-app-primary">{t('termsOfService')}</Text> {t('and')}{" "}
            <Text className="text-app-primary">{t('privacyPolicy')}</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}