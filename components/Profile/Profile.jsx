import UserTypeSwitcher from '@/components/UserTypeSwitcher';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import translations from './translations.json'; // Import local translations

export default function ProfileComponent() {
  const router = useRouter();
  const { t, currentLanguage, changeLanguage } = useTranslation(translations);
  
  const [phoneNumber, setPhoneNumber] = useState("0712345678");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState(phoneNumber);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const getCurrentLanguageDisplay = () => {
    return currentLanguage === 'en' ? t('english') : t('kiswahili');
  };

  const handleSavePhone = () => {
    setPhoneNumber(tempPhoneNumber);
    setIsEditingPhone(false);
    Alert.alert(t('success'), t('phoneUpdated'));
  };

  const handleCancelEdit = () => {
    setTempPhoneNumber(phoneNumber);
    setIsEditingPhone(false);
  };

  const handleLanguageChange = async (languageCode) => {
    const languageName = languageCode === 'en' ? t('english') : t('kiswahili');
    await changeLanguage(languageCode);
    setShowLanguageModal(false);
    setTimeout(() => {
      Alert.alert(t('success'), `${t('languageChanged')} ${languageName}`);
    }, 100);
  };

  const handleLogout = () => {
    Alert.alert(
      t('logoutTitle'),
      t('logoutConfirm'),
      [
        {
          text: t('cancel'),
          style: "cancel",
        },
        {
          text: t('logout'),
          style: "destructive",
          onPress: () => {
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8">
          {t('title')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="bg-white px-6 py-8 border-b border-gray-100">
          <View className="items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full justify-center items-center mb-4">
              <Text className="text-green-600 text-3xl">👤</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900">John Doe</Text>
            <Text className="text-gray-500 text-sm mt-1">
              {t('workerId')}: W12345
            </Text>
          </View>
        </View>

        <View>
          <UserTypeSwitcher/>
        </View>


        {/* Account Settings */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide px-6 mb-3">
            {t('accountSettings')}
          </Text>

          {/* Phone Number Section */}
          <View className="bg-white border-b border-gray-100">
            <View className="px-6 py-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-900 mb-1">
                    {t('phoneNumber')}
                  </Text>
                  {isEditingPhone ? (
                    <View className="flex-col items-center space-x-3 mt-2">
                      <TextInput
                        className="flex-1 bg-gray-50 border border-gray-200 rounded p-4 text-base w-full"
                        value={tempPhoneNumber}
                        onChangeText={setTempPhoneNumber}
                        keyboardType="phone-pad"
                        autoFocus={true}
                      />

                        <View className="w-full flex flex-row justify-between gap-2 py-2">
                             <TouchableOpacity
                                    onPress={handleSavePhone}
                                    className="bg-green-600 p-4 rounded flex-1 flex items-center"
                                >
                                    <Text className="text-white text-sm font-medium">
                                      {t('save')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCancelEdit}
                                    className="bg-gray-200 p-4 rounded flex-1 flex items-center"
                                >
                                    <Text className="text-gray-700 text-sm font-medium">
                                      {t('cancel')}
                                    </Text>
                                </TouchableOpacity>
                        </View>
                       
                    </View>
                  ) : (
                    <Text className="text-gray-600">{phoneNumber}</Text>
                  )}
                </View>
                {!isEditingPhone && (
                  <TouchableOpacity
                    onPress={() => setIsEditingPhone(true)}
                    className="ml-4"
                  >
                    <Text className="text-green-600 text-sm font-medium">
                      {t('edit')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Language Section */}
          <TouchableOpacity
            className="bg-white border-b border-gray-100"
            onPress={() => setShowLanguageModal(true)}
          >
            <View className="px-6 py-4 flex-row justify-between items-center">
              <View>
                <Text className="text-base font-medium text-gray-900 mb-1">
                  {t('language')}
                </Text>
                <Text className="text-gray-600">{getCurrentLanguageDisplay()}</Text>
              </View>
              <Text className="text-gray-400 text-lg">→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View className="mt-8 px-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500 rounded-full py-4"
          >
            <Text className="text-white text-center text-base font-semibold">
              {t('logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl mx-6 w-80 overflow-hidden">
            {/* Modal Header */}
            <View className="px-6 py-5 border-b border-gray-100">
              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={() => setShowLanguageModal(false)}
                  className="mr-4"
                >
                  <Text className="text-xl text-gray-600">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold flex-1 text-center mr-8 text-gray-900">
                  {t('selectLanguage')}
                </Text>
              </View>
            </View>

            {/* Language Options */}
            <View>
              <TouchableOpacity
                className="px-6 py-4 border-b border-gray-100"
                onPress={() => handleLanguageChange('en')}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-gray-900">
                    {t('english')}
                  </Text>
                  {currentLanguage === 'en' && (
                    <Text className="text-green-600 text-lg">✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-6 py-4"
                onPress={() => handleLanguageChange('sw')}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-gray-900">
                    {t('kiswahili')}
                  </Text>
                  {currentLanguage === 'sw' && (
                    <Text className="text-green-600 text-lg">✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}