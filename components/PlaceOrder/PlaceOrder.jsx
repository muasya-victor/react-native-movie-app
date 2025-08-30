// components/PlaceOrder/PlaceOrder.js
import { apiRequest } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useSiteStore } from '@/store/siteStore';
import { useWorkersStore } from '@/store/workersStore';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import translations from './translations.json';

export default function PlaceOrderComponent() {
  const router = useRouter();
  const { t } = useTranslation(translations);
  
  // Site store
  const { selectedSite } = useSiteStore();

  // Workers store
  const { 
    workers,
    selectedWorker,
    setWorkers,
    setSelectedWorker,
    updateOrderQuantity, 
    getWorkerOrders, 
    getWorkerOrderTotal, 
    getWorkerOrderItemCount,
    clearWorkerOrders
  } = useWorkersStore();
  
  // Local state
  const [successAnimation] = useState(new Animated.Value(0));
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [workersError, setWorkersError] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loadingFood, setLoadingFood] = useState(true);
  const [foodError, setFoodError] = useState(null);
  
  // State for tracking served workers
  const [servedWorkers, setServedWorkers] = useState(new Set());

  // Helper function to get today's date string
  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Check if worker has been served today
  const isWorkerServedToday = (workerId) => {
    return servedWorkers.has(workerId);
  };

  // Mark worker as served
  const markWorkerAsServed = (workerId) => {
    setServedWorkers(prev => new Set([...prev, workerId]));
    
    // You can also save this to AsyncStorage for persistence across app restarts
    // saveServedWorkersToStorage([...servedWorkers, workerId]);
  };

  // Save served workers to storage (optional - for persistence)
  const saveServedWorkersToStorage = async (servedIds) => {
    try {
      // await AsyncStorage.setItem(`served-${getTodayDateString()}`, JSON.stringify(servedIds));
    } catch (error) {
      console.error('Error saving served workers:', error);
    }
  };

  // Fetch food items from API
  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      setLoadingFood(true);
      setFoodError(null);
      
      const response = await apiRequest('GET', '/food/menus/');

      console.log('Food items response:', response);
      
      if (response.success) {
        // Flatten all dishes from all menus into a single array
        const dishes = [];
        (response.data.results || []).forEach(menu => {
          (menu.dishes || []).forEach(dish => {
            dishes.push({
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
        
        setFoodItems(dishes);
      } else {
        setFoodError(response.error?.message || 'Failed to load menu items');
      }
    } catch (err) {
      console.error('Error fetching food items:', err);
      setFoodError(err.message);
    } finally {
      setLoadingFood(false);
    }
  };

  // Fetch workers when site changes
  useEffect(() => {
    const fetchWorkers = async () => {
      if (selectedSite) {
        console.log('Fetching workers for site:', selectedSite);
        
        setLoadingWorkers(true);
        setWorkersError(null);

        try {
          const response = await apiRequest('GET', `/sites/${selectedSite?.id}`);

          console.log('Workers response:', response?.data?.members);
          
          if (response.success && response.data?.members) {
            const siteWorkers = (response.data.members || [])
              .filter(member => member?.user) // Filter out members without user data
              .map(member => ({
                id: member.user.id,
                name: `${member.user.first_name || ''} ${member.user.last_name || ''}`.trim(),
                email: member.user.email || '',
                staffNumber: member.user.staff_number || '',
                image: `https://images.unsplash.com/photo-150${member.id}003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face`,
                siteId: member.site,
                role: member.user.role || 'Member',
                status: 'active',
                orders: []
              }));

            console.log('Processed workers:', siteWorkers);
            
            // Set workers in store
            setWorkers(siteWorkers);
            
            // Auto-select first worker if none selected and workers available
            if (siteWorkers.length > 0 && !selectedWorker) {
              setSelectedWorker(siteWorkers[0]);
            }
          } else {
            console.error('Failed to fetch workers:', response.error);
            setWorkersError(response.error?.message || 'Failed to load workers');
            setWorkers([]);
          }
        } catch (error) {
          console.error('Error fetching workers:', error);
          setWorkersError('Network error while loading workers');
          setWorkers([]);
        } finally {
          setLoadingWorkers(false);
        }
      } else {
        console.warn('No site selected');
        setWorkers([]);
        setSelectedWorker(null);
        setLoadingWorkers(false);
      }
    };

    fetchWorkers();
  }, [selectedSite, setWorkers, setSelectedWorker]);

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

  const logOrderData = () => {
    if (!selectedWorker) {
      console.warn('No worker selected');
      return null;
    }
    
    const workerOrders = getWorkerOrders(selectedWorker.id);
    const orderData = {
      user_id: parseInt(selectedWorker.id),
      items: workerOrders.map(order => ({
        dish_id: parseInt(order.id),
        number_of_units: order.quantity.toString()
      }))
    };

    workerOrders.forEach(order => {
      console.log(`- ${order.name}: ${order.quantity} x KSh ${order.price} = KSh ${order.quantity * order.price}`);
    });
    return orderData;
  };

  const submitOrder = async () => {
    const orderData = logOrderData();
    
    if (!orderData || orderData.items.length === 0) {
      Alert.alert('No Items', 'Please add some items to the order first.');
      return;
    }

    // Check if worker is already served today
    if (isWorkerServedToday(selectedWorker.id)) {
      Alert.alert(
        'Already Served',
        `${selectedWorker.name} has already been served today. Do you want to place another order?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => proceedWithOrder(orderData)
          }
        ]
      );
      return;
    }

    proceedWithOrder(orderData);
  };

  const proceedWithOrder = async (orderData) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest('POST', '/food/food-purchases/', orderData);

      console.log('Order submission response:', response);
      
      if (response.success) {
        console.log('✅ Order submitted successfully:', response.data);
        
        // Mark worker as served
        markWorkerAsServed(selectedWorker.id);
        
        Alert.alert(
          'Order Submitted!', 
          `Order for ${selectedWorker.name} has been placed successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Clear the order after successful submission
                clearWorkerOrders(selectedWorker.id);
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

  const updateQuantity = (itemId, change) => {
    if (!selectedWorker) {
      Alert.alert('No Worker Selected', 'Please select a worker first.');
      return;
    }
    
    const currentOrders = getWorkerOrders(selectedWorker.id);
    const existingOrder = currentOrders.find(order => order.id === itemId);
    const currentQuantity = existingOrder ? existingOrder.quantity : 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    
    // If adding new item, add the full item object
    if (currentQuantity === 0 && change > 0) {
      const foodItem = foodItems.find(item => item.id === itemId);
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
    if (!selectedWorker) return 0;
    const orders = getWorkerOrders(selectedWorker.id);
    const order = orders.find(o => o.id === itemId);
    return order ? order.quantity : 0;
  };

  const renderWorkerSelector = () => {
    if (loadingWorkers) {
      return (
        <View className="px-4 py-4 bg-white border-b border-app-border">
          <Text className="text-sm font-medium text-app-text-secondary mb-3">
            {t('selectWorker')}
          </Text>
          <View className="items-center py-4">
            <ActivityIndicator size="small" color="#4CAF50" />
            <Text className="text-app-text-secondary text-sm mt-2">
              {t('loadingWorkers')}
            </Text>
          </View>
        </View>
      );
    }

    if (workersError) {
      return (
        <View className="px-4 py-4 bg-white border-b border-app-border">
          <Text className="text-sm font-medium text-app-text-secondary mb-3">
            {t('selectWorker')}
          </Text>
          <View className="items-center py-4">
            <Text className="text-app-text-tertiary text-center mb-2">
              {workersError}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setWorkersError(null);
                // Trigger refetch - you could add a refetch function here
              }}
              className="bg-app-primary px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">{t('retry')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (!workers || workers.length === 0) {
      return (
        <View className="px-4 py-4 bg-white border-b border-app-border">
          <Text className="text-sm font-medium text-app-text-secondary mb-3">
            {t('selectWorker')}
          </Text>
          <View className="items-center py-4">
            <Text className="text-app-text-tertiary text-center">
              {t('noWorkersAvailable')}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="px-4 py-4 bg-white border-b border-app-border">
        <Text className="text-sm font-medium text-app-text-secondary mb-3">
          {t('selectWorker')} ({workers.length} {t('available')})
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row space-x-3">
            {workers.map((worker) => {
              const isSelected = selectedWorker?.id === worker.id;
              const orderCount = getWorkerOrderItemCount(worker.id);
              const isServed = isWorkerServedToday(worker.id);
              
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
                    
                    {/* Served Status Indicator - Green dot at top-right */}
                    {isServed && (
                      <View className="absolute -top-1 -right-1 w-4 h-4 bg-app-primary rounded-full justify-center items-center border-2 border-white">
                        <Text className="text-white text-xs font-bold">✓</Text>
                      </View>
                    )}
                    
                    {/* Order Count Badge - Only show if not served or if has current order */}
                    {orderCount > 0 && (
                      <View className={`absolute -top-2 -left-2 w-6 h-6 bg-app-danger rounded-full justify-center items-center border-2 border-white ${
                        isServed ? 'opacity-75' : ''
                      }`}>
                        <Text className="text-white text-xs font-bold">{orderCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text className={`text-xs font-medium mt-2 text-center ${
                    isSelected ? 'text-app-primary' : 'text-app-text-secondary'
                  }`} numberOfLines={1}>
                    {worker.name.split(' ')[0]}
                  </Text>
                  {isServed && (
                    <Text className="text-xs text-app-primary font-medium mt-1">
                      {t('served')}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

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
          <View className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-full">
            <Text className="text-app-text-primary text-xs font-bold">
              KSh {item.price}
            </Text>
          </View>
          {!item.available && (
            <View className="absolute inset-0 bg-black/50 justify-center items-center">
              <Text className="text-white font-bold text-sm">{t('unavailable')}</Text>
            </View>
          )}
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
          {item.available ? (
            quantity === 0 ? (
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
            )
          ) : (
            <View className="bg-app-surface-variant py-2 px-4 rounded-full items-center">
              <Text className="text-app-text-tertiary text-sm font-medium">{t('unavailable')}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const totalItems = selectedWorker ? getWorkerOrderItemCount(selectedWorker.id) : 0;
  const totalAmount = selectedWorker ? getWorkerOrderTotal(selectedWorker.id) : 0;

  // Show loading state if no site selected
  if (!selectedSite) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-2xl text-app-text-primary">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
            {t('title')}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-tertiary text-4xl mb-4">🏗️</Text>
          <Text className="text-app-text-primary text-lg font-semibold mb-2 text-center">
            {t('noSiteSelected')}
          </Text>
          <Text className="text-app-text-secondary text-center mb-6">
            {t('noSiteDescription')}
          </Text>
          <TouchableOpacity 
            className="bg-app-primary px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">{t('goBack')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
      {selectedWorker ? (
        <View className={`px-4 py-4 border-b border-app-border ${
          isWorkerServedToday(selectedWorker.id) 
            ? 'bg-app-primary-light/30' 
            : 'bg-app-primary-light/50'
        }`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="relative">
                <Image 
                  source={{ uri: selectedWorker.image }}
                  className="w-14 h-14 rounded-full mr-3"
                  resizeMode="cover"
                />
                {isWorkerServedToday(selectedWorker.id) && (
                  <View className="absolute -top-1 -right-1 w-5 h-5 bg-app-primary rounded-full justify-center items-center border-2 border-white">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-lg font-bold text-app-text-primary mr-2">
                    {selectedWorker.name}
                  </Text>
                  {isWorkerServedToday(selectedWorker.id) && (
                    <View className="bg-app-primary px-2 py-1 rounded-full">
                      <Text className="text-white text-xs font-bold">
                        {t('served')}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-app-text-secondary">
                  {selectedWorker.role || t('active')}
                </Text>
                {isWorkerServedToday(selectedWorker.id) && (
                  <Text className="text-xs text-app-primary font-medium mt-1">
                    {t('alreadyServed')}
                  </Text>
                )}
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
      ) : (
        <View className="px-4 py-4 bg-app-surface border-b border-app-border">
          <Text className="text-app-text-secondary text-center">
            {t('selectWorkerToOrder')}
          </Text>
        </View>
      )}

      {/* Food Items Grid */}
      {loadingFood ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-app-text-secondary mt-4">{t('loading')}</Text>
        </View>
      ) : foodError ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-secondary text-center mb-4">
            {t('error')}: {foodError}
          </Text>
          <TouchableOpacity 
            onPress={fetchFoodItems}
            className="bg-app-primary px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={foodItems}
          renderItem={renderFoodItem}
          keyExtractor={(item) => `${item.menuId}-${item.id}`}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ 
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: totalItems > 0 ? 140 : 20 
          }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          refreshing={loadingFood}
          onRefresh={fetchFoodItems}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-app-text-secondary text-base text-center">
                {t('noFoodItems')}
              </Text>
            </View>
          }
        />
      )}

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
              {isWorkerServedToday(selectedWorker.id) && (
                <Text className="text-app-primary font-medium"> • {t('served')}</Text>
              )}
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
              {isSubmitting ? t('submitting') : t('completeOrder')}
            </Text>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-bold">
                KSh {totalAmount}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}