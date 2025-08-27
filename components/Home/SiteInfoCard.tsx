// components/SiteInfoCard.tsx
import React, { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSiteStore } from "../../store/siteStore";

interface SiteInfoCardProps {
  onNoSiteAction?: () => void;
  translations?: {
    currentSite: string;
    noSiteAssigned: string;
    contactAdmin: string;
    retryFetchSite: string;
    siteFunctions: string;
    loading: string;
    error: string;
    retry: string;
  };
}

export const SiteInfoCard: React.FC<SiteInfoCardProps> = ({
  onNoSiteAction,
  translations = {
    currentSite: "Current Site",
    noSiteAssigned: "No Site Assigned",
    contactAdmin:
      "Please contact your administrator to assign you to a site. Some functions may not work without site assignment.",
    retryFetchSite: "Retry Fetch Site",
    siteFunctions: "Some functions require site assignment",
    loading: "Loading site information...",
    error: "Error loading site",
    retry: "Retry",
  },
}) => {
  const { selectedSite, fetchCurrentSite, isLoadingSite, siteError } =
    useSiteStore();

  useEffect(() => {
    // Only fetch if there's no selected site, not loading, AND no existing site error
    if (!selectedSite && !isLoadingSite && !siteError) {
      fetchCurrentSite();
    }
  }, [selectedSite, isLoadingSite, siteError, fetchCurrentSite]); // Added siteError to dependency array

  const refetchSite = () => {
    fetchCurrentSite(true); // Force refresh
  };

  const hasNoSiteAssigned = !selectedSite && !isLoadingSite && siteError;
  const isNoSiteError =
    siteError?.includes("not found") ||
    siteError?.includes("No site") ||
    siteError?.includes("404");

  if (isLoadingSite) {
    return (
      <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#3B82F6" className="mr-3" />
          <Text className="text-blue-700 text-sm font-medium">
            {translations.loading}
          </Text>
        </View>
      </View>
    );
  }

  if (hasNoSiteAssigned && isNoSiteError) {
    return (
      <View className="bg-orange-50 border border-orange-200 border-dashed rounded-lg p-4 mb-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-orange-800 font-semibold text-base mb-2">
              ⚠️ {translations.noSiteAssigned}
            </Text>
            <Text className="text-orange-700 text-sm leading-5">
              {translations.contactAdmin}
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-2">
          <TouchableOpacity
            className="bg-orange-600 px-4 py-2 rounded-md flex-1"
            onPress={refetchSite}
          >
            <Text className="text-white text-center text-sm font-medium">
              {translations.retryFetchSite}
            </Text>
          </TouchableOpacity>

          {onNoSiteAction && (
            <TouchableOpacity
              className="bg-orange-100 border border-orange-300 px-4 py-2 rounded-md flex-1"
              onPress={onNoSiteAction}
            >
              <Text className="text-orange-700 text-center text-sm font-medium">
                Contact Admin
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (siteError && !isNoSiteError) {
    return (
      <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-3">
            <Text className="text-red-800 font-semibold text-sm mb-1">
              {translations.error}
            </Text>
            <Text className="text-red-700 text-xs">{siteError}</Text>
          </View>
          <TouchableOpacity
            className="bg-red-600 px-3 py-2 rounded-md"
            onPress={refetchSite}
          >
            <Text className="text-white text-xs font-medium">
              {translations.retry}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedSite) {
    return (
      <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-green-800 font-semibold text-base mb-1">
              📍 {translations.currentSite}
            </Text>
            <Text className="text-green-700 font-medium text-lg">
              {selectedSite.name}
            </Text>
            {selectedSite.location && (
              <Text className="text-green-600 text-sm mt-1">
                📍 {selectedSite.location}
              </Text>
            )}
            {selectedSite.daily_wage_rate && (
              <Text className="text-green-600 text-sm">
                💰 Daily Rate: KES {selectedSite.daily_wage_rate}
              </Text>
            )}
          </View>
          <View className="bg-green-200 rounded-full w-12 h-12 justify-center items-center">
            <Text className="text-2xl">🏢</Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
};
