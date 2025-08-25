// components/AddMenuItem/AddMenuItem.js
import { useTranslation } from '@/hooks/useTranslation';
import { apiRequest } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
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
    ActivityIndicator,
    Modal,
} from "react-native";
import translations from './translations.json';

export default function AddMenuItemComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  
  const [dishName, setDishName] = useState('');
  const [cost, setCost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [creatingMenu, setCreatingMenu] = useState(false);

  // Fetch menus on component mount
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoadingMenus(true);
      const response = await apiRequest('GET', '/food/menus/');
      
      if (response.success) {
        setMenus(response.data.results || []);
        // Auto-select first menu if available
        if (response.data.results?.length > 0) {
          setSelectedMenu(response.data.results[0]);
        }
      } else {
        console.error('Failed to fetch menus:', response.error);
      }
    } catch (err) {
      console.error('Error fetching menus:', err);
    } finally {
      setLoadingMenus(false);
    }
  };

  const createNewMenu = async () => {
    if (!newMenuName.trim()) {
      Alert.alert(t('error'), 'Menu name is required');
      return;
    }

    setCreatingMenu(true);
    try {
      const response = await apiRequest('POST', '/food/menus/', {
        name: newMenuName.trim()
      });

      if (response.success) {
        const newMenu = response.data;
        setMenus(prev => [...prev, newMenu]);
        setSelectedMenu(newMenu);
        setNewMenuName('');
        setShowMenuModal(false);
        Alert.alert(t('success'), 'Menu created successfully!');
      } else {
        Alert.alert(t('error'), response.error?.message || 'Failed to create menu');
      }
    } catch (err) {
      Alert.alert(t('error'), 'Network error occurred');
    } finally {
      setCreatingMenu(false);
    }
  };

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

  const handleAddDish = async () => {
    // Validation
    if (!dishName.trim()) {
      Alert.alert(t('error'), 'Dish name is required');
      return;
    }
    
    if (!cost.trim() || isNaN(parseFloat(cost))) {
      Alert.alert(t('error'), 'Valid cost is required');
      return;
    }
    
    if (!selectedMenu) {
      Alert.alert(t('error'), 'Please select a menu first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for image upload
      const formData = new FormData();
      formData.append('name', dishName.trim());
      formData.append('cost', parseFloat(cost).toString());
      formData.append('menu', selectedMenu.id.toString());
      
      if (selectedImage) {
        formData.append('image', {
          uri: selectedImage.uri,
          type: 'image/jpeg',
          name: 'dish-image.jpg',
        });
      }

      const response = await apiRequest('POST', '/food/dishes/', formData, {
        'Content-Type': 'multipart/form-data',
      });


      if (response.ok) {
        const result = await response.json();
        console.log('Dish created successfully:', result);
        
        Alert.alert(
          t('success'),
          'Dish added successfully!',
          [{ 
            text: t('ok'), 
            onPress: () => {
              // Reset form
              setDishName('');
              setCost('');
              setSelectedImage(null);
              router.back();
            }
          }]
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert(t('error'), errorData.message || 'Failed to add dish');
      }
    } catch (err) {
      console.error('Error adding dish:', err);
      Alert.alert(t('error'), 'Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMenuSelector = () => {
    if (loadingMenus) {
      return (
        <View className="mb-6">
          <Text className="text-base font-medium text-app-text-primary mb-2">
            {t('selectMenu')}
          </Text>
          <View className="bg-app-surface border border-app-border rounded-xl p-4 items-center">
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text className="text-app-text-secondary text-sm mt-2">Loading menus...</Text>
          </View>
        </View>
      );
    }

    return (
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-medium text-app-text-primary">
            {t('selectMenu')}
          </Text>
          <TouchableOpacity 
            onPress={() => setShowMenuModal(true)}
            className="bg-app-accent px-3 py-1 rounded-full"
          >
            <Text className="text-white text-xs font-medium">+ New Menu</Text>
          </TouchableOpacity>
        </View>
        
        {menus.length === 0 ? (
          <TouchableOpacity 
            onPress={() => setShowMenuModal(true)}
            className="bg-app-surface border border-app-border rounded-xl p-6 items-center border-dashed"
          >
            <Text className="text-app-primary text-2xl mb-2">+</Text>
            <Text className="text-app-primary font-medium">Create First Menu</Text>
            <Text className="text-app-text-secondary text-sm mt-1">
              You need to create a menu before adding dishes
            </Text>
          </TouchableOpacity>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="mb-2"
          >
            <View className="flex-row space-x-3">
              {menus.map((menu) => (
                <TouchableOpacity
                  key={menu.id}
                  onPress={() => setSelectedMenu(menu)}
                  className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${
                    selectedMenu?.id === menu.id 
                      ? 'bg-app-primary border-app-primary' 
                      : 'bg-app-surface border-app-border'
                  }`}
                >
                  <Text className={`text-sm font-medium ${
                    selectedMenu?.id === menu.id 
                      ? 'text-white' 
                      : 'text-app-text-primary'
                  }`}>
                    {menu.name}
                  </Text>
                  <Text className={`text-xs mt-1 ${
                    selectedMenu?.id === menu.id 
                      ? 'text-white/80' 
                      : 'text-app-text-secondary'
                  }`}>
                    {menu.dishes?.length || 0} dishes
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
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
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {t('title')}
        </Text>
      </View>

      <ScrollView 
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Menu Selection */}
        {renderMenuSelector()}

        {/* Dish Form */}
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-app-border mb-6">
          <Text className="text-lg font-bold text-app-text-primary mb-6">
            Add New Dish
          </Text>

          {/* Dish Name Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-app-text-primary mb-2">
              Dish Name *
            </Text>
            <TextInput
              className="bg-app-surface border border-app-border rounded-xl px-4 py-3 text-base text-app-text-primary"
              placeholder="Enter dish name..."
              placeholderTextColor="#9E9E9E"
              value={dishName}
              onChangeText={setDishName}
            />
          </View>

          {/* Cost Input */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-app-text-primary mb-2">
              Cost (KSh) *
            </Text>
            <TextInput
              className="bg-app-surface border border-app-border rounded-xl px-4 py-3 text-base text-app-text-primary"
              placeholder="0.00"
              placeholderTextColor="#9E9E9E"
              value={cost}
              onChangeText={setCost}
              keyboardType="numeric"
            />
          </View>

          {/* Image Upload Section */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-app-text-primary mb-2">
              Dish Image
            </Text>
            
            <TouchableOpacity 
              onPress={showImagePicker}
              className="bg-app-surface border border-app-border rounded-xl overflow-hidden"
            >
              {selectedImage ? (
                <View className="relative">
                  <Image 
                    source={{ uri: selectedImage.uri }} 
                    className="w-full h-48" 
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    onPress={() => setSelectedImage(null)}
                    className="absolute top-3 right-3 bg-app-danger rounded-full w-8 h-8 justify-center items-center"
                  >
                    <Text className="text-white text-sm font-bold">×</Text>
                  </TouchableOpacity>
                  <View className="absolute bottom-3 left-3 bg-black/50 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs">Tap to change</Text>
                  </View>
                </View>
              ) : (
                <View className="h-32 justify-center items-center">
                  <View className="w-16 h-16 bg-app-primary-light rounded-full justify-center items-center mb-2">
                    <Text className="text-app-primary text-2xl">📷</Text>
                  </View>
                  <Text className="text-app-primary font-medium text-base">
                    Add Photo
                  </Text>
                  <Text className="text-app-text-secondary text-sm mt-1">
                    Tap to select from gallery or camera
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Menu Preview */}
        {selectedMenu && (
          <View className="bg-app-primary-light rounded-2xl p-4 mb-6">
            <Text className="text-sm font-medium text-app-text-secondary mb-2">
              Adding to Menu:
            </Text>
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-app-primary rounded-full justify-center items-center mr-3">
                <Text className="text-white font-bold">🍽️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-app-text-primary">
                  {selectedMenu.name}
                </Text>
                <Text className="text-sm text-app-text-secondary">
                  {selectedMenu.dishes?.length || 0} existing dishes
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowMenuModal(true)}
                className="bg-white px-3 py-2 rounded-lg"
              >
                <Text className="text-app-primary text-xs font-medium">Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      <View className="px-4 pb-6 bg-white border-t border-app-border">
        <TouchableOpacity 
          onPress={handleAddDish}
          className={`py-4 px-6 rounded-2xl flex-row items-center justify-center ${
            (!dishName.trim() || !cost.trim() || !selectedMenu || isSubmitting)
              ? 'bg-app-text-tertiary' 
              : 'bg-app-primary'
          }`}
          disabled={!dishName.trim() || !cost.trim() || !selectedMenu || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-center font-medium text-lg ml-2">
                Adding Dish...
              </Text>
            </>
          ) : (
            <Text className="text-white text-center font-medium text-lg">
              Add Dish to {selectedMenu?.name || 'Menu'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Menu Selection Modal */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-app-text-primary">
                Select Menu
              </Text>
              <TouchableOpacity onPress={() => setShowMenuModal(false)}>
                <Text className="text-app-text-tertiary text-2xl">×</Text>
              </TouchableOpacity>
            </View>

            {/* Create New Menu Section */}
            <View className="bg-app-surface rounded-xl p-4 mb-4">
              <Text className="text-sm font-medium text-app-text-primary mb-3">
                Create New Menu
              </Text>
              <View className="flex-row items-center space-x-3">
                <TextInput
                  className="flex-1 bg-white border border-app-border rounded-lg px-3 py-2 text-app-text-primary"
                  placeholder="Menu name..."
                  value={newMenuName}
                  onChangeText={setNewMenuName}
                />
                <TouchableOpacity 
                  onPress={createNewMenu}
                  className={`px-4 py-2 rounded-lg ${
                    creatingMenu ? 'bg-app-text-tertiary' : 'bg-app-primary'
                  }`}
                  disabled={creatingMenu}
                >
                  {creatingMenu ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-medium">Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Existing Menus */}
            <Text className="text-sm font-medium text-app-text-primary mb-3">
              Existing Menus ({menus.length})
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {menus.map((menu) => (
                <TouchableOpacity
                  key={menu.id}
                  onPress={() => {
                    setSelectedMenu(menu);
                    setShowMenuModal(false);
                  }}
                  className={`flex-row items-center p-3 rounded-xl mb-2 ${
                    selectedMenu?.id === menu.id 
                      ? 'bg-app-primary-light border border-app-primary' 
                      : 'bg-app-surface'
                  }`}
                >
                  <View className="w-12 h-12 bg-app-primary rounded-xl justify-center items-center mr-3">
                    <Text className="text-white font-bold">🍽️</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-app-text-primary">
                      {menu.name}
                    </Text>
                    <Text className="text-sm text-app-text-secondary">
                      {menu.dishes?.length || 0} dishes
                    </Text>
                  </View>
                  {selectedMenu?.id === menu.id && (
                    <View className="w-6 h-6 bg-app-primary rounded-full justify-center items-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}