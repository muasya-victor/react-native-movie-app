import ManageSiteComponent from "@/components/ManageSite/ManageSite";
import SitesComponent from "@/components/Sites/Sites";
import { availableSites } from '@/constants/sites';
import { useTranslation } from '@/hooks/useTranslation';
import { useSiteStore } from '@/store/siteStore';
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

export default function SmartSiteManager() {
  const { selectedSite, setSelectedSite } = useSiteStore();
  const { t } = useTranslation(translations);
  const [showDropdown, setShowDropdown] = useState(false);

  // If no site is selected, show the sites listing
  if (!selectedSite) {
    return <SitesComponent />;
  }

  const handleSwitchSite = (site) => {
    setSelectedSite(site);
    setShowDropdown(false);
  };

  const renderSiteDropdownItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleSwitchSite(item)}
      className={`flex-row items-center p-3 ${
        selectedSite?.id === item.id ? 'bg-app-primary-light' : 'bg-app-background'
      }`}
    >
      <Image 
        source={{ uri: item.image }}
        className="w-10 h-10 rounded-lg mr-3"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-sm font-medium text-app-text-primary">
          {item.name}
        </Text>
        <Text className="text-xs text-app-text-secondary">
          {item.address}
        </Text>
      </View>
      {selectedSite?.id === item.id && (
        <View className="w-5 h-5 bg-app-primary rounded-full justify-center items-center">
          <Text className="text-white text-xs">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header with Site Dropdown */}
      <View className="px-4 pt-12 pb-4 border-b border-app-border">
        <View className="relative">
          <TouchableOpacity 
            onPress={() => setShowDropdown(!showDropdown)}
            className="flex-row items-center bg-app-surface border border-app-border rounded-lg p-3 mb-3"
          >
            <Image 
              source={{ uri: selectedSite.image }}
              className="w-8 h-8 rounded-lg mr-3"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-base font-semibold text-app-text-primary">
                {selectedSite.name}
              </Text>
              <Text className="text-xs text-app-text-secondary">
                {selectedSite.address}
              </Text>
            </View>
            <Text className={`text-lg text-app-accent ${showDropdown ? 'transform rotate-180' : ''}`}>
              ▼
            </Text>
          </TouchableOpacity>
          
          {showDropdown && (
            <View className="absolute top-full left-0 right-0 bg-app-background border border-app-border rounded-lg shadow-lg z-50 max-h-64">
              <FlatList
                data={availableSites}
                renderItem={renderSiteDropdownItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                className="rounded-lg"
              />
              
              <TouchableOpacity 
                onPress={() => {
                  setSelectedSite(null);
                  setShowDropdown(false);
                }}
                className="border-t border-app-divider p-3 bg-app-surface-variant"
              >
                <Text className="text-center text-app-accent font-medium">
                  {t('viewAllSites')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View className="flex-1">
        <ManageSiteComponent />
      </View>
    </View>
  );
}