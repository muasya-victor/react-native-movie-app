// components/Sites/Sites.js
import { useTranslation } from "@/hooks/useTranslation";
import { useSiteStore } from "@/store/siteStore";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import translations from "./translations.json";

export default function SitesComponent({ onSiteSelect = null }) {
  const {
    selectedSite,
    setSelectedSite,
    sitesList,
    isLoadingSitesList,
    isRefreshingSites,
    isLoadingMoreSites,
    sitesListError,
    sitesListPagination,
    sitesSearchQuery,
    fetchSitesList,
    loadMoreSites,
    refreshSitesList,
    searchSites,
    setSitesSearchQuery,
    clearSitesListError,
  } = useSiteStore();

  const { t } = useTranslation(translations);

  // Initial load
  useEffect(() => {
    if (!isLoadingSitesList) {
      fetchSitesList();
    }
  }, []);

  const handleSiteSelect = (siteItem) => {
    console.log("Site selected from list:", siteItem);

    // Transform SiteListItem to Site format for backward compatibility
    const siteForStore = {
      id: siteItem.id || Date.now(), // Fallback ID if not provided
      name: siteItem.name,
      location: siteItem.location,
      image: siteItem.image,
      auto_execute_accruals: siteItem.auto_execute_accruals,
      loan_interest_rate: siteItem.loan_interest_rate,
      daily_wage_rate: siteItem.daily_wage_rate,
      created_at: siteItem.created_at,
      members: [], // Will be populated when needed
      managers: [], // Will be populated when needed
      members_count: siteItem.members_count,
      managers_count: siteItem.managers_count,
    };

    setSelectedSite(siteForStore);

    // If onSiteSelect prop is provided, call it (for SmartSiteManager)
    if (onSiteSelect) {
      onSiteSelect(siteForStore);
    }
  };

  const handleRefresh = useCallback(() => {
    clearSitesListError();
    refreshSitesList();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (sitesListPagination.hasMore && !isLoadingMoreSites) {
      loadMoreSites();
    }
  }, [sitesListPagination.hasMore, isLoadingMoreSites]);

  const handleSearch = useCallback((query) => {
    setSitesSearchQuery(query);
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchSites(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []);

  const renderSiteItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSiteSelect(item)}
      className="bg-app-surface rounded-lg p-4 mb-3 shadow-sm border border-app-border"
    >
      <View className="flex-row items-center">
        {/* Site Image */}
        <View className="w-16 h-16 rounded-lg mr-4 bg-app-border justify-center items-center">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-16 h-16 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-app-text-tertiary text-xs text-center">
              No{"\n"}Image
            </Text>
          )}
        </View>

        <View className="flex-1">
          {/* Site Name */}
          <Text className="text-base font-semibold text-app-text-primary mb-1">
            {item.name}
          </Text>

          {/* Site Location */}
          <Text className="text-sm text-app-text-secondary mb-2">
            {item.location}
          </Text>

          {/* Site Stats */}
          <View className="flex-row items-center space-x-4">
            <Text className="text-xs text-app-text-tertiary">
              {item.members_count} {t("workers")}
            </Text>
            <Text className="text-xs text-app-text-tertiary">
              {item.managers_count} {t("managers")}
            </Text>
          </View>

          {/* Status indicator based on auto_execute_accruals */}
          <View className="flex-row items-center mt-2">
            <View
              className={`w-2 h-2 rounded-full mr-2 ${
                item.auto_execute_accruals
                  ? "bg-app-primary"
                  : "bg-app-text-tertiary"
              }`}
            />
            <Text
              className={`text-xs font-medium ${
                item.auto_execute_accruals
                  ? "text-app-primary"
                  : "text-app-text-tertiary"
              }`}
            >
              {item.auto_execute_accruals ? t("active") : t("inactive")}
            </Text>
          </View>
        </View>

        {/* Selection indicator */}
        {selectedSite?.name === item.name && (
          <View className="w-6 h-6 bg-app-primary rounded-full justify-center items-center">
            <Text className="text-white text-xs font-bold">✓</Text>
          </View>
        )}

        {/* Arrow indicator */}
        <Text className="text-app-accent text-lg ml-2">›</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View className="mb-4">
      {/* Search Input */}
      <TextInput
        value={sitesSearchQuery}
        onChangeText={handleSearch}
        placeholder={t("searchSites")}
        placeholderTextColor="#9CA3AF"
        className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-app-text-primary"
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMoreSites) return null;

    return (
      <View className="py-4 justify-center items-center">
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text className="text-app-text-secondary text-sm mt-2">
          {t("loadingMore")}
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="justify-center items-center py-20">
      {sitesListError ? (
        <View className="items-center">
          <Text className="text-red-500 text-base text-center mb-4">
            {sitesListError}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-app-primary px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">{t("retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text className="text-app-text-secondary text-base text-center">
          {sitesSearchQuery ? t("noSitesFound") : t("noSitesAvailable")}
        </Text>
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-app-text-secondary text-sm mt-4">
        {t("loading")}
      </Text>
    </View>
  );

  // Show loading state on initial load
  if (isLoadingSitesList && sitesList.length === 0) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Header */}
        <View className="px-4 pt-12 pb-4 border-b border-app-border">
          <Text className="text-xl font-semibold text-center text-app-text-primary">
            {t("selectSite")}
          </Text>
          <Text className="text-sm text-app-text-secondary text-center mt-2">
            {t("chooseSiteToManage")}
          </Text>
        </View>

        {renderLoadingState()}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-app-border">
        <Text className="text-xl font-semibold text-center text-app-text-primary">
          {t("selectSite")}
        </Text>
        <Text className="text-sm text-app-text-secondary text-center mt-2">
          {t("chooseSiteToManage")}
        </Text>

        {/* Total sites count */}
        {sitesListPagination.count > 0 && (
          <Text className="text-xs text-app-text-tertiary text-center mt-1">
            {sitesListPagination.count} {t("sitesAvailable")}
          </Text>
        )}
      </View>

      {/* Sites List */}
      <FlatList
        data={sitesList}
        renderItem={renderSiteItem}
        keyExtractor={(item, index) => item.name + index}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: sitesListPagination.hasMore ? 80 : 16,
        }}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingSites}
            onRefresh={handleRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
            title={t("pullToRefresh")}
            titleColor="#6B7280"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}
