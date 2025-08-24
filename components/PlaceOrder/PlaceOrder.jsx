import { apiRequest } from '@/services/api';
import { useWorkersStore } from '@/store/workersStore';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// Define translations directly in component to avoid hook issues
const translations = {
  title: "Place Order",
  selectWorker: "Select team member",
  active: "Available",
  busy: "Busy", 
  offline: "Offline",
  items: "items",
  addToOrder: "Add",
  addedToOrder: "Added to order!",
  orderFor: "Order for",
  completeOrder: "Complete Order"
};

const mockFoodItems = [
  {
    id: '1',
    name: 'Chapati',
    price: 20,
    image: 'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?w=300&h=200&fit=crop',
    description: 'Fresh homemade chapati bread',
    category: 'Bread',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Chai',
    price: 20,
    image: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=300&h=200&fit=crop',
    description: 'Traditional spiced tea with milk',
    category: 'Beverages',
    rating: 4.9
  },
  {
    id: '3',
    name: 'Beans',
    price: 40,
    image: 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?w=300&h=200&fit=crop',
    description: 'Seasoned cooked beans',
    category: 'Main Dish',
    rating: 4.6
  },
  {
    id: '4',
    name: 'Ugali',
    price: 15,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop',
    description: 'Traditional cornmeal staple',
    category: 'Staple',
    rating: 4.7
  },
  {
    id: '5',
    name: 'Rice & Beef',
    price: 80,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&h=200&fit=crop',
    description: 'Steamed rice with tender beef',
    category: 'Main Dish',
    rating: 4.9
  },
  {
    id: '6',
    name: 'Mandazi',
    price: 10,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop',
    description: 'Sweet fried dough pastry',
    category: 'Snacks',
    rating: 4.5
  },
  {
    id: '7',
    name: 'Samosa',
    price: 25,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop',
    description: 'Crispy fried pastry with savory filling',
    category: 'Snacks',
    rating: 4.6
  },
  {
    id: '8',
    name: 'Githeri',
    price: 35,
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&h=200&fit=crop',
    description: 'Mixed beans and maize',
    category: 'Main Dish',
    rating: 4.4
  }
];

