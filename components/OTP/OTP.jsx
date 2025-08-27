// components/Password/Password.jsx
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { apiRequest, apiRequestNoAuth } from '../../services/api';
import { useUserStore } from '../../store/userStore';
import translations from './translations.json';

export default function OTPComponent() {
  const router = useRouter();
  const { t } = useTranslation(translations);

  // Zustand store
  const {
    phoneNumber,
    setTokens,
    setUser,
    setLoading,
    setError,
    clearError,
    isLoading,
    error
  } = useUserStore();

  // Auth context
  const { updateUser, switchUserType } = useAuth();

  // PIN state - 4 separate inputs
  const [pin, setPin] = useState(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRefs = useRef([]);
  const scrollViewRef = useRef();

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 4);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  const handlePinChange = (text, index) => {
    // Only allow single numeric digit
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length > 1) {
      // If multiple digits pasted, distribute them across boxes
      const digits = numericText.slice(0, 4).split('');
      const newPin = [...pin];

      for (let i = 0; i < digits.length && (index + i) < 4; i++) {
        newPin[index + i] = digits[i];
      }

      setPin(newPin);

      // Focus the next empty box or last box
      const nextIndex = Math.min(index + digits.length, 3);
      setCurrentIndex(nextIndex);
      inputRefs.current[nextIndex]?.focus();

    } else {
      // Single digit entry
      const newPin = [...pin];
      newPin[index] = numericText;
      setPin(newPin);

      // Auto-advance to next input
      if (numericText && index < 3) {
        const nextIndex = index + 1;
        setCurrentIndex(nextIndex);
        inputRefs.current[nextIndex]?.focus();
      }
    }

    clearError(); // Clear error when user starts typing
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        // If current box is empty and backspace pressed, go to previous box
        const prevIndex = index - 1;
        const newPin = [...pin];
        newPin[prevIndex] = '';
        setPin(newPin);
        setCurrentIndex(prevIndex);
        inputRefs.current[prevIndex]?.focus();
      } else if (pin[index]) {
        // Clear current box
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
    }
  };

  const handleInputFocus = (index) => {
    setCurrentIndex(index);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 200,
        animated: true,
      });
    }, 100);
  };

  const getPinString = () => {
    return pin.join('');
  };

  const isPinComplete = () => {
    return pin.every(digit => digit !== '') && pin.length === 4;
  };

  const handleLogin = async () => {
    const pinString = getPinString();

    if (pinString.length !== 4) {
      Alert.alert(
        t('validationError'),
        t('pinRequired'),
        [{ text: t('ok'), style: 'default' }]
      );
      return;
    }

    if (!phoneNumber) {
      Alert.alert(
        t('error'),
        t('phoneNumberMissing'),
        [{
          text: t('goBack'),
          onPress: () => router.back()
        }]
      );
      return;
    }

    setLoading(true);
    clearError();

    try {
      // Step 1: Login to get tokens
      const loginResponse = await apiRequestNoAuth('POST', 'users/token/', {
        phone_number: phoneNumber.replace(/^\+\d{1,4}/, ''), // Remove country code if present
        password: pinString
      })

      console.log(loginResponse, 'res');


      if (loginResponse.error) {
        throw new Error(loginResponse.error?.detail || t('loginFailed'));
      }

      const { access, refresh } = loginResponse.data;


      // // Store tokens in the store
      setTokens(access, refresh);

      // // Step 2: Get current user data
      const userResponse = await apiRequest('GET', 'users/users/get-current-user/');

      console.log(userResponse);
      if (!userResponse.success) {
        throw new Error(userResponse.error?.detail || t('userDataFailed'));
      }

      // Store user data in userStore
      setUser(userResponse.data);

      // Update AuthContext with user details
      const userData = userResponse.data;

      console.log('Backend user_type:', userData.user_type);
      console.log('User data from API:', userData);

      await updateUser({
        id: userData.id,
        name: `${userData.first_name} ${userData.last_name}`.trim(),
        email: userData.email || `${userData.username}@company.com`, // Fallback email if none provided
        role: userData.user_type === 'WageWorker' ? 'Construction Worker'
          : userData.user_type === 'SiteManager' ? 'Site Manager'
            : 'System Administrator'
      });

      // Set user type in AuthContext
      const switchResult = await switchUserType(userData.user_type);
      console.log('SwitchUserType result:', switchResult);

      // Navigate to main app
      router.replace("/(tabs)");

    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = t('loginFailed');

      if (error.message.includes('Invalid credentials')) {
        errorMessage = t('invalidCredentials');
      } else if (error.message.includes('User not found')) {
        errorMessage = t('userNotFound');
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      Alert.alert(
        t('loginError'),
        errorMessage,
        [{ text: t('ok'), style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Clear PIN when going back
    setPin(['', '', '', '']);
    setCurrentIndex(0);
    clearError();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border">
        <TouchableOpacity onPress={handleBack} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {t('enterPassword')}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-6"
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 50
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Image */}
        <View className="items-center py-6">
          <Image
            source={require('../../assets/images/login.jpg')}
            className="w-full h-56"
            resizeMode="contain"
          />
        </View>

        {/* Content Section */}
        <View className="flex-1">
          {/* Title */}
          <Text className="text-2xl font-bold text-app-text-primary mb-4 text-center">
            {t('enterYourPin')}
          </Text>

          {/* Phone number display */}
          <Text className="text-app-text-secondary text-base mb-8 text-center">
            {t('enterPinFor')} {phoneNumber}
          </Text>

          {/* Error display */}
          {error && (
            <View className="mb-6 p-4 bg-app-danger-light rounded-lg">
              <Text className="text-app-danger text-center text-sm">
                {error}
              </Text>
            </View>
          )}

          {/* PIN Input - 4 Boxes */}
          <View className="mb-8">
            <View className="flex-row justify-center items-center mb-4" style={{ gap: 20 }}>
              {pin.map((digit, index) => (
                <View key={index} className="relative">
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    className={`w-20 h-20 border-2 rounded-xl text-center text-3xl font-bold bg-app-background ${currentIndex === index ? 'border-app-primary' :
                      digit ? 'border-app-primary' : 'border-app-border'
                      } ${error ? 'border-app-danger' : ''}`}
                    value={digit}
                    onChangeText={(text) => handlePinChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => handleInputFocus(index)}
                    placeholder="•"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={1}
                    secureTextEntry={true}
                    editable={!isLoading}
                    selectTextOnFocus={true}
                    autoComplete="off"
                    textContentType="oneTimeCode"
                  />

                  {/* Focus indicator */}
                  {currentIndex === index && (
                    <View className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-app-primary rounded-full" />
                  )}
                </View>
              ))}
            </View>

            {/* Progress indicator */}
            <View className="flex-row justify-center items-center mb-2" style={{ gap: 8 }}>
              {pin.map((digit, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full ${digit ? 'bg-app-primary' : 'bg-app-border'
                    }`}
                />
              ))}
            </View>

            <Text className="text-app-text-tertiary text-xs text-center">
              {pin.filter(digit => digit).length}/4 {t('digits')}
            </Text>
          </View>
        </View>

        {/* Bottom Section */}
        <View className="mt-auto">
          {/* Login Button */}
          <TouchableOpacity
            className={`rounded-full py-4 mb-4 flex-row justify-center items-center ${isPinComplete() && !isLoading
              ? 'bg-app-primary'
              : 'bg-app-text-tertiary'
              }`}
            onPress={handleLogin}
            disabled={!isPinComplete() || isLoading}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="white" size="small" className="mr-2" />
                <Text className="text-white text-center text-lg font-semibold">
                  {t('loggingIn')}
                </Text>
              </>
            ) : (
              <Text className="text-white text-center text-lg font-semibold">
                {t('login')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Help text */}
          <Text className="text-center text-app-text-secondary text-sm">
            Enter your 4-digit PIN to continue
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}