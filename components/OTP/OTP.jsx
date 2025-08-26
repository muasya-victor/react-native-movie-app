// components/Password/Password.jsx
import React, { useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from '../../hooks/useTranslation';
import { useUserStore } from '../../store/userStore';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest, apiRequestNoAuth } from '../../services/api';
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
  
  const [pin, setPin] = useState("");
  const scrollViewRef = useRef();

  const handlePinChange = (text) => {
    // Only allow numeric input and limit to 6 characters
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setPin(numericText);
      clearError(); // Clear error when user starts typing
    }
  };

  const handleInputFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 200,
        animated: true,
      });
    }, 100);
  };

  const handleLogin = async () => {
    if (pin.length !== 6) {
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
        password: pin
      });

      if (!loginResponse.success) {
        throw new Error(loginResponse.error?.detail || t('loginFailed'));
      }

      const { access, refresh } = loginResponse.data;
      
      // Store tokens in the store
      setTokens(access, refresh);

      // Step 2: Get current user data
      const userResponse = await apiRequest('GET', 'users/users/get-current-user/');

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
    setPin("");
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

          {/* PIN Input Field */}
          <View className="mb-8">
            <TextInput
              className={`border rounded-lg px-4 py-4 text-center text-xl font-bold bg-app-background ${
                pin.length > 0 ? 'border-app-primary' : 'border-app-border'
              } ${error ? 'border-app-danger' : ''}`}
              value={pin}
              onChangeText={handlePinChange}
              onFocus={handleInputFocus}
              placeholder={t('pinPlaceholder')}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry={true}
              editable={!isLoading}
              autoComplete="password"
            />
            {/* Character count indicator */}
            <Text className="text-app-text-tertiary text-xs text-center mt-2">
              {pin.length}/6 {t('digits')}
            </Text>
          </View>

          {/* Forgot Password */}
          {/* <TouchableOpacity 
            className="mb-8"
            onPress={() => {
              Alert.alert(
                t('forgotPassword'),
                t('contactSupport'),
                [{ text: t('ok'), style: 'default' }]
              );
            }}
          >
            <Text className="text-center text-app-primary text-sm">
              {t('forgotPassword')}
            </Text>
          </TouchableOpacity> */}
        </View>

        {/* Bottom Section */}
        <View className="mt-auto">
          {/* Login Button */}
          <TouchableOpacity
            className={`rounded-full py-4 mb-4 flex-row justify-center items-center ${
              pin.length === 6 && !isLoading 
                ? 'bg-app-primary' 
                : 'bg-app-text-tertiary'
            }`}
            onPress={handleLogin}
            disabled={pin.length !== 6 || isLoading}
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
            {t('pinHelpText')}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}