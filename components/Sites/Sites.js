// components/Sites/Sites.js
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSiteStore } from '../../store/siteStore';
import translations from './translations.json';
// import useSitesStore from '@/store/sitesStore';

export default function SitesComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  
  // Sites store for fetching available sites
  const {
    sites,
    isLoading,
    error,
    isSelecting,
    selectError,
    fetchSites,
    selectSite: selectSiteFromStore,
    clearErrors,
    setSelectedSite,
    selectedSite,

  } = useSiteStore();


  useEffect(() => {
    fetchSites();
  }, []);


  const handleRefresh = async () => {
    clearErrors();
    await fetchSites();
  };

  const handleSelectSite = (site) => {
    console.log('Site selected, updating store:', site);
    setSelectedSite(site); 

    router.push('/manage-site')
  };

  const getStatusIndicator = (status) => {
    const statusConfig = {
      'Active': {
        color: '#4CAF50',
        backgroundColor: '#E8F5E8',
        icon: '●'
      },
      'Under Construction': {
        color: '#FF9800',
        backgroundColor: '#FFF3E0',
        icon: '🚧'
      },
      'Inactive': {
        color: '#9E9E9E',
        backgroundColor: '#F5F5F5',
        icon: '○'
      }
    };

    return statusConfig[status] || statusConfig['Inactive'];
  };

  const renderSiteItem = ({ item }) => {
    const statusConfig = getStatusIndicator(item.status);
    const isCurrentSite = selectedSite?.id === item.id;

    return (
      <TouchableOpacity
        onPress={() => handleSelectSite(item)}
        disabled={isSelecting}
        className={`bg-app-surface rounded-lg p-4 mb-3 mx-4 shadow-sm ${
          isCurrentSite ? 'border-2 border-app-primary' : 'border border-app-border'
        }`}
      >
        <View className="flex-row items-start justify-between">
          {/* Site Info */}
          <View className="flex-1 mr-3">
            <View className="flex-row items-center mb-2">
              <Text className="text-lg font-semibold text-app-text-primary flex-1">
                {item.name}
              </Text>
              {isCurrentSite && (
                <View className="bg-app-primary rounded-full px-2 py-1 ml-2">
                  <Text className="text-white text-xs font-medium">
                    {t('current')}
                  </Text>
                </View>
              )}
            </View>

            {item.location && (
              <Text className="text-sm text-app-text-secondary mb-1">
                📍 {item.location}
              </Text>
            )}

            {item.description && (
              <Text className="text-sm text-app-text-secondary mb-2" numberOfLines={2}>
                {item.description}
              </Text>
            )}

            <View className="flex-row items-center justify-between">
              {/* Status */}
              <View 
                className="px-2 py-1 rounded-full flex-row items-center"
                style={{ backgroundColor: statusConfig.backgroundColor }}
              >
                <Text style={{ color: statusConfig.color }} className="text-xs mr-1">
                  {statusConfig.icon}
                </Text>
                <Text 
                  style={{ color: statusConfig.color }} 
                  className="text-xs font-medium"
                >
                  {t(`status.${item?.status}`)}
                </Text>
              </View>

              {/* Members count */}
              <Text className="text-xs text-app-text-tertiary">
                {t('membersCount', { 
                  count: (item.members?.length || 0) + (item.managers?.length || 0) 
                })}
              </Text>
            </View>
          </View>

          {/* Selection indicator */}
          <View className="items-center justify-center">
            {isSelecting ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                isCurrentSite 
                  ? 'bg-app-primary border-app-primary' 
                  : 'border-app-border'
              }`}>
                {isCurrentSite && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-4 py-20">
      <Text className="text-4xl mb-4">🏗️</Text>
      <Text className="text-lg font-medium text-app-text-primary mb-2 text-center">
        {t('noSites')}
      </Text>
      <Text className="text-sm text-app-text-secondary text-center mb-4">
        {t('noSitesDescription')}
      </Text>
      <TouchableOpacity 
        onPress={handleRefresh}
        className="bg-app-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-medium">{t('refresh')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center px-4 py-20">
      <Text className="text-4xl mb-4">❌</Text>
      <Text className="text-lg font-medium text-app-text-primary mb-2 text-center">
        {t('errorTitle')}
      </Text>
      <Text className="text-sm text-app-text-secondary text-center mb-4">
        {error || t('errorDescription')}
      </Text>
      <TouchableOpacity 
        onPress={handleRefresh}
        className="bg-app-primary px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-medium">{t('tryAgain')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text className="text-app-text-secondary mt-4">{t('loading')}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-app-background">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {t('title')}
        </Text>
      </View>

      {/* Content */}
      {isLoading ? (
        renderLoadingState()
      ) : error ? (
        renderErrorState()
      ) : sites.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sites}
          renderItem={renderSiteItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor="#4CAF50"
              colors={["#4CAF50"]}
            />
          }
        />
      )}

      {/* Error Message for Site Selection */}
      {selectError && (
        <View className="bg-app-danger-light border border-app-danger m-4 p-3 rounded-lg">
          <Text className="text-app-danger text-sm font-medium text-center">
            {selectError}
          </Text>
        </View>
      )}
    </View>
  );
}