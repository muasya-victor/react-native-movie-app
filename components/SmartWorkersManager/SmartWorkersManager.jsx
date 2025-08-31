import SiteSelectorComponent from "@/components/SiteSelector/SiteSelector";
import WorkersComponent from "@/components/Workers/Workers";
import { useTranslation } from '@/hooks/useTranslation';
import { siteService } from '@/services/siteService';
import { useSiteStore } from '@/store/siteStore';
import { useEffect, useState } from "react";
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

export default function SmartWorkersManager() {
  const { selectedSite, setSelectedSite, sites, isLoading, error, fetchSites } = useSiteStore();
  const { t, currentLanguage } = useTranslation(translations);
  const [showSiteSelection, setShowSiteSelection] = useState(!selectedSite);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingSiteDetails, setIsLoadingSiteDetails] = useState(false);
  const [siteDetailsError, setSiteDetailsError] = useState(null);

  // Set language for siteService
  useEffect(() => {
    siteService.setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Load sites on component mount
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // Function to fetch full site details by ID
  const fetchSiteDetails = async (siteBasicInfo) => {
    setIsLoadingSiteDetails(true);
    setSiteDetailsError(null);
    
    try {
      const response = await siteService.getSiteById(siteBasicInfo.id);
      
      if (response.success && response.data) {
        // Set the full site details with members and managers
        setSelectedSite(response.data);
        setShowSiteSelection(false);
      } else {
        setSiteDetailsError(response.error?.message || t('failedToLoadSiteDetails') || 'Failed to load site details');
      }
    } catch (error) {
      console.error('Error fetching site details:', error);
      setSiteDetailsError(t('errorLoadingSiteDetails') || 'Error loading site details');
    } finally {
      setIsLoadingSiteDetails(false);
    }
  };

  // Always start with site selection page if no site is selected
  if (showSiteSelection || !selectedSite) {
    return (
      <SiteSelectorComponent 
        sites={sites}
        isLoading={isLoading || isLoadingSiteDetails}
        error={error || siteDetailsError}
        onRetry={fetchSites}
        onSiteSelect={(site) => {
          console.log('Fetching full details for selected site:', site);
          fetchSiteDetails(site); // Fetch full site details instead of just setting
        }}
      />
    );
  }

  // Workers interface (only shown after site selection)
  const handleSwitchSite = async (site) => {
    console.log('Switching to site:', site);
    setShowDropdown(false);
    
    // If the site doesn't have full details (members/managers arrays), fetch them
    if (!site.members || !site.managers) {
      await fetchSiteDetails(site);
    } else {
      setSelectedSite(site);
    }
  };

  const handleBackToSiteSelection = () => {
    setShowSiteSelection(true);
    setShowDropdown(false);
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const renderSiteDropdownItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleSwitchSite(item)}
      className={`flex-row items-center p-3 ${
        selectedSite?.id === item.id ? 'bg-app-primary-light' : 'bg-app-background'
      }`}
    >
      {item.image ? (
        <Image 
          source={{ uri: item.image }}
          className="w-10 h-10 rounded-lg mr-3"
          resizeMode="cover"
        />
      ) : (
        <View className="w-10 h-10 rounded-lg mr-3 bg-app-surface border border-app-border items-center justify-center">
          <Text className="text-app-text-secondary font-medium text-sm">
            {item.name?.charAt(0)?.toUpperCase() || 'S'}
          </Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-sm font-medium text-app-text-primary">
          {item.name}
        </Text>
        <Text className="text-xs text-app-text-secondary">
          {item.location}
        </Text>
      </View>
      {selectedSite?.id === item.id && (
        <View className="w-5 h-5 bg-app-primary rounded-full justify-center items-center">
          <Text className="text-white text-xs">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Loading state for sites
  if (isLoading && sites.length === 0) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2196F3" />
          <Text className="text-app-text-secondary mt-4">
            {t('loadingSites') || 'Loading sites...'}
          </Text>
        </View>
      </View>
    );
  }

  // Error state for sites
  if (error && sites.length === 0) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-primary text-lg font-medium mb-2">
            {t('error') || 'Error'}
          </Text>
          <Text className="text-app-text-secondary text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity
            className="bg-app-primary py-3 px-6 rounded-lg"
            onPress={fetchSites}
          >
            <Text className="text-white font-medium">
              {t('retry') || 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header with Site Dropdown */}
      <View className="px-4 pt-12 pb-4 border-b border-app-border">
        <View className="relative">
          <TouchableOpacity 
            onPress={handleDropdownToggle}
            className="flex-row items-center bg-app-surface border border-app-border rounded-lg p-3 mb-3"
          >
            {selectedSite.image ? (
              <Image 
                source={{ uri: selectedSite.image }}
                className="w-8 h-8 rounded-lg mr-3"
                resizeMode="cover"
              />
            ) : (
              <View className="w-8 h-8 rounded-lg mr-3 bg-app-primary-light items-center justify-center">
                <Text className="text-app-primary font-semibold text-xs">
                  {selectedSite.name?.charAt(0)?.toUpperCase() || 'S'} 
                </Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-base font-semibold text-app-text-primary">
                {selectedSite.name}
              </Text>
              <Text className="text-xs text-app-text-secondary">
                {selectedSite.location}
              </Text>
            </View>
            <Text className={`text-lg text-app-accent transition-transform ${showDropdown ? 'transform rotate-180' : ''}`}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {showDropdown && (
            <View className="absolute top-full left-0 right-0 bg-app-background border border-app-border rounded-lg shadow-lg z-50 max-h-64">
              <FlatList
                data={sites}
                renderItem={renderSiteDropdownItem}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                className="rounded-lg"
              />
              
              <TouchableOpacity 
                onPress={handleBackToSiteSelection}
                className="border-t border-app-divider p-3 bg-app-surface-variant"
              >
                <Text className="text-center text-app-accent font-medium">
                  {t('backToSiteSelection')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Page Title */}
        <Text className="text-xl font-semibold text-app-text-primary text-center">
          {t('workersManagement')}
        </Text>
      </View>

      <View className="flex-1">
        <WorkersComponent />
      </View>
    </View>
  );
}