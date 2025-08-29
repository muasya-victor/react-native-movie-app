import { useTranslation } from '@/hooks/useTranslation';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
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
} from "react-native";
import translations from './translations.json';

export default function AddSiteComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  
  const [activeTab, setActiveTab] = useState('new');
  const [siteName, setSiteName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [expandedManager, setExpandedManager] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Sample existing managers data
  const existingManagers = [
    {
      id: 1,
      name: 'Liam Harper',
      status: 'Active',
      avatar: 'https://example.com/avatar1.jpg' // Replace with actual avatar URL
    },
    {
      id: 2,
      name: 'Ethan Carter',
      status: 'Active',
      avatar: 'https://example.com/avatar2.jpg' // Replace with actual avatar URL
    }
  ];

  const toggleManager = (managerId) => {
    setExpandedManager(expandedManager === managerId ? null : managerId);
    setSelectedManager(managerId);
  };

  const selectImage = async () => {
    // Request permission to access media library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        t('permissionRequired'),
        t('permissionMessage'),
        [{ text: t('ok'), style: 'default' }]
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    // Request permission to access camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        t('permissionRequired'),
        t('cameraPermissionMessage'),
        [{ text: t('ok'), style: 'default' }]
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      t('selectImage'),
      t('chooseImageSource'),
      [
        { text: t('camera'), onPress: takePhoto },
        { text: t('gallery'), onPress: selectImage },
        { text: t('cancel'), style: 'cancel' }
      ]
    );
  };

  const handleAssignManager = () => {
    if (activeTab === 'new') {
      // Handle new manager assignment
      console.log('Assigning new manager:', { siteName, firstName, lastName, phoneNumber });
    } else {
      // Handle existing manager assignment
      console.log('Assigning existing manager:', selectedManager);
    }
    // Navigate back or show success message
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-app-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {t('title')}
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Site Image Section */}
        <TouchableOpacity onPress={showImagePicker} className="flex-row items-center mb-6">
          <View className="w-16 h-16 bg-app-surface border border-app-border rounded-lg justify-center items-center mr-4 overflow-hidden">
            {selectedImage ? (
              <Image 
                source={{ uri: selectedImage.uri }} 
                className="w-full h-full" 
                resizeMode="cover"
              />
            ) : (
              <View className="justify-center items-center">
                <Text className="text-app-primary text-2xl mb-1">📷</Text>
                <Text className="text-app-text-tertiary text-xs text-center">
                  {t('tapToAdd')}
                </Text>
              </View>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-base text-app-text-primary font-medium">
              {t('imageLabel')}
            </Text>
            <Text className="text-sm text-app-text-secondary mt-1">
              {selectedImage ? t('imageSelected') : t('tapToSelectImage')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Site Name Input */}
        <View className="mb-6">
          <Text className="text-base font-medium text-app-text-primary mb-2">
            {t('name')}
          </Text>
          <TextInput
            className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
            placeholder={t('namePlaceholder')}
            placeholderTextColor="#9E9E9E"
            value={siteName}
            onChangeText={setSiteName}
          />
        </View>

        {/* Manager Tabs */}
        <View className="flex-row mb-6">
          {/* <TouchableOpacity 
            onPress={() => setActiveTab('existing')}
            className="flex-1 mr-2"
          >
            <View className={`pb-2 border-b-2 ${activeTab === 'new' ? 'border-app-primary' : 'border-transparent'}`}>
              <Text className={`text-base font-medium text-center ${
                activeTab === 'new' ? 'text-app-primary' : 'text-app-text-primary'
              }`}>
                {t('newManager')}
              </Text>
            </View>
          </TouchableOpacity> */}
          
          {/* <TouchableOpacity 
            onPress={() => setActiveTab('existing')}
            className="flex-1 ml-2"
          >
            <View className={`pb-2 border-b-2 ${activeTab === 'existing' ? 'border-app-primary' : 'border-transparent'}`}>
              <Text className={`text-base font-medium text-center ${
                activeTab === 'existing' ? 'text-app-primary' : 'text-app-text-primary'
              }`}>
                {t('selectFromExisting')}
              </Text>
            </View>
          </TouchableOpacity> */}
        </View>

        {/* Content based on active tab */}
        {activeTab === 'new' ? (
          <View>
            {/* First Name Input */}
            <View className="mb-4">
              <Text className="text-base font-medium text-app-text-primary mb-2">
                {t('firstName')}
              </Text>
              <TextInput
                className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
                placeholder={t('firstNamePlaceholder')}
                placeholderTextColor="#9E9E9E"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Last Name Input */}
            <View className="mb-4">
              <Text className="text-base font-medium text-app-text-primary mb-2">
                {t('lastName')}
              </Text>
              <TextInput
                className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
                placeholder={t('lastNamePlaceholder')}
                placeholderTextColor="#9E9E9E"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Phone Number Input */}
            <View className="mb-6">
              <Text className="text-base font-medium text-app-text-primary mb-2">
                {t('phoneNumber')}
              </Text>
              <TextInput
                className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
                placeholder={t('phoneNumberPlaceholder')}
                placeholderTextColor="#9E9E9E"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        ) : (
          <View>
            {/* Existing Managers List */}
            {existingManagers.map((manager) => (
              <View key={manager.id} className="mb-2">
                <TouchableOpacity 
                  onPress={() => toggleManager(manager.id)}
                  className={`flex-row items-center p-4 rounded-lg border ${
                    expandedManager === manager.id 
                      ? 'bg-app-primary-light border-app-primary' 
                      : 'bg-app-surface border-app-border'
                  }`}
                >
                  {/* Avatar */}
                  <View className="w-12 h-12 bg-app-accent-light rounded-full justify-center items-center mr-3">
                    <Text className="text-app-accent text-lg font-bold">
                      {manager.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  
                  {/* Manager Info */}
                  <View className="flex-1">
                    <Text className="text-base font-medium text-app-text-primary">
                      {manager.name}
                    </Text>
                    <Text className="text-sm text-app-text-secondary mt-1">
                      {t('active')}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Assign Button - Shows when manager is expanded */}
                {expandedManager === manager.id && (
                  <View className="mt-2">
                    <TouchableOpacity 
                      onPress={handleAssignManager}
                      className="bg-app-primary hover:bg-app-primary-dark py-3 px-6 rounded-lg"
                    >
                      <Text className="text-white text-center font-medium">
                        {t('assignManager')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button - Only show for New Manager tab */}
      {activeTab === 'new' && (
        <View className="px-4 pb-6 bg-app-background border-t border-app-border">
          <TouchableOpacity 
            onPress={handleAssignManager}
            className="bg-app-primary hover:bg-app-primary-dark py-3 px-6 rounded-lg"
          >
            <Text className="text-white text-center font-medium">
              {t('assignManager')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}