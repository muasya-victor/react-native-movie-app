import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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
import { useTranslation } from "../../hooks/useTranslation";
import { Worker } from "../../services/siteService";
import { useSiteStore } from "../../store/siteStore";
import AppleStyleHeader from "../common/AppleStyleHeader";
import translations from "./translations.json";

type SortOption = "name" | "role" | "status";
type TabOption = "all" | "managers" | "members";

export default function WorkersComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);

  // Local state for search, sort, and tabs
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [activeTab, setActiveTab] = useState<TabOption>("members");

  // Zustand store - using selectedSite as primary source
  const {
    workers,
    selectedSite,
    isLoadingSite,
    siteError,
    fetchCurrentSite,
    clearSiteError,
    getActiveWorkers,
  } = useSiteStore();

  // Fetch current site on component mount
  useEffect(() => {
    fetchCurrentSite();
  }, [fetchCurrentSite]);

  // Get workers by tab filter
  const getWorkersByTab = useMemo(() => {
    switch (activeTab) {
      case "managers":
        return workers.filter((worker) => worker.role === "Manager");
      case "members":
        return workers.filter((worker) => worker.role !== "Manager");
      default:
        return workers;
    }
  }, [workers, activeTab]);

  // Filtered and sorted workers
  const filteredAndSortedWorkers = useMemo(() => {
    let filtered = getWorkersByTab;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = getWorkersByTab.filter(
        (worker) =>
          worker.name.toLowerCase().includes(query) ||
          worker.email.toLowerCase().includes(query) ||
          worker.staff_number.toLowerCase().includes(query)
      );
    }

    // Sort workers
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "role":
          // Managers first, then members
          if (a.role === "Manager" && b.role !== "Manager") return -1;
          if (b.role === "Manager" && a.role !== "Manager") return 1;
          return a.name.localeCompare(b.name);
        case "status":
          // Active first, then inactive
          if (a.status === "Active" && b.status !== "Active") return -1;
          if (b.status === "Active" && a.status !== "Active") return 1;
          return a.name.localeCompare(b.name);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [getWorkersByTab, searchQuery, sortBy]);

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    return {
      all: workers.length,
      managers: workers.filter((w) => w.role === "Manager").length,
      members: workers.filter((w) => w.role !== "Manager").length,
    };
  }, [workers]);

  // Handle refresh
  const handleRefresh = async () => {
    await fetchCurrentSite(true); // Force refresh
  };

  // Handle retry when there's an error
  const handleRetry = async () => {
    clearSiteError();
    await fetchCurrentSite(true);
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  // Handle sort option change
  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  // Handle tab change
  const handleTabChange = (tab: TabOption) => {
    setActiveTab(tab);
    setSearchQuery(""); // Clear search when switching tabs
  };

  // Render tab button
  const renderTabButton = (tab: TabOption, label: string, count: number) => {
    const isActive = activeTab === tab;

    return (
      <TouchableOpacity
        key={tab}
        className={`flex-1 py-3 px-4 rounded-lg border ${
          isActive ? "bg-blue-500 border-blue-500" : "bg-white border-gray-200"
        }`}
        onPress={() => handleTabChange(tab)}
      >
        <Text
          className={`text-center font-medium ${
            isActive ? "text-white" : "text-gray-700"
          }`}
        >
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  // Render worker item
  const renderWorkerItem = ({ item }: { item: Worker }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-4 border-b border-app-divider bg-white"
      // onPress={() => {
      //   router.push(`/worker/${item.id}`);
      // }}
    >
      <View className="flex-row items-center flex-1">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full mr-4 overflow-hidden bg-app-primary-light items-center justify-center">
          {item.avatar ? (
            <Image
              source={{ uri: item.avatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-app-primary font-semibold text-sm">
              {getInitials(item.name)}
            </Text>
          )}
        </View>

        {/* Worker Info */}
        <View className="flex-1">
          <Text className="text-base font-medium text-app-text-primary">
            {item.name}
          </Text>

          <View className="flex-row items-center mt-1 space-x-2">
            {/* Status Badge */}
            <View
              className={`px-2 py-1 rounded-full ${
                item.status === "Active" ? "bg-green-100" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.status === "Active" ? "text-green-700" : "text-gray-600"
                }`}
              >
                {t(item.status.toLowerCase()) || item.status}
              </Text>
            </View>

            {/* Role Badge - Only show if viewing "All" tab */}
            {activeTab === "all" && (
              <View
                className={`px-2 py-1 rounded-full ${
                  item.role === "Manager" ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    item.role === "Manager" ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {t(item.role.toLowerCase()) || item.role}
                </Text>
              </View>
            )}
          </View>

          {/* Staff Number */}
          {item.staff_number && (
            <Text className="text-xs text-app-text-secondary mt-1">
              {t("staffNumber") || "Staff #"}: {item.staff_number}
            </Text>
          )}

          {/* Email */}
          {item.email && (
            <Text className="text-xs text-app-text-secondary mt-1">
              {item.email}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Handle add worker
  const handleAddWorker = () => {
    router.push("/add-worker");
  };

  // Get empty state message based on active tab
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "managers":
        return {
          title: t("noManagersFound") || "No managers found",
          description:
            t("noManagersDescription") ||
            "No managers match your search criteria",
        };
      case "members":
        return {
          title: t("noMembersFound") || "No members found",
          description:
            t("noMembersDescription") ||
            "No team members match your search criteria",
        };
      default:
        return {
          title: t("noWorkersFound") || "No workers found",
          description: searchQuery.trim()
            ? t("noSearchResultsDescription") ||
              `No workers found matching "${searchQuery}"`
            : t("noWorkersDescription") ||
              "Add your first worker to get started",
        };
    }
  };

  // Loading state
  if (isLoadingSite && workers.length === 0) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Header */}
        <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-2xl text-app-text-primary">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
            {t("title") || "Workers"}
          </Text>
        </View>

        {/* Loading Indicator */}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-app-text-secondary mt-4">
            {t("loading") || "Loading..."}
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (siteError && workers.length === 0) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Header */}
        <AppleStyleHeader title={t("title")} />

        {/* Error State */}
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-primary text-lg font-medium mb-2">
            {t("error") || "Error"}
          </Text>
          <Text className="text-app-text-secondary text-center mb-6">
            {siteError}
          </Text>
          <TouchableOpacity
            className="bg-app-primary py-3 px-6 rounded-lg"
            onPress={handleRetry}
          >
            <Text className="text-white font-medium">
              {t("retry") || "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const emptyState = getEmptyStateMessage();

  return (
    <>
      <AppleStyleHeader
        title={t("title") || "Workers"}
        subText={`${workers.length} ${t("workers") || "workers"}`}
      />
      <View className="flex-1 bg-app-background">
        {/* Header */}
        <View className="px-4 pb-4 bg-white border-b border-app-border">
          {/* Site Info */}
          {selectedSite && (
            <View className="mb-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-sm text-blue-700 font-medium">
                {selectedSite.name} • {selectedSite.location}
              </Text>
              <Text className="text-xs text-blue-600 mt-1">
                {workers.length} {t("workers") || "workers"} •{" "}
                {workers.filter((w) => w.role === "Manager").length}{" "}
                {t("managers") || "managers"}
              </Text>
            </View>
          )}

          {/* Tab Navigation */}
          <View className="flex-row space-x-2 mb-4">
            {renderTabButton(
              "members",
              t("members") || "Members",
              tabCounts.members
            )}
            {renderTabButton(
              "managers",
              t("managers") || "Managers",
              tabCounts.managers
            )}
          </View>

          {/* Search Bar */}
          <View className="mb-4">
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base"
              placeholder={t("searchWorkers") || "Search workers..."}
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                fontSize: 16,
                fontFamily: "System",
              }}
            />
          </View>

          {/* Sort Options */}
          <View className="flex-row space-x-2 mb-2">
            <Text className="text-sm text-gray-600 mr-2 py-2">
              {t("sortBy") || "Sort by"}:
            </Text>

            <TouchableOpacity
              className={`px-3 py-2 rounded-full border ${
                sortBy === "name"
                  ? "bg-blue-100 border-blue-300"
                  : "bg-gray-100 border-gray-200"
              }`}
              onPress={() => handleSortChange("name")}
            >
              <Text
                className={`text-xs font-medium ${
                  sortBy === "name" ? "text-blue-700" : "text-gray-600"
                }`}
              >
                {t("name") || "Name"}
              </Text>
            </TouchableOpacity>

            {/* Only show role sort option for "all" tab */}
            {activeTab === "all" && (
              <TouchableOpacity
                className={`px-3 py-2 rounded-full border ${
                  sortBy === "role"
                    ? "bg-blue-100 border-blue-300"
                    : "bg-gray-100 border-gray-200"
                }`}
                onPress={() => handleSortChange("role")}
              >
                <Text
                  className={`text-xs font-medium ${
                    sortBy === "role" ? "text-blue-700" : "text-gray-600"
                  }`}
                >
                  {t("role") || "Role"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className={`px-3 py-2 rounded-full border ${
                sortBy === "status"
                  ? "bg-blue-100 border-blue-300"
                  : "bg-gray-100 border-gray-200"
              }`}
              onPress={() => handleSortChange("status")}
            >
              <Text
                className={`text-xs font-medium ${
                  sortBy === "status" ? "text-blue-700" : "text-gray-600"
                }`}
              >
                {t("status") || "Status"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Workers List */}
        {filteredAndSortedWorkers.length > 0 ? (
          <FlatList
            data={filteredAndSortedWorkers}
            renderItem={renderWorkerItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingSite}
                onRefresh={handleRefresh}
                colors={["#007AFF"]}
                tintColor="#007AFF"
              />
            }
          />
        ) : (
          <View className="flex-1 items-center justify-center px-4">
            <Text className="text-app-text-primary text-lg font-medium mb-2">
              {emptyState.title}
            </Text>
            <Text className="text-app-text-secondary text-center mb-6">
              {emptyState.description}
            </Text>
            {searchQuery.trim() && (
              <TouchableOpacity
                className="bg-gray-200 py-2 px-4 rounded-lg"
                onPress={() => setSearchQuery("")}
              >
                <Text className="text-gray-700 font-medium">
                  {t("clearSearch") || "Clear search"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Error Banner */}
        {siteError && workers.length > 0 && (
          <View className="absolute top-20 left-4 right-4 bg-red-500 p-3 rounded-lg z-10">
            <Text className="text-white text-sm font-medium">{siteError}</Text>
            <TouchableOpacity
              onPress={() => clearSiteError()}
              className="absolute right-2 top-2"
            >
              <Text className="text-white text-lg">×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Floating Add Button */}
        <TouchableOpacity
          className="absolute bottom-8 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
          onPress={handleAddWorker}
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text className="text-white text-2xl font-light">+</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
