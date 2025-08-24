// components/Menu/Menu.js
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from '@/hooks/useTranslation';
import translations from './translations.json';

export default function MenuComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  
  const [searchQuery, setSearchQuery] = useState('');

  // Sample menu data
  const menuItems = [
    {
      id: 1,
      name: 'Chapati',
      price: 20,
      image: 'https://images.unsplash.com/photo-1606471191009-61d1e4d8c4d0?w=400&h=300&fit=crop',
      category: 'Bread',
      description: 'Fresh homemade chapati',
      available: true
    },
    {
      id: 2,
      name: 'Chai',
      price: 20,
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
      category: 'Beverages',
      description: 'Traditional Kenyan tea with milk',
      available: true
    },
    {
      id: 3,
      name: 'Beans',
      price: 40,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      category: 'Main Course',
      description: 'Delicious cooked beans',
      available: true
    },
    {
      id: 4,
      name: 'Manadazi',
      price: 40,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
      category: 'Snacks',
      description: 'Sweet fried doughnuts',
      available: true
    },
    {
      id: 5,
      name: 'Ugali',
      price: 30,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
      category: 'Staples',
      description: 'Traditional maize meal',
      available: true
    },
    {
      id: 6,
      name: 'Sukuma Wiki',
      price: 25,
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
      category: 'Vegetables',
      description: 'Fresh collard greens',
      available: true
    }
  ];

  const handleAddMenuItem = () => {
    router.push('/add-menu-item');
  };

  const handleMenuItemPress = (item) => {
    router.push(`/menu-item-details?itemId=${item.id}&itemName=${encodeURIComponent(item.name)}`);
  };

  // Filter menu items based on search
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMenuItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleMenuItemPress(item)}
      className="bg-app-surface rounded-lg mb-4 shadow-sm overflow-hidden"
    >
      {/* Menu Item Image */}
      <Image 
        source={{ uri: item.image }}
        className="w-full h-48"
        resizeMode="cover"
      />
      
      {/* Menu Item Content */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-lg font-semibold text-app-text-primary flex-1">
            {item.name}
          </Text>
          <View className="bg-app-primary-light px-3 py-1 rounded-full">
            <Text className="text-app-primary font-bold">
              @{item.price}
            </Text>
          </View>
        </View>
        
        <Text className="text-sm text-app-text-secondary mb-2">
          {item.description}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <View className="bg-app-surface-variant px-2 py-1 rounded">
            <Text className="text-xs font-medium text-app-text-secondary">
              {item.category}
            </Text>
          </View>
          
          <View className={`px-2 py-1 rounded-full ${
            item.available ? 'bg-app-primary-light' : 'bg-app-danger-light'
          }`}>
            <Text className={`text-xs font-medium ${
              item.available ? 'text-app-primary' : 'text-app-danger'
            }`}>
              {item.available ? t('available') : t('unavailable')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center justify-between border-b border-app-border">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-2xl text-app-text-primary">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-app-text-primary">
            {t('title')}
          </Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleAddMenuItem}
          className="bg-app-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">+ {t('addItem')}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-4 bg-app-surface-variant">
        <TextInput
          className="bg-white px-4 py-3 rounded-lg border border-app-border text-app-text-primary"
          placeholder={t('searchMenu')}
          placeholderTextColor="#9E9E9E"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Menu Stats */}
      <View className="px-4 py-3 bg-app-background border-b border-app-divider">
        <View className="flex-row justify-between">
          <Text className="text-sm text-app-text-secondary">
            {t('totalItems')}: {menuItems.length}
          </Text>
          <Text className="text-sm text-app-text-secondary">
            {t('availableItems')}: {menuItems.filter(item => item.available).length}
          </Text>
        </View>
      </View>

      {/* Menu Items List */}
      <FlatList
        data={filteredMenuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          padding: 16,
          paddingBottom: 100 
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-app-text-secondary text-base">
              {searchQuery ? t('noSearchResults') : t('noMenuItems')}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                onPress={handleAddMenuItem}
                className="bg-app-primary px-6 py-3 rounded-lg mt-4"
              >
                <Text className="text-white font-medium">{t('addFirstItem')}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
}