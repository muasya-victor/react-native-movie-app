import { useTranslation } from '@/hooks/useTranslation';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import translations from './translations.json';

const mockFoodItems = [
  {
    id: '1',
    name: 'Chapati',
    price: 20,
    image: 'https://picsum.photos/300/200?random=1',
    description: 'Fresh homemade chapati bread',
    category: 'Bread'
  },
  {
    id: '2',
    name: 'Chai',
    price: 20,
    image: 'https://picsum.photos/300/200?random=2',
    description: 'Traditional spiced tea with milk',
    category: 'Beverages'
  },
  {
    id: '3',
    name: 'Beans',
    price: 40,
    image: 'https://picsum.photos/300/200?random=3',
    description: 'Seasoned cooked beans',
    category: 'Main Dish'
  },
  {
    id: '4',
    name: 'Ugali',
    price: 15,
    image: 'https://picsum.photos/300/200?random=4',
    description: 'Traditional cornmeal staple',
    category: 'Staple'
  },
  {
    id: '5',
    name: 'Rice & Beef',
    price: 80,
    image: 'https://picsum.photos/300/200?random=5',
    description: 'Steamed rice with tender beef',
    category: 'Main Dish'
  },
  {
    id: '6',
    name: 'Mandazi',
    price: 10,
    image: 'https://picsum.photos/300/200?random=6',
    description: 'Sweet fried dough pastry',
    category: 'Snacks'
  }
];

export default function PlaceOrderComponent() {
  const router = useRouter();
  const { workerName } = useLocalSearchParams();
  const { t } = useTranslation(translations);
  const [orderItems, setOrderItems] = useState({});

  const updateQuantity = (itemId, change) => {
    setOrderItems(prev => {
      const currentQuantity = prev[itemId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      
      if (newQuantity === 0) {
        const { [itemId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [itemId]: newQuantity };
    });
  };

  const calculateTotal = () => {
    return Object.entries(orderItems).reduce((total, [itemId, quantity]) => {
      const item = mockFoodItems.find(food => food.id === itemId);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(orderItems).reduce((total, quantity) => total + quantity, 0);
  };

  const renderFoodItem = ({ item }) => {
    const quantity = orderItems[item.id] || 0;
    
    return (
      <View className="bg-app-surface rounded-2xl mx-4 my-3 shadow-lg overflow-hidden">
        {/* Food Image */}
        <View className="relative">
          <Image 
            source={{ uri: item.image }}
            className="w-full h-48"
            resizeMode="cover"
          />
          <View className="absolute top-3 left-3 bg-app-primary px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">{item.category}</Text>
          </View>
          <View className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full">
            <Text className="text-app-text-primary text-sm font-bold">KES {item.price}</Text>
          </View>
        </View>
        
        {/* Food Details */}
        <View className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text className="text-xl font-bold text-app-text-primary mb-1">
                {item.name}
              </Text>
              <Text className="text-sm text-app-text-secondary leading-5">
                {item.description}
              </Text>
            </View>
          </View>
          
          {/* Quantity Controls */}
          <View className="flex-row items-center justify-between mt-4">
            <View className="flex-row items-center bg-app-surface-variant justify-between rounded-full p-1 w-full">
              <TouchableOpacity 
                className="w-10 h-10 bg-app-danger rounded-full justify-center items-center"
                onPress={() => updateQuantity(item.id, -1)}
              >
                <Text className="text-white text-xl font-bold">−</Text>
              </TouchableOpacity>
              
              <View className="mx-4 min-w-[40px] items-center">
                <Text className="text-2xl font-bold text-app-text-primary">
                  {quantity}
                </Text>
              </View>
              
              <TouchableOpacity 
                className="w-10 h-10 bg-app-primary rounded-full justify-center items-center"
                onPress={() => updateQuantity(item.id, 1)}
              >
                <Text className="text-white text-xl font-bold">+</Text>
              </TouchableOpacity>
            </View>
            
            {quantity > 0 && (
              <View className="bg-app-primary-light px-4 py-2 rounded-full">
                <Text className="text-app-primary font-bold">
                  KES {item.price * quantity}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-app-background">
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

      {/* Worker Info */}
      <View className="px-4 py-4 bg-app-primary-light border-b border-app-border">
        <View className="flex-row items-center">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
            className="w-16 h-16 rounded-full mr-4"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-lg font-semibold text-app-text-primary mb-1">
              {workerName || 'Ethan Carter'}
            </Text>
            <Text className="text-sm text-app-primary font-medium">
              {t('active')}
            </Text>
          </View>
          {getTotalItems() > 0 && (
            <View className="bg-app-primary px-3 py-1 rounded-full">
              <Text className="text-white font-bold">{getTotalItems()} {t('items')}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Food Items */}
      <FlatList
        data={mockFoodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
      />

      {/* Complete Order Button */}
      {getTotalItems() > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-app-border p-4">
          <TouchableOpacity className="bg-app-primary hover:bg-app-primary-dark py-4 rounded-2xl shadow-lg">
            <Text className="text-white text-center text-lg font-bold">
              {t('completeOrder')} (KES {calculateTotal()})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}