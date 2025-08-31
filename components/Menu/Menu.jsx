// components/Menu/Menu.js
import { useTranslation } from '@/hooks/useTranslation';
import { apiRequest } from '@/services/api';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import translations from './translations.json';

export default function MenuComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [menus, setMenus] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch menus from API
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', '/food/menus/');
      
      if (response.success) {
        setMenus(response.data.results || []);
        
        // Flatten all dishes from all menus into a single array
        const allDishes = [];
        response.data.results?.forEach(menu => {
          menu.dishes?.forEach(dish => {
            allDishes.push({
              ...dish,
              menuName: menu.name,
              menuId: menu.id,
              // Convert cost to positive number and format as price
              price: Math.abs(parseInt(dish.cost)) || 0,
              available: dish.is_available,
              // Use placeholder image for now
              image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
              category: menu.name, // Use menu name as category
              description: `From ${menu.name} menu`,
            });
          });
        });
        
        setDishes(allDishes);
      } else {
        setError(response.error?.message || 'Failed to load menu items');
      }
    } catch (err) {
      console.error('Error fetching menus:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMenuItem = () => {
    router.push('/add-menu-item');
  };

  const handleMenuItemPress = (item) => {
    router.push(`/menu-item-details?itemId=${item.id}&itemName=${encodeURIComponent(item.name)}&menuId=${item.menuId}`);
  };

  const handleRetry = () => {
    fetchMenus();
  };

  // Filter dishes based on search
  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.menuName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMenuItem = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;
    
    return (
      <TouchableOpacity 
        onPress={() => handleMenuItemPress(item)}
        className={`w-[48%] bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden mb-4 ${
          isLeftColumn ? 'mr-1' : 'ml-1'
        }`}
      >
        {/* Menu Item Image */}
        <View className="relative">
          <Image 
            source={{ uri: item.image }}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-full">
            <Text className="text-app-text-primary text-xs font-bold">KSh {item.price}</Text>
          </View>
          {!item.available && (
            <View className="absolute inset-0 bg-black/50 justify-center items-center">
              <Text className="text-white font-bold text-sm">Unavailable</Text>
            </View>
          )}
        </View>
        
        {/* Menu Item Content */}
        <View className="p-3">
          <Text className="text-base font-bold text-app-text-primary mb-1" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-xs text-app-text-secondary mb-3" numberOfLines={2}>
            {item.description}
          </Text>
          
          {/* Category and Status */}
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
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View className="px-4 pt-12 pb-4 flex-row items-center justify-between border-b border-app-border bg-white">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Text className="text-2xl text-app-text-primary">←</Text>
            </TouchableOpacity>
            <Text className="text-xl font-semibold text-app-text-primary">
              {t('title')}
            </Text>
          </View>
          
          {/* <TouchableOpacity 
            onPress={handleAddMenuItem}
            className="bg-app-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">+ {t('addItem')}</Text>
          </TouchableOpacity> */}
        </View>

        {/* Loading indicator */}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-app-text-secondary mt-4">{t('loading')}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View className="px-4 pt-12 pb-4 flex-row items-center justify-between border-b border-app-border bg-white">
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

        {/* Error state */}
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-secondary text-center mb-4">
            {t('error')}: {error}
          </Text>
          <TouchableOpacity 
            onPress={handleRetry}
            className="bg-app-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center justify-between border-b border-app-border bg-white">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-2xl text-app-text-primary">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-app-text-primary">
            {t('title')}
          </Text>
        </View>
        
        {/* <TouchableOpacity 
          onPress={handleAddMenuItem}
          className="bg-app-primary px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">+ {t('addItem')}</Text>
        </TouchableOpacity> */}
      </View>

      {/* Search Bar */}
      <View className="px-4 py-4 bg-app-surface-variant">
        <View className="relative">
          <TextInput
            className="bg-white pl-12 pr-4 py-3 rounded-xl border border-app-border text-app-text-primary"
            placeholder={t('searchMenu')}
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Text className="text-app-text-tertiary text-lg">🔍</Text>
          </View>
        </View>
      </View>

      {/* Menu Stats */}
      <View className="px-4 py-3 bg-white border-b border-app-divider">
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-lg font-bold text-app-text-primary">{menus.length}</Text>
            <Text className="text-xs text-app-text-secondary">{t('totalMenus')}</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-app-text-primary">{dishes.length}</Text>
            <Text className="text-xs text-app-text-secondary">{t('totalDishes')}</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-bold text-app-primary">{dishes.filter(dish => dish.available).length}</Text>
            <Text className="text-xs text-app-text-secondary">{t('availableItems')}</Text>
          </View>
        </View>
      </View>

      {/* Menu Items Grid */}
      <FlatList
        data={filteredDishes}
        renderItem={renderMenuItem}
        keyExtractor={(item) => `${item.menuId}-${item.id}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 100 
        }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        refreshing={loading}
        onRefresh={fetchMenus}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-app-text-tertiary text-4xl mb-4">🍽️</Text>
            <Text className="text-app-text-primary text-lg font-semibold mb-2 text-center">
              {searchQuery ? 'No Results Found' : 'No Menu Items'}
            </Text>
            <Text className="text-app-text-secondary text-center mb-6">
              {searchQuery 
                ? 'Try searching with different keywords' 
                : 'Start building your menu by adding your first item'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                onPress={handleAddMenuItem}
                className="bg-app-primary px-6 py-3 rounded-xl"
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