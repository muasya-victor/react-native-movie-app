import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import translations from './translations.json';

const mockSites = [
  {
    id: '1',
    name: 'Construction Site A',
    address: '123 Main St, Anytown',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center',
    type: 'construction'
  },
  {
    id: '2', 
    name: 'Renovation Project B',
    address: '456 Oak Ave, Anytown',
    image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=100&h=100&fit=crop&crop=center',
    type: 'renovation'
  },
  {
    id: '3',
    name: 'Landscaping Job C', 
    address: '789 Pine Ln, Anytown',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop&crop=center',
    type: 'landscaping'
  }
];

export default function SitesComponent() {
  const router = useRouter();
  const { t } = useTranslation(translations);
  const [expandedSite, setExpandedSite] = useState(null);

  const handleSitePress = (siteId) => {
    setExpandedSite(expandedSite === siteId ? null : siteId);
  };

  const handleManagePress = (site) => {
    router.push({
      pathname: '/manage-site',
      params: { siteId: site.id, siteName: site.name }
    });
  };

  const renderSiteItem = ({ item }) => (
    <View className="mx-4 my-2">
      <TouchableOpacity 
        className="bg-app-surface rounded-lg shadow-sm"
        onPress={() => handleSitePress(item.id)}
      >
        <View className="px-4 py-4 flex-row items-center">
          <Image 
            source={{ uri: item.image }}
            className="w-16 h-16 rounded-lg mr-4"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-lg font-semibold text-app-text-primary mb-1">
              {item.name}
            </Text>
            <Text className="text-sm text-app-text-secondary">
              {item.address}
            </Text>
          </View>
          <Text className="text-app-text-tertiary text-lg">
            {expandedSite === item.id ? '▼' : '▶'}
          </Text>
        </View>
        
        {expandedSite === item.id && (
          <View className="px-4 pb-4 border-t border-app-divider pt-4">
            <View className="flex-row space-x-2">
              <TouchableOpacity className="bg-app-text-primary hover:bg-gray-800 py-3 px-6 rounded-lg flex-1 mr-2">
                <Text className="text-white text-center font-medium">{t('edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-app-primary hover:bg-app-primary-dark py-3 px-6 rounded-lg flex-1 ml-2"
                onPress={() => handleManagePress(item)}
              >
                <Text className="text-white text-center font-medium">{t('manage')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

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

      <View className="flex-1 px-4">
        {/* Add Site Button */}
        <TouchableOpacity className="bg-app-primary hover:bg-app-primary-dark py-4 rounded-lg mt-6 flex-row items-center justify-center">
          <Text className="text-white text-xl mr-2">+</Text>
          <Text className="text-white text-lg font-medium">{t('addSite')}</Text>
        </TouchableOpacity>

        {/* Construction Sites Section */}
        <Text className="text-2xl font-semibold text-app-text-primary mt-8 mb-4">
          {t('constructionSites')}
        </Text>

        <FlatList
          data={mockSites}
          renderItem={renderSiteItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </View>
  );
}