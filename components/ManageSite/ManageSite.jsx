import { useTranslation } from '@/hooks/useTranslation';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import translations from './translations.json';

const mockWorkers = [
  {
    id: '1',
    name: 'Ethan Carter',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    featured: true
  },
  {
    id: '2',
    name: 'Noah Bennett',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Oliver Hayes',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'Oliver Hayes',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '5',
    name: 'Oliver Hayes',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '6',
    name: 'Oliver Hayes',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
];

export default function ManageSiteComponent() {
  const router = useRouter();
  const { siteName } = useLocalSearchParams();
  const { t } = useTranslation(translations);
  const [searchQuery, setSearchQuery] = useState('');

  const handleWorkerPress = (worker) => {
    router.push({
      pathname: '/place-order',
      params: { 
        workerId: worker.id, 
        workerName: worker.name,
        siteName: siteName 
      }
    });
  };

  const filteredWorkers = mockWorkers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderWorkerItem = ({ item, index }) => {
    const isFeatured = index === 0;
    
    return (
      <TouchableOpacity 
        className={`mx-4 my-2 rounded-lg shadow-sm ${isFeatured ? 'bg-app-primary-light' : 'bg-app-surface'}`}
        onPress={() => handleWorkerPress(item)}
      >
        <View className="px-4 py-4 flex-row items-center">
          <Image 
            source={{ uri: item.avatar }}
            className="w-16 h-16 rounded-full mr-4"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-lg font-semibold text-app-text-primary mb-1">
              {item.name}
            </Text>
            <Text className="text-sm text-app-primary font-medium">
              {item.status}
            </Text>
          </View>
        </View>
        
        {isFeatured && (
          <View className="px-4 pb-4">
            <TouchableOpacity className="bg-app-primary hover:bg-app-primary-dark py-4 rounded-lg">
              <Text className="text-white text-center text-lg font-medium">{t('placeOrder')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-app-background">
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

      <View className="flex-1">
        {/* Search Bar */}
        <View className="px-4 py-4 bg-app-accent-light">
          <TextInput
            className="bg-white px-4 py-3 rounded-lg border border-app-border text-app-text-primary"
            placeholder={t('search')}
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Workers List */}
        <FlatList
          data={filteredWorkers}
          renderItem={renderWorkerItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
        />
      </View>
    </View>
  );
}