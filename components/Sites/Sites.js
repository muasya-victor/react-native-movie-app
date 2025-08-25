// components/Sites/Sites.js
import { apiRequest } from '@/services/api';
import { useSiteStore } from '@/store/siteStore';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// Define translations directly in component
const translations = {
  mySites: "My Sites",
  selectSiteToManage: "Select a site to manage",
  searchSites: "Search sites...",
  noSitesFound: "No sites found",
  workers: "workers",
  managers: "managers", 
  select: "Select",
  active: "Active",
  inactive: "Inactive",
  loading: "Loading sites...",
  error: "Error loading sites",
  retry: "Retry",
  pullToRefresh: "Pull to refresh",
  loadingMore: "Loading more sites..."
};

export default function SitesComponent() {
  const router = useRouter();
  const { setSelectedSite } = useSiteStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });

  // Simple translation function
  const t = (key) => translations[key] || key;

  const fetchSites = async (page = 1, search = '', isRefresh = false, isLoadMore = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (isLoadMore) setLoadingMore(true);
      else if (page === 1) setLoading(true);

      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (page > 1) params.append('page', page.toString());
      if (search.trim()) params.append('search', search.trim());

      const endpoint = `/sites${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log('Fetching sites from:', endpoint);
      
      const response = await apiRequest('GET', endpoint);
      
      if (response.success) {
        const { count, next, previous, results } = response.data;
        
        console.log('✅ Sites fetched successfully:', {
          count,
          resultsLength: results.length,
          currentPage: page
        });

        setPagination({
          count,
          next,
          previous,
          currentPage: page
        });

        if (isRefresh || page === 1) {
          setSites(results);
        } else {
          // Append for pagination
          setSites(prevSites => [...prevSites, ...results]);
        }
      } else {
        console.error('❌ Failed to fetch sites:', response.error);
        setError(response.error?.message || 'Failed to load sites');
      }
    } catch (error) {
      console.error('❌ Network error fetching sites:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSites(1, searchQuery);
  }, []);

  // Search debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchSites(1, searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleRefresh = useCallback(() => {
    fetchSites(1, searchQuery, true);
  }, [searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (pagination.next && !loadingMore) {
      fetchSites(pagination.currentPage + 1, searchQuery, false, true);
    }
  }, [pagination.next, pagination.currentPage, searchQuery, loadingMore]);

  const fetchSiteDetails = async (siteId) => {
    try {
      console.log(`Fetching detailed information for site ID: ${siteId}`);
      
      const response = await apiRequest('GET', `/sites/${siteId}`);
      
      if (response.success) {
        const siteDetails = response.data;
        
        console.log('=== DETAILED SITE INFORMATION ===');
        console.log('Site ID:', siteDetails.id);
        console.log('Name:', siteDetails.name);
        console.log('Location:', siteDetails.location);
        console.log('Auto Execute Accruals:', siteDetails.auto_execute_accruals);
        console.log('Daily Wage Rate:', siteDetails.daily_wage_rate);
        console.log('Created At:', siteDetails.created_at);
        console.log('Members Count:', siteDetails.members?.length || 0);
        console.log('Managers Count:', siteDetails.managers?.length || 0);
        
        console.log('\n--- MEMBERS ---');
        siteDetails.members?.forEach((member, index) => {
          console.log(`Member ${index + 1}:`, {
            id: member.id,
            email: member.user.email,
            name: `${member.user.first_name} ${member.user.last_name}`,
            staffNumber: member.user.staff_number,
            siteId: member.site
          });
        });
        
        console.log('\n--- MANAGERS ---');
        siteDetails.managers?.forEach((manager, index) => {
          console.log(`Manager ${index + 1}:`, {
            id: manager.id,
            email: manager.user.email,
            name: `${manager.user.first_name} ${manager.user.last_name}`,
            staffNumber: manager.user.staff_number,
            siteId: manager.site
          });
        });
        
        console.log('\nComplete Site Object:', JSON.stringify(siteDetails, null, 2));
        console.log('==================================');
        
        // Store the detailed site information
        setSelectedSite(siteDetails);
        
        Alert.alert(
          'Site Selected',
          `${siteDetails.name} loaded with ${siteDetails.members?.length || 0} members and ${siteDetails.managers?.length || 0} managers`,
          [{ text: 'OK' }]
        );
        
        return siteDetails;
      } else {
        console.error('Failed to fetch site details:', response.error);
        Alert.alert(
          'Error',
          `Failed to load site details: ${response.error?.message || 'Unknown error'}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Network error fetching site details:', error);
      Alert.alert(
        'Network Error',
        'Unable to load site details. Please check your connection.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSelectSite = async (site) => {
    console.log('Site selected from list:', site.name);
    await fetchSiteDetails(site.id);
  };

  const renderSiteCard = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleSelectSite(item)}
      className="bg-app-surface rounded-lg p-4 mb-4 mx-4 shadow-sm border border-app-border"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-app-text-primary mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-app-text-secondary mb-2">
            📍 {item.location}
          </Text>
          <View className="flex-row items-center mb-2">
            <View className="bg-app-primary-light px-2 py-1 rounded-full mr-2">
              <Text className="text-app-primary text-xs font-medium">
                KES {item.daily_wage_rate}/day
              </Text>
            </View>
          </View>
        </View>
        <View className="bg-app-primary rounded-full px-3 py-1">
          <Text className="text-white text-xs font-medium">
            {t('select')}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center justify-between pt-3 border-t border-app-divider">
        <View className="flex-row items-center">
          <Text className="text-sm text-app-text-secondary mr-4">
            👷 {item.members_count} {t('workers')}
          </Text>
          <Text className="text-sm text-app-text-secondary">
            👨‍💼 {item.managers_count} {t('managers')}
          </Text>
        </View>
        <Text className="text-xs text-app-text-tertiary">
          ID: {item.id}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text className="text-app-text-secondary text-sm mt-2">
          {t('loadingMore')}
        </Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-app-text-tertiary text-4xl mb-4">🏗️</Text>
        <Text className="text-app-text-secondary text-center text-lg mb-2">
          {t('noSitesFound')}
        </Text>
        {searchQuery.length > 0 && (
          <Text className="text-app-text-tertiary text-center text-sm">
            Try adjusting your search terms
          </Text>
        )}
      </View>
    );
  };

  if (loading && sites.length === 0) {
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

        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-app-text-secondary mt-4">{t('loading')}</Text>
        </View>
      </View>
    );
  }

  if (error && sites.length === 0) {
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

        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-tertiary text-4xl mb-4">⚠️</Text>
          <Text className="text-app-text-primary text-lg font-semibold mb-2 text-center">
            {t('error')}
          </Text>
          <Text className="text-app-text-secondary text-center mb-6">
            {error}
          </Text>
          <TouchableOpacity 
            className="bg-app-primary px-6 py-3 rounded-lg"
            onPress={() => fetchSites(1, searchQuery)}
          >
            <Text className="text-white font-medium">{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 border-b border-app-border">
        <Text className="text-2xl font-bold text-app-text-primary mb-2">
          {t('mySites')}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-app-text-secondary">
            {t('selectSiteToManage')}
          </Text>
          <Text className="text-xs text-app-text-tertiary">
            {pagination.count} total sites
          </Text>
        </View>
      </View>

      {/* Search Bar */}
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

      {/* Sites List */}
      <FlatList
        data={sites}
        renderItem={renderSiteCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}