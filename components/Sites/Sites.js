import { useSiteStore } from '@/store/siteStore';
import { useTranslation } from '@/hooks/useTranslation';
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
import { availableSites } from '@/constants/sites';
import translations from './translations.json';

export default function SitesComponent() {
  const { setSelectedSite } = useSiteStore();
  const { t } = useTranslation(translations);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSites = availableSites.filter(site =>
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSite = (site) => {
    setSelectedSite(site);
  };

  const renderSiteCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleSelectSite(item)}
      className="bg-app-surface rounded-lg p-4 mb-4 mx-4 shadow-sm border border-app-border"
    >
      <View className="flex-row items-start mb-3">
        <Image 
          source={{ uri: item.image }}
          className="w-16 h-16 rounded-lg mr-4"
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-lg font-semibold text-app-text-primary mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-app-text-secondary mb-2">
            📍 {item.address}
          </Text>
          <View className="flex-row items-center">
            <View className={`px-2 py-1 rounded-full mr-2 ${
              item.status === 'Active' ? 'bg-app-primary-light' : 'bg-app-surface-variant'
            }`}>
              <Text className={`text-xs font-medium ${
                item.status === 'Active' ? 'text-app-primary' : 'text-app-text-tertiary'
              }`}>
                {t(item.status.toLowerCase())}
              </Text>
            </View>
            <Text className="text-xs text-app-text-secondary">
              {item.type}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row items-center justify-between pt-3 border-t border-app-divider">
        <View className="flex-row items-center">
          <Text className="text-sm text-app-text-secondary mr-4">
            👷 {item.workers} {t('workers')}
          </Text>
          <Text className="text-sm text-app-text-secondary">
            👨‍💼 {item.manager}
          </Text>
        </View>
        <View className="bg-app-primary rounded-full px-3 py-1">
          <Text className="text-white text-xs font-medium">
            {t('select')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      <View className="px-4 pt-12 pb-4 border-b border-app-border">
        <Text className="text-2xl font-bold text-app-text-primary mb-2">
          {t('mySites')}
        </Text>
        <Text className="text-sm text-app-text-secondary">
          {t('selectSiteToManage')}
        </Text>
      </View>

      <View className="px-4 py-4">
        <View className="bg-app-surface border border-app-border rounded-lg px-4 py-3 flex-row items-center">
          <Text className="text-app-text-tertiary mr-3">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('searchSites')}
            placeholderTextColor="#9E9E9E"
            className="flex-1 text-app-text-primary"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-app-text-tertiary ml-2">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredSites}
        renderItem={renderSiteCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <Text className="text-app-text-tertiary text-lg mb-2">🏗️</Text>
            <Text className="text-app-text-secondary text-center">
              {t('noSitesFound')}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

