import { useTranslation } from '@/hooks/useTranslation';
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import translations from './translations.json';

export default function SiteSelectorComponent({ 
  sites = [], 
  isLoading = false, 
  error = null, 
  onSiteSelect, 
  onRetry 
}) {
  const { t } = useTranslation(translations);

  // Get site initials for fallback avatar
  const getSiteInitials = (siteName) => {
    return siteName
      ?.split(" ")
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "S";
  };

  // Render site item
  const renderSiteItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white mx-4 mb-4 p-4 rounded-xl border border-app-border shadow-sm"
      onPress={() => onSiteSelect(item)}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center">
        {/* Site Image/Avatar */}
        <View className="w-16 h-16 rounded-xl mr-4 overflow-hidden bg-app-primary-light items-center justify-center">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-app-primary font-bold text-lg">
              {getSiteInitials(item.name)}
            </Text>
          )}
        </View>

        {/* Site Info */}
        <View className="flex-1">
          <Text className="text-lg font-semibold text-app-text-primary mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-app-text-secondary mb-2">
            {item.location}
          </Text>
          
          {/* Site Stats */}
          <View className="flex-row items-center">
            <View className="flex-row items-center mr-4">
              <View className="w-2 h-2 rounded-full bg-app-primary mr-2" />
              <Text className="text-xs text-app-text-secondary">
                {item.members_count || 0} {t('members') || 'members'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-app-accent mr-2" />
              <Text className="text-xs text-app-text-secondary">
                {item.managers_count || 0} {t('managers') || 'managers'}
              </Text>
            </View>
          </View>
        </View>

        {/* Arrow Icon */}
        <View className="w-6 h-6 items-center justify-center">
          <Text className="text-app-text-secondary text-lg">→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (isLoading && sites.length === 0) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View className="px-4 pt-12 pb-4 border-b border-app-border bg-white">
          <Text className="text-xl font-semibold text-center text-app-text-primary">
            {t('selectSite') || 'Select Site'}
          </Text>
        </View>

        {/* Loading Indicator */}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2196F3" />
          <Text className="text-app-text-secondary mt-4">
            {t('loadingSites') || 'Loading sites...'}
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error && sites.length === 0) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View className="px-4 pt-12 pb-4 border-b border-app-border bg-white">
          <Text className="text-xl font-semibold text-center text-app-text-primary">
            {t('selectSite') || 'Select Site'}
          </Text>
        </View>

        {/* Error State */}
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-primary text-lg font-medium mb-2">
            {t('error') || 'Error'}
          </Text>
          <Text className="text-app-text-secondary text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            className="bg-app-primary py-3 px-6 rounded-lg"
            onPress={onRetry}
          >
            <Text className="text-white font-medium">
              {t('retry') || 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty state
  if (!isLoading && sites.length === 0) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        {/* Header */}
        <View className="px-4 pt-12 pb-4 border-b border-app-border bg-white">
          <Text className="text-xl font-semibold text-center text-app-text-primary">
            {t('selectSite') || 'Select Site'}
          </Text>
        </View>

        {/* Empty State */}
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-primary text-lg font-medium mb-2">
            {t('noSitesFound') || 'No Sites Found'}
          </Text>
          <Text className="text-app-text-secondary text-center mb-6">
            {t('noSitesDescription') || 'No sites are available for selection'}
          </Text>
          <TouchableOpacity
            className="bg-app-primary py-3 px-6 rounded-lg"
            onPress={onRetry}
          >
            <Text className="text-white font-medium">
              {t('refresh') || 'Refresh'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main site selection interface
  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-app-border bg-white">
        <Text className="text-xl font-semibold text-center text-app-text-primary">
          {t('selectSite') || 'Select Site'}
        </Text>
        <Text className="text-sm text-app-text-secondary text-center mt-2">
          {t('selectSiteDescription') || 'Choose a site to manage workers'}
        </Text>
      </View>

      {/* Sites List */}
      <FlatList
        data={sites}
        renderItem={renderSiteItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingTop: 16,
          paddingBottom: 32,
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-app-text-secondary text-base text-center">
              {t('noSitesAvailable') || 'No sites available'}
            </Text>
          </View>
        }
      />

      {/* Error Banner (if error but sites exist) */}
      {error && sites.length > 0 && (
        <View className="absolute top-20 left-4 right-4 bg-app-danger p-3 rounded-lg z-10">
          <Text className="text-white text-sm font-medium">{error}</Text>
          <TouchableOpacity
            onPress={onRetry}
            className="absolute right-2 top-2"
          >
            <Text className="text-white text-lg">↻</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}