export default function PlaceOrderComponent() {
  const router = useRouter();
  const { 
    workers, 
    selectedWorker, 
    setSelectedWorker, 
    updateOrderQuantity, 
    getWorkerOrders, 
    getWorkerOrderTotal, 
    getWorkerOrderItemCount,
    clearWorkerOrders
  } = useWorkersStore();
  
  // Simple translation function
  const t = (key) => translations[key] || key;

  const [successAnimation] = useState(new Animated.Value(0));
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const logOrderData = () => {
    const workerOrders = getWorkerOrders(selectedWorker.id);
    const orderData = {
      user_id: parseInt(selectedWorker.id),
      items: workerOrders.map(order => ({
        dish_id: parseInt(order.id),
        number_of_units: order.quantity.toString()
      }))
    };
    
    console.log('=== ORDER DATA FOR BACKEND ===');
    console.log('Worker:', selectedWorker.name);
    console.log('Worker ID:', selectedWorker.id);
    console.log('Total Amount: KES', getWorkerOrderTotal(selectedWorker.id));
    console.log('JSON Structure:', JSON.stringify(orderData, null, 2));
    console.log('===============================');
    
    return orderData;
  };

  const submitOrder = async () => {
    const orderData = logOrderData();
    
    if (orderData.items.length === 0) {
      Alert.alert('No Items', 'Please add some items to the order first.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/food/food-purchases/', orderData);

      console.log(response, 'res');
      
      
      if (response.success) {
        console.log('✅ Order submitted successfully:', response.data);
        Alert.alert(
          'Order Submitted!', 
          `Order for ${selectedWorker.name} has been placed successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear the order after successful submission
                clearWorkerOrders(selectedWorker.id);
                // Optionally navigate back
                // router.back();
              }
            }
          ]
        );
      } else {
        console.error('❌ Order submission failed:', response.error);
        Alert.alert(
          'Order Failed', 
          `Failed to submit order: ${response.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      Alert.alert(
        'Network Error', 
        'Unable to connect to server. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const animateSuccess = () => {
    setShowSuccess(true);
    Animated.sequence([
      Animated.timing(successAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(successAnimation, {
        toValue: 0,
        duration: 200,
        delay: 1000,
        useNativeDriver: true,
      })
    ]).start(() => setShowSuccess(false));
  };

  const updateQuantity = (itemId, change) => {
    const currentOrders = getWorkerOrders(selectedWorker.id);
    const existingOrder = currentOrders.find(order => order.id === itemId);
    const currentQuantity = existingOrder ? existingOrder.quantity : 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    
    // If adding new item, add the full item object
    if (currentQuantity === 0 && change > 0) {
      const foodItem = mockFoodItems.find(item => item.id === itemId);
      if (foodItem) {
        updateOrderQuantity(selectedWorker.id, itemId, newQuantity, foodItem);
      }
    } else {
      updateOrderQuantity(selectedWorker.id, itemId, newQuantity);
    }
    
    if (change > 0) {
      animateSuccess();
    }
  };

  const getItemQuantity = (itemId) => {
    const orders = getWorkerOrders(selectedWorker.id);
    const order = orders.find(o => o.id === itemId);
    return order ? order.quantity : 0;
  };

  const renderWorkerSelector = () => (
    <View className="px-4 py-4 bg-white border-b border-app-border">
      <Text className="text-sm font-medium text-app-text-secondary mb-3">
        {t('selectWorker')}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row space-x-3">
          {workers.map((worker) => {
            const isSelected = selectedWorker.id === worker.id;
            const orderCount = getWorkerOrderItemCount(worker.id);
            
            return (
              <TouchableOpacity
                key={worker.id}
                onPress={() => setSelectedWorker(worker)}
                className={`relative items-center p-3 rounded-2xl min-w-[80px] ${
                  isSelected ? 'bg-app-primary-light border-2 border-app-primary' : 'bg-app-surface'
                }`}
              >
                <View className="relative">
                  <Image 
                    source={{ uri: worker.image }}
                    className="w-12 h-12 rounded-full"
                    resizeMode="cover"
                  />
                  {/* Status Indicator */}
                  <View className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    worker.status === 'active' ? 'bg-app-primary' :
                    worker.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  
                  {/* Order Count Badge */}
                  {orderCount > 0 && (
                    <View className="absolute -top-2 -right-2 w-6 h-6 bg-app-danger rounded-full justify-center items-center border-2 border-white">
                      <Text className="text-white text-xs font-bold">{orderCount}</Text>
                    </View>
                  )}
                </View>
                <Text className={`text-xs font-medium mt-2 text-center ${
                  isSelected ? 'text-app-primary' : 'text-app-text-secondary'
                }`} numberOfLines={1}>
                  {worker.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  const renderFoodItem = ({ item, index }) => {
    const quantity = getItemQuantity(item.id);
    const isLeftColumn = index % 2 === 0;
    
    return (
      <View className={`w-[48%] bg-white rounded-2xl shadow-sm border border-app-border overflow-hidden mb-4 ${
        isLeftColumn ? 'mr-1' : 'ml-1'
      }`}>
        {/* Food Image */}
        <View className="relative">
          <Image 
            source={{ uri: item.image }}
            className="w-full h-32"
            resizeMode="cover"
          />
          <View className="absolute top-2 left-2 bg-black/20 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-medium">⭐ {item.rating}</Text>
          </View>
          <View className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-full">
            <Text className="text-app-text-primary text-xs font-bold">KES {item.price}</Text>
          </View>
        </View>
        
        {/* Food Details */}
        <View className="p-3">
          <Text className="text-base font-bold text-app-text-primary mb-1" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-xs text-app-text-secondary mb-3" numberOfLines={2}>
            {item.description}
          </Text>
          
          {/* Quantity Controls */}
          {quantity === 0 ? (
            <TouchableOpacity 
              className="bg-app-primary py-2 px-4 rounded-full items-center"
              onPress={() => updateQuantity(item.id, 1)}
            >
              <Text className="text-white text-sm font-bold">{t('addToOrder')}</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center justify-between bg-app-surface-variant rounded-full p-1">
              <TouchableOpacity 
                className="w-8 h-8 bg-app-danger rounded-full justify-center items-center"
                onPress={() => updateQuantity(item.id, -1)}
              >
                <Text className="text-white text-sm font-bold">−</Text>
              </TouchableOpacity>
              
              <Text className="text-app-text-primary text-sm font-bold min-w-[20px] text-center">
                {quantity}
              </Text>
              
              <TouchableOpacity 
                className="w-8 h-8 bg-app-primary rounded-full justify-center items-center"
                onPress={() => updateQuantity(item.id, 1)}
              >
                <Text className="text-white text-sm font-bold">+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const totalItems = getWorkerOrderItemCount(selectedWorker.id);
  const totalAmount = getWorkerOrderTotal(selectedWorker.id);

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

      {/* Worker Selector */}
      {renderWorkerSelector()}

      {/* Selected Worker Info */}
      <View className="px-4 py-4 bg-app-primary-light/50 border-b border-app-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <Image 
              source={{ uri: selectedWorker.image }}
              className="w-14 h-14 rounded-full mr-3"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-lg font-bold text-app-text-primary">
                {selectedWorker.name}
              </Text>
              <Text className="text-sm text-app-text-secondary">
                {selectedWorker.department} • {t(selectedWorker.status)}
              </Text>
            </View>
          </View>
          {totalItems > 0 && (
            <View className="bg-app-primary px-3 py-2 rounded-full">
              <Text className="text-white text-sm font-bold">
                {totalItems} {t('items')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Food Items Grid */}
      <FlatList
        data={mockFoodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: totalItems > 0 ? 140 : 20 
        }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />

      {/* Success Animation */}
      {showSuccess && (
        <Animated.View 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-app-primary px-6 py-3 rounded-full shadow-lg"
          style={{
            opacity: successAnimation,
            transform: [
              {
                scale: successAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                })
              }
            ]
          }}
        >
          <Text className="text-white font-bold text-center">✓ {t('addedToOrder')}</Text>
        </Animated.View>
      )}

      {/* Complete Order Button */}
      {totalItems > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-app-border p-4 shadow-lg">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-app-text-secondary text-sm">
              {t('orderFor')} {selectedWorker.name}
            </Text>
            <Text className="text-app-text-primary text-sm font-medium">
              {totalItems} {t('items')}
            </Text>
          </View>
          <TouchableOpacity 
            className={`py-4 rounded-2xl shadow-lg flex-row items-center justify-center ${
              isSubmitting ? 'bg-app-text-tertiary' : 'bg-app-primary hover:bg-app-primary-dark'
            }`}
            onPress={submitOrder}
            disabled={isSubmitting}
          >
            <Text className="text-white text-lg font-bold mr-2">
              {isSubmitting ? 'Submitting...' : t('completeOrder')}
            </Text>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-bold">
                KES {totalAmount}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}