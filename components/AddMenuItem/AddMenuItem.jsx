// components/AddMenuItem/AddMenuItem.js
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

export default function AddMenuItemComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  
  const [mealName, setMealName] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const categories = [
    'Main Course',
    'Bread',
    'Beverages',
    'Snacks',
    'Staples',
    'Vegetables',
    'Fruits',
    'Desserts'
  ];

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        t('permissionRequired'),
        t('permissionMessage'),
        [{ text: t('ok'), style: 'default' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        t('permissionRequired'),
        t('cameraPermissionMessage'),
        [{ text: t('ok'), style: 'default' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
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

  const handleAddMeal = () => {
    // Validation
    if (!mealName.trim()) {
      Alert.alert(t('error'), t('mealNameRequired'));
      return;
    }
    
    if (!cost.trim() || isNaN(parseFloat(cost))) {
      Alert.alert(t('error'), t('validCostRequired'));
      return;
    }
    
    if (!category) {
      Alert.alert(t('error'), t('categoryRequired'));
      return;
    }

    // Here you would typically save to your database
    console.log('Adding meal:', {
      name: mealName,
      cost: parseFloat(cost),
      description,
      category,
      image: selectedImage?.uri
    });

    Alert.alert(
      t('success'),
      t('mealAddedSuccessfully'),
      [{ text: t('ok'), onPress: () => router.back() }]
    );
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
        {/* Section Title */}
        <Text className="text-xl font-semibold text-app-text-primary mb-6">
          {t('addMeal')}
        </Text>

        {/* Meal Name Input */}
        <View className="mb-6">
          <Text className="text-base font-medium text-app-text-primary mb-2">
            {t('mealName')}
          </Text>
          <TextInput
            className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
            placeholder={t('mealNamePlaceholder')}
            placeholderTextColor="#9E9E9E"
            value={mealName}
            onChangeText={setMealName}
          />
        </View>

        {/* Cost Input */}
        <View className="mb-6">
          <Text className="text-base font-medium text-app-text-primary mb-2">
            {t('cost')}
          </Text>
          <TextInput
            className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
            placeholder={t('costPlaceholder')}
            placeholderTextColor="#9E9E9E"
            value={cost}
            onChangeText={setCost}
            keyboardType="numeric"
          />
        </View>

        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-base font-medium text-app-text-primary mb-2">
            {t('category')}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            <View className="flex-row space-x-2 px-1">
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full border ${
                    category === cat 
                      ? 'bg-app-primary border-app-primary' 
                      : 'bg-app-surface border-app-border'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    category === cat 
                      ? 'text-white' 
                      : 'text-app-text-secondary'
                  }`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Description Input */}
        <View className="mb-6">
          <Text className="text-base font-medium text-app-text-primary mb-2">
            {t('description')} ({t('optional')})
          </Text>
          <TextInput
            className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
            placeholder={t('descriptionPlaceholder')}
            placeholderTextColor="#9E9E9E"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Image Upload Section */}
        <View className="mb-8">
          <Text className="text-base font-medium text-app-text-primary mb-2">
            {t('image')} ({t('optional')})
          </Text>
          
          <TouchableOpacity 
            onPress={showImagePicker}
            className="bg-app-surface border border-app-border rounded-lg overflow-hidden"
          >
            {selectedImage ? (
              <View>
                <Image 
                  source={{ uri: selectedImage.uri }} 
                  className="w-full h-48" 
                  resizeMode="cover"
                />
                <View className="absolute top-2 right-2 bg-app-danger rounded-full p-2">
                  <TouchableOpacity onPress={() => setSelectedImage(null)}>
                    <Text className="text-white text-sm font-bold">✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="h-32 justify-center items-center">
                <Text className="text-app-primary text-3xl mb-2">📷</Text>
                <Text className="text-app-primary font-medium">
                  + {t('addImage')}
                </Text>
                <Text className="text-app-text-secondary text-sm mt-1">
                  {t('tapToSelectImage')}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="px-4 pb-6 bg-app-background border-t border-app-border">
        <TouchableOpacity 
          onPress={handleAddMeal}
          className="bg-app-primary hover:bg-app-primary-dark py-4 px-6 rounded-lg"
          disabled={!mealName.trim() || !cost.trim() || !category}
        >
          <Text className="text-white text-center font-medium text-lg">
            {t('addMeal')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}