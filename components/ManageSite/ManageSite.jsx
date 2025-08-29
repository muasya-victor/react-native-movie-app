import { useTranslation } from '@/hooks/useTranslation';
import { useSiteStore } from '@/store/siteStore';
import { useRouter } from 'expo-router';
import { ArrowRight } from "lucide-react-native";
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AddManagerModal from './AddManagerModal';
import translations from './translations.json';

export default function ManageSiteComponent() {
  const { selectedSite, setSelectedSite } = useSiteStore();
  const { t } = useTranslation(translations);
  const router = useRouter();
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);

  // Ensure the selected site is properly set in the store
  useEffect(() => {
    if (selectedSite) {
      console.log('Selected site in store:', selectedSite);
      // Site is already in the store, we can use it directly
    }
  }, [selectedSite]);

  const distributeFood = () => {
    console.log('touched');
    router.push('/place-order');
  };

  const handleManagerAdded = () => {
    // Refresh site data or refetch team members
    // You might want to call an API to get updated site data
    console.log('Manager added successfully, refreshing data...');
    
    // Optionally refresh the selected site data from API
    // const refreshedSite = await fetchSiteData(selectedSite.id);
    // setSelectedSite(refreshedSite);
    
    // For now, just close the modal
    // In a real app, you'd probably refetch the site data here
  };

  if (!selectedSite) {
    console.log('No selected site in store');
    return null;
  }

  const renderTeamMember = ({ item }) => (
    <View className="flex-row items-center py-3 px-4 border-b border-app-divider">
      <View className="w-10 h-10 bg-app-accent-light rounded-full justify-center items-center mr-3">
        <Text className="text-app-accent text-lg">👤</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-app-text-primary">
          {item.name}
        </Text>
        <Text className="text-sm text-app-text-secondary">
          {item.role}
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <ScrollView className="flex-1 bg-app-background" showsVerticalScrollIndicator={false}>
        {/* Financial Overview */}
        <View className="px-4 py-4">

          <TouchableOpacity 
            onPress={distributeFood}
            className="bg-app-primary rounded-lg py-5 px-4 mb-6 flex flex-row items-center gap-2 justify-center"
          >
            <Text className="text-white text-center font-medium">
              {t('lunchDistribution')}
            </Text>
            <ArrowRight size={16} color="white"/>
          </TouchableOpacity>

          <View className="bg-app-surface rounded-lg p-4 mb-3 border border-app-border">
            <Text className="text-lg font-semibold text-app-text-primary mb-3">
              {t('amountBorrowed')}
            </Text>
            <Text className="text-3xl font-bold text-app-text-primary">
              ${selectedSite.amountBorrowed?.toLocaleString() || '0'}
            </Text>
          </View>

          <View className="bg-app-surface rounded-lg p-4 mb-3 border border-app-border">
            <Text className="text-lg font-semibold text-app-text-primary mb-3">
              {t('revenueFromBorrowing')}
            </Text>
            <Text className="text-3xl font-bold text-app-primary">
              ${selectedSite.revenueFromBorrowing?.toLocaleString() || '0'} 
            </Text>
          </View>

          <View className="bg-app-surface rounded-lg p-4 mb-4 border border-app-border">
            <Text className="text-lg font-semibold text-app-text-primary mb-3">
              {t('revenueFromFood')}
            </Text>
            <Text className="text-3xl font-bold text-app-primary">
              ${selectedSite.revenueFromFood?.toLocaleString() || '0'}
            </Text>
          </View>

        </View>

        {/* Team Members */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-semibold text-app-text-primary mb-3">
            {t('teamMembers')}
          </Text>
          
          <View className="bg-app-surface rounded-lg border border-app-border mb-4">
            <FlatList
              data={selectedSite.teamMembers || []}
              renderItem={renderTeamMember}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="py-8 px-4">
                  <Text className="text-app-text-secondary text-center">
                    {t('noTeamMembers')}
                  </Text>
                </View>
              }
            />
          </View>
{/* 
          <View className='flex flex-row w-full items-center justify-between'>
            <TouchableOpacity className="bg-app-primary rounded-lg py-3 px-4 flex flex-row gap-2 items-center hidden">
              <Text className="text-white text-center font-medium">
                {t('addWorkers')}
              </Text>
              <Plus size={16} color="white"/>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => setShowAddManagerModal(true)}
              className="bg-app-primary rounded-lg py-4 px-4 flex justify-center flex-row gap-2 items-center w-full"
            >
              <Text className="text-white text-center font-medium w-fit">
                {t('addManager')}
              </Text>
              <Plus size={16} color="white"/>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>

      {/* Add Manager Modal */}
      <AddManagerModal
        visible={showAddManagerModal}
        onClose={() => setShowAddManagerModal(false)}
        siteId={selectedSite.id}
        onManagerAdded={handleManagerAdded}
      />
    </>
  );
}