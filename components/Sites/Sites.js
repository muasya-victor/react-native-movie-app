// components/Sites/Sites.js
import { availableSites } from '@/constants/sites';
import { useTranslation } from '@/hooks/useTranslation';
import { useSiteStore } from '@/store/siteStore';
import React from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import translations from './translations.json';

export default function SitesComponent({ onSiteSelect = null }) {
  const { selectedSite, setSelectedSite } = useSiteStore();
  const { t } = useTranslation(translations);

  const handleSiteSelect = (site) => {
    console.log('Site selected, updating store:', site);
    setSelectedSite(site); // Always update the Zustand store
    
    // If onSiteSelect prop is provided, call it (for SmartSiteManager)
    if (onSiteSelect) {
      onSiteSelect(site);
    }
  };

  const renderSiteItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleSiteSelect(item)}
      className="bg-app-surface rounded-lg p-4 mb-3 shadow-sm border border-app-border"
    >
      <View className="flex-row items-center">
        <Image 
          source={{ uri: item.image }}
          className="w-16 h-16 rounded-lg mr-4"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-app-text-primary mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-app-text-secondary mb-2">
            {item.address}
          </Text>
          <View className="flex-row items-center">
            <View className={`w-2 h-2 rounded-full mr-2 ${
              item.status === 'active' ? 'bg-app-primary' : 'bg-app-text-tertiary'
            }`} />
            <Text className={`text-xs font-medium ${
              item.status === 'active' ? 'text-app-primary' : 'text-app-text-tertiary'
            }`}>
              {item.status === 'active' ? t('active') : t('inactive')}
            </Text>
          </View>
        </View>
        
        {/* Selection indicator */}
        {selectedSite?.id === item.id && (
          <View className="w-6 h-6 bg-app-primary rounded-full justify-center items-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
        )}
        
        {/* Arrow indicator */}
        <Text className="text-app-accent text-lg ml-2">›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-app-border">
        <Text className="text-xl font-semibold text-center text-app-text-primary">
          {t('selectSite')}
        </Text>
        <Text className="text-sm text-app-text-secondary text-center mt-2">
          {t('chooseSiteToManage')}
        </Text>
      </View>

      {/* Sites List */}
      <FlatList
        data={availableSites}
        renderItem={renderSiteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="justify-center items-center py-20">
            <Text className="text-app-text-secondary text-base text-center">
              {t('noSitesAvailable')}
            </Text>
          </View>
        }
      />
    </View>
  );
}