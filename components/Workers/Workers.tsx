import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from "../../hooks/useTranslation";
import { siteService, Worker } from "../../services/siteService";
import { useSiteStore } from "../../store/siteStore";
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
  
  // Local workers state
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Payment prompt state
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(true);
  const [pulseAnimation] = useState(new Animated.Value(1));

  // Zustand store - using selectedSite as primary source
  const { selectedSite } = useSiteStore();

  // Pulse animation for payment buttons
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Set language for siteService
  useEffect(() => {
    siteService.setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Transform selectedSite data to workers when selectedSite changes
  useEffect(() => {
    if (selectedSite) {
      const transformedWorkers = siteService.transformSiteDataToWorkers(selectedSite);
      setWorkers(transformedWorkers);
    } else {
      setWorkers([]);
    }
  }, [selectedSite]);

  // Handle refresh - this could be used to refresh the site data from the parent component
  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay - in a real app, the parent component would handle refreshing site data
    setTimeout(() => {
      if (selectedSite) {
        const transformedWorkers = siteService.transformSiteDataToWorkers(selectedSite);
        setWorkers(transformedWorkers);
      }
      setIsRefreshing(false);
    }, 1000);
  };

  // Get workers by tab filter
  const getWorkersByTab = useMemo(() => {
    switch (activeTab) {
      case "managers":
        return workers.filter((worker) => worker.role === "Manager");
      case "members":
        return workers.filter((worker) => worker.role === "Member");
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
      members: workers.filter((w) => w.role === "Member").length,
    };
  }, [workers]);

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

  // Payment action handlers
  const handlePaymentsDashboard = () => {
    router.push("/payments");
  };

  const handleWithdrawalRequests = () => {
    router.push("/withdrawal-requests");
  };

  // Render payment prompt banner
  const renderPaymentPrompt = () => {
    if (!showPaymentPrompt || workers.length === 0) return null;

    return (
      <View className=" mb-4 rounded-xl">        
        <View className="flex-row mt-4 ">
          <TouchableOpacity
              onPress={handlePaymentsDashboard}
              className="bg-app-accent px-4 py-4 rounded-lg flex-1 mr-2"
            >
              <Text className="text-white text-center font-medium text-sm">
                💳 {t("managePayments") || "Manage Payments"} 
              </Text>
            </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleWithdrawalRequests}
            className="bg-white border border-app-accent px-4 py-4 rounded-lg flex-1 items-center"
          >
            <Text className="text-app-accent text-center font-medium text-sm">
              📋 {t("viewRequests") || "View Requests"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render tab button
  const renderTabButton = (tab: TabOption, label: string, count: number) => {
    const isActive = activeTab === tab;

    return (
      <TouchableOpacity
        key={tab}
        className="flex-1 py-3 px-4"
        onPress={() => handleTabChange(tab)}
      >
        <Text
          className={`text-center font-medium ${
            isActive ? "text-app-accent" : "text-app-text-tertiary"
          }`}
        >
          {label} ({count})
        </Text>
        {isActive && (
          <View className="w-full h-0.5 bg-app-accent mt-2 rounded-full" />
        )}
      </TouchableOpacity>
    );
  };

  // Render worker item with payment hint
  const renderWorkerItem = ({ item, index }: { item: Worker; index: number }) => (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 px-4 border-b border-app-divider bg-white"
      onPress={() => {
        // router.push(`/worker/${item.id}`);
      }}
    >
      <View className="flex-row items-center flex-1">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full mr-4 overflow-hidden bg-app-primary-light items-center justify-center relative">
          <Text className="text-app-primary font-semibold text-sm">
            {getInitials(item.name)}
          </Text>
          {/* Subtle payment indicator for every 3rd worker */}
          {index % 3 === 0 && (
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-app-accent rounded-full items-center justify-center">
              <Text className="text-white text-xs">💰</Text>
            </View>
          )}
        </View>

        {/* Worker Info */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-base font-medium text-app-text-primary">
              {item.name}
            </Text>
            {/* Payment due hint for every 4th worker */}
            {index % 4 === 0 && (
              <View className="ml-2 px-2 py-1 bg-yellow-100 rounded-full">
                <Text className="text-yellow-700 text-xs font-medium">
                  {t("paymentDue") || "Payment Due"}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center mt-1 space-x-2">
            {/* Status Badge */}
            <View
              className={`px-2 py-1 rounded-full ${
                item.status === "Active" ? "bg-app-primary-light" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.status === "Active" ? "text-app-primary" : "text-app-text-secondary"
                }`}
              >
                {t(item.status.toLowerCase()) || item.status}
              </Text>
            </View>

            {/* Role Badge - Only show if viewing "All" tab */}
            {activeTab === "all" && (
              <View
                className={`px-2 py-1 rounded-full ${
                  item.role === "Manager" ? "bg-app-accent-light" : "bg-app-surface"
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    item.role === "Manager" ? "text-app-accent" : "text-app-text-secondary"
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

      {/* Quick payment action for managers */}
      {item.role === "Manager" && (
        <TouchableOpacity
          onPress={handlePaymentsDashboard}
          className="ml-2 p-2 bg-app-accent-light rounded-full"
        >
          <Text className="text-app-accent text-sm">💳</Text>
        </TouchableOpacity>
      )}
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
            "No managers are assigned to this site",
        };
      case "members":
        return {
          title: t("noMembersFound") || "No members found",
          description:
            t("noMembersDescription") ||
            "No team members are assigned to this site",
        };
      default:
        return {
          title: t("noWorkersFound") || "No workers found",
          description: searchQuery.trim()
            ? t("noSearchResultsDescription") ||
              `No workers found matching "${searchQuery}"`
            : t("noWorkersDescription") ||
              "No workers are assigned to this site yet",
        };
    }
  };

  // Render payment floating action button
  const renderPaymentFAB = () => (
    <View className="absolute bottom-8 right-6 items-end">
      {/* Main Add Worker FAB */}
      <TouchableOpacity
        className="w-14 h-14 bg-app-accent rounded-full items-center justify-center shadow-lg mb-3"
        onPress={handleAddWorker}
        style={{
          shadowColor: "#2196F3",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>

      {/* Payment FAB - Only show if there are workers */}
      {workers.length > 0 && (
        <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
          <TouchableOpacity
            className="w-12 h-12 bg-app-primary rounded-full items-center justify-center shadow-lg"
            onPress={handlePaymentsDashboard}
            style={{
              shadowColor: "#4CAF50",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 6,
            }}
          >
            <Text className="text-white text-lg">💰</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );

  // No site selected state
  if (!selectedSite) {
    return (
      <View className="flex-1 bg-app-background items-center justify-center px-4">
        <Text className="text-app-text-primary text-lg font-medium mb-2">
          {t("noSiteSelected") || "No Site Selected"}
        </Text>
        <Text className="text-app-text-secondary text-center mb-6">
          {t("selectSiteDescription") || "Please select a site to view workers"}
        </Text>
      </View>
    );
  }

  const emptyState = getEmptyStateMessage();

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Content */}
      <View className="px-4 pb-4 bg-white border-b border-app-border">
        {/* {renderPaymentPrompt()} */}

        {/* Tab Navigation */}
        <View className="flex-row mb-4 border-b border-app-border">
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
            className="bg-app-surface border border-app-border rounded-xl px-4 py-3 text-base text-app-text-primary"
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
      </View>

      {/* Workers List */}
      {filteredAndSortedWorkers.length > 0 ? (
        <FlatList
          data={filteredAndSortedWorkers}
          renderItem={renderWorkerItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#2196F3"]}
              tintColor="#2196F3"
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
              className="bg-app-surface py-2 px-4 rounded-lg border border-app-border"
              onPress={() => setSearchQuery("")}
            >
              <Text className="text-app-text-primary font-medium">
                {t("clearSearch") || "Clear search"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Enhanced Floating Action Buttons */}
      {renderPaymentFAB()}
    </View>
  );
}