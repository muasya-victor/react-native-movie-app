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
import { useUserStore } from '../../store/userStore';
import translations from './translations.json';

export default function ProfileComponent() {
  const router = useRouter();
  const { t, currentLanguage, changeLanguage } = useTranslation(translations);
  
  // Get user data from store
  const { 
    user, 
    logout, 
    getFullName, 
    getUserType,
    isWageWorker,
    isSiteManager,
    isSystemAdmin 
  } = useUserStore();
  
  const [phoneNumber, setPhoneNumber] = useState(user?.username || user?.phone_number || "");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhoneNumber, setTempPhoneNumber] = useState(phoneNumber);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const getCurrentLanguageDisplay = () => {
    return currentLanguage === 'en' ? t('english') : t('kiswahili');
  };

  const handleSavePhone = () => {
    setPhoneNumber(tempPhoneNumber);
    setIsEditingPhone(false);
    // TODO: Here you can add API call to update phone number on backend
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
            logout(); // Clear user store
            router.replace("/login");
          },
        },
      ]
    );
  };

  // Get user role display text
  const getUserRoleDisplay = () => {
    const userType = getUserType();
    switch(userType) {
      case 'WageWorker':
        return t('wageWorker');
      case 'SiteManager':
        return t('siteManager');
      case 'SystemAdmin':
        return t('systemAdmin');
      default:
        return t('user');
    }
  };

  // Get profile avatar based on user type
  const getProfileAvatar = () => {
    if (isWageWorker()) return "👷";
    if (isSiteManager()) return "👨‍💼";
    if (isSystemAdmin()) return "⚙️";
    return "👤";
  };

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="bg-app-background px-4 pt-12 pb-4 flex-row items-center border-b border-app-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {t('title')}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="bg-app-background px-6 py-8 border-b border-app-border">
          <View className="items-center">
            <View className="w-20 h-20 bg-app-primary-light rounded-full justify-center items-center mb-4">
              {user?.avatar ? (
                <Text className="text-app-primary text-3xl">{user.avatar}</Text>
              ) : (
                <Text className="text-app-primary text-3xl">{getProfileAvatar()}</Text>
              )}
            </View>
            <Text className="text-xl font-bold text-app-text-primary">
              {getFullName() || t('unknownUser')}
            </Text>
            <Text className="text-app-text-secondary text-sm mt-1">
              {getUserRoleDisplay()}
            </Text>
            {user?.staff_number && (
              <Text className="text-app-text-secondary text-sm mt-1">
                {t('workerId')}: {user.staff_number}
              </Text>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-app-text-secondary uppercase tracking-wide px-6 mb-3">
            {t('accountSettings')}
          </Text>

          {/* Phone Number Section */}
          <View className="bg-app-background border-b border-app-border">
            <View className="px-6 py-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-base font-medium text-app-text-primary mb-1">
                    {t('phoneNumber')}
                  </Text>
                  {isEditingPhone ? (
                    <View className="flex-col items-center space-x-3 mt-2">
                      <TextInput
                        className="flex-1 bg-app-surface border border-app-border rounded p-4 text-base w-full text-app-text-primary"
                        value={tempPhoneNumber}
                        onChangeText={setTempPhoneNumber}
                        keyboardType="phone-pad"
                        autoFocus={true}
                        placeholderTextColor="#9CA3AF"
                      />

                      <View className="w-full flex flex-row justify-between gap-2 py-2">
                        <TouchableOpacity
                          onPress={handleSavePhone}
                          className="bg-app-primary p-4 rounded flex-1 flex items-center"
                        >
                          <Text className="text-white text-sm font-medium">
                            {t('save')}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleCancelEdit}
                          className="bg-app-surface border border-app-border p-4 rounded flex-1 flex items-center"
                        >
                          <Text className="text-app-text-primary text-sm font-medium">
                            {t('cancel')}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <Text className="text-app-text-secondary">
                      {phoneNumber || user?.username || t('notSet')}
                    </Text>
                  )}
                </View>
                {!isEditingPhone && (
                  <TouchableOpacity
                    onPress={() => setIsEditingPhone(true)}
                    className="ml-4"
                  >
                    <Text className="text-app-primary text-sm font-medium">
                      {t('edit')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Email Section (if available) */}
          {user?.email && (
            <View className="bg-app-background border-b border-app-border">
              <View className="px-6 py-4">
                <Text className="text-base font-medium text-app-text-primary mb-1">
                  {t('email')}
                </Text>
                <Text className="text-app-text-secondary">{user.email}</Text>
              </View>
            </View>
          )}

          {/* Language Section */}
          <TouchableOpacity
            className="bg-app-background border-b border-app-border"
            onPress={() => setShowLanguageModal(true)}
          >
            <View className="px-6 py-4 flex-row justify-between items-center">
              <View>
                <Text className="text-base font-medium text-app-text-primary mb-1">
                  {t('language')}
                </Text>
                <Text className="text-app-text-secondary">{getCurrentLanguageDisplay()}</Text>
              </View>
              <Text className="text-app-text-tertiary text-lg">→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* User Info Section */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-app-text-secondary uppercase tracking-wide px-6 mb-3">
            {t('userInfo')}
          </Text>

          <View className="bg-app-background border-b border-app-border">
            <View className="px-6 py-4">
              <Text className="text-base font-medium text-app-text-primary mb-1">
                {t('userType')}
              </Text>
              <Text className="text-app-text-secondary">{getUserRoleDisplay()}</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View className="mt-8 px-6">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-app-danger rounded-full py-4"
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
          <View className="bg-app-background rounded-2xl mx-6 w-80 overflow-hidden">
            {/* Modal Header */}
            <View className="px-6 py-5 border-b border-app-border">
              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={() => setShowLanguageModal(false)}
                  className="mr-4"
                >
                  <Text className="text-xl text-app-text-secondary">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold flex-1 text-center mr-8 text-app-text-primary">
                  {t('selectLanguage')}
                </Text>
              </View>
            </View>

            {/* Language Options */}
            <View>
              <TouchableOpacity
                className="px-6 py-4 border-b border-app-border"
                onPress={() => handleLanguageChange('en')}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-app-text-primary">
                    {t('english')}
                  </Text>
                  {currentLanguage === 'en' && (
                    <Text className="text-app-primary text-lg">✓</Text>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-6 py-4"
                onPress={() => handleLanguageChange('sw')}
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-base text-app-text-primary">
                    {t('kiswahili')}
                  </Text>
                  {currentLanguage === 'sw' && (
                    <Text className="text-app-primary text-lg">✓</Text>
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