import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
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

// Country codes data
const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'United States' },
  { code: '+1', country: 'CA', flag: '🇨🇦', name: 'Canada' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+254', country: 'KE', flag: '🇰🇪', name: 'Kenya' },
  { code: '+255', country: 'TZ', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+256', country: 'UG', flag: '🇺🇬', name: 'Uganda' },
  { code: '+250', country: 'RW', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+91', country: 'IN', flag: '🇮🇳', name: 'India' },
  { code: '+86', country: 'CN', flag: '🇨🇳', name: 'China' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France' },
  { code: '+39', country: 'IT', flag: '🇮🇹', name: 'Italy' },
  { code: '+34', country: 'ES', flag: '🇪🇸', name: 'Spain' },
  { code: '+81', country: 'JP', flag: '🇯🇵', name: 'Japan' },
  { code: '+82', country: 'KR', flag: '🇰🇷', name: 'South Korea' },
  { code: '+55', country: 'BR', flag: '🇧🇷', name: 'Brazil' },
  { code: '+52', country: 'MX', flag: '🇲🇽', name: 'Mexico' },
  { code: '+27', country: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', country: 'NG', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt' },
];

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

  // Country code selector state
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[3]); // Default to Kenya (+254)
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handlePhoneNumberChange = (value) => {
    // Clear any previous errors when user starts typing
    clearError();
    // Remove any non-numeric characters except spaces and dashes for display
    const cleanedValue = value.replace(/[^\d\s\-]/g, '');
    setPhoneNumber(cleanedValue);
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

    // When sending to backend, send only the phone number without country code
    const phoneNumberOnly = phoneNumber.replace(/[\s\-]/g, ''); // Remove spaces and dashes
    console.log('Sending to backend:', {
      phoneNumber: phoneNumberOnly, // Only the phone number
      countryCode: selectedCountryCode.code, // Separate field if needed for reference
      fullNumber: selectedCountryCode.code + phoneNumberOnly // Full number for display
    });

    // Phone number is valid, proceed to OTP screen
    router.push("/otp");
  };

  const handleLanguageToggle = async () => {
    const newLanguage = currentLanguage === 'en' ? 'sw' : 'en';
    await changeLanguage(newLanguage);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountryCode(country);
    setShowCountryPicker(false);
    setSearchQuery('');
  };

  // Filter countries based on search query
  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  );

  // Check if phone number is invalid and user has attempted submit
  const showPhoneError = hasAttemptedSubmit && (!phoneNumber.trim() || !isValidPhoneNumber());

  const renderCountryItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-4 border-b border-app-border"
      onPress={() => handleCountrySelect(item)}
    >
      <Text className="text-xl mr-3">{item.flag}</Text>
      <View className="flex-1">
        <Text className="text-app-text-primary font-medium">{item.name}</Text>
        <Text className="text-app-text-secondary text-sm">{item.code}</Text>
      </View>
      {selectedCountryCode.country === item.country && (
        <View className="w-6 h-6 rounded-full bg-app-primary items-center justify-center">
          <Text className="text-white text-xs">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
        <View className={`w-2 h-2 rounded-full mr-2 ${currentLanguage === 'en' ? 'bg-app-primary' : 'bg-app-accent'
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

          {/* Phone number input with country code */}
          <View className="mb-2">
            <View className="flex-row">
              {/* Country Code Selector */}
              <TouchableOpacity
                onPress={() => setShowCountryPicker(true)}
                className={`border rounded-l-full px-3 py-4 flex-row items-center justify-center min-w-[80px] ${showPhoneError
                  ? 'bg-app-danger-light border-app-danger'
                  : isPhoneFocused
                    ? 'bg-app-primary-light border-app-primary'
                    : 'bg-app-primary-light border-app-border'
                  }`}
              >
                <Text className="text-lg mr-1">{selectedCountryCode.flag}</Text>
                <Text className="text-app-text-primary text-sm font-medium">
                  {selectedCountryCode.code}
                </Text>
                <Text className="text-app-text-secondary ml-1">▼</Text>
              </TouchableOpacity>

              {/* Phone Number Input */}
              <TextInput
                className={`border-l-0 border rounded-r-full px-4 py-4 text-base flex-1 ${showPhoneError
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
            className={`rounded-full py-4 mb-6 ${phoneNumber.trim() && isValidPhoneNumber()
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

      {/* Country Code Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-app-background">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-app-border bg-app-surface">
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Text className="text-app-primary text-lg">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-app-text-primary">
              Select Country
            </Text>
            <View className="w-16" />
          </View>

          {/* Search Input */}
          <View className="px-4 py-3 bg-app-surface">
            <TextInput
              className="bg-app-background border border-app-border rounded-full px-4 py-3 text-app-text-primary"
              placeholder="Search countries..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
          </View>

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => `${item.country}-${item.code}`}
            className="flex-1"
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
}