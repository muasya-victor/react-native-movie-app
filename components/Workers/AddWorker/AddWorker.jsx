import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from '@/hooks/useTranslation';
import translations from './translations.json';

export default function AddWorkerComponent() {
  const router = useRouter();
  const { t } = useTranslation(translations);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!firstName.trim()) {
      Alert.alert(t('error'), t('pleaseEnterFirstName'));
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t('error'), t('pleaseEnterLastName'));
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert(t('error'), t('pleaseEnterPhoneNumber'));
      return false;
    }
    // Basic phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s+/g, ''))) {
      Alert.alert(t('error'), t('invalidPhoneNumber'));
      return false;
    }
    return true;
  };

  const handleAddWorker = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newWorker = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phoneNumber.trim(),
        workerId: workerId.trim() || null,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      console.log('Adding worker:', newWorker);
      
      Alert.alert(
        t('success'),
        t('workerAdded'),
        [
          {
            text: t('ok'),
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error adding worker:', error);
      Alert.alert(t('error'), t('error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isFormValid = firstName.trim() && lastName.trim() && phoneNumber.trim();

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-6 pt-14 pb-6 bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={handleCancel} className="w-8 h-8 justify-center items-center">
            <Text className="text-2xl text-gray-700">✕</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            {t('title')}
          </Text>
          <View className="w-8 h-8" />
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ 
          paddingTop: 24,
          paddingBottom: 120 
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* First Name */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {t('firstName')}
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
            placeholder={t('enterFirstName')}
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
            style={{
              fontSize: 16,
              fontFamily: 'System'
            }}
          />
        </View>

        {/* Last Name */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {t('lastName')}
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
            placeholder={t('enterLastName')}
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
            style={{
              fontSize: 16,
              fontFamily: 'System'
            }}
          />
        </View>

        {/* Phone Number */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {t('phoneNumber')}
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
            placeholder={t('enterPhoneNumber')}
            placeholderTextColor="#9CA3AF"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            autoComplete="tel"
            style={{
              fontSize: 16,
              fontFamily: 'System'
            }}
          />
        </View>

        {/* Worker ID (Optional) */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {t('workerIdOptional')}
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
            placeholder={t('enterWorkerId')}
            placeholderTextColor="#9CA3AF"
            value={workerId}
            onChangeText={setWorkerId}
            autoCapitalize="characters"
            autoCorrect={false}
            style={{
              fontSize: 16,
              fontFamily: 'System'
            }}
          />
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-8 bg-white border-t border-gray-100">
        <View className="flex-row space-x-4 gap-4">
          {/* Cancel Button */}
          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-xl py-4 active:scale-95"
            onPress={handleCancel}
          >
            <Text className="text-gray-700 text-center text-lg font-semibold">
              {t('cancel')}
            </Text>
          </TouchableOpacity>

          {/* Add Worker Button */}
          <TouchableOpacity
            className={`flex-1 rounded-xl py-4 active:scale-95 ${
              isFormValid && !isSubmitting
                ? "bg-green-500 shadow-lg" 
                : "bg-gray-300"
            }`}
            onPress={handleAddWorker}
            disabled={!isFormValid || isSubmitting}
            style={{
              shadowColor: isFormValid ? '#10b981' : 'transparent',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isSubmitting ? '...' : t('addWorker')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}