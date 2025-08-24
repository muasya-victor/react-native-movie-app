// components/Settings/Settings.js
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import translations from './translations.json';

export default function SettingsComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  
  const [activeTab, setActiveTab] = useState('business');
  const [processingFees, setProcessingFees] = useState('10');
  const [loanLimit, setLoanLimit] = useState('10,000');
  const [expandedSite, setExpandedSite] = useState(null);

  // Sample sites data for management
  const managedSites = [
    {
      id: '1',
      name: 'Construction Site A',
      address: '123 Main St, Nairobi',
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center',
      type: 'Construction',
      workers: 25,
      status: 'Active',
      manager: 'John Mwangi'
    },
    {
      id: '2', 
      name: 'Renovation Project B',
      address: '456 Oak Ave, Mombasa',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=100&h=100&fit=crop&crop=center',
      type: 'Renovation',
      workers: 18,
      status: 'Active',
      manager: 'Grace Wanjiku'
    },
    {
      id: '3',
      name: 'Landscaping Job C', 
      address: '789 Pine Ln, Kisumu',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=100&h=100&fit=crop&crop=center',
      type: 'Landscaping',
      workers: 12,
      status: 'Inactive',
      manager: 'Peter Kamau'
    }
  ];

  const handleSaveBusinessSettings = () => {
    if (!processingFees.trim() || isNaN(parseFloat(processingFees))) {
      Alert.alert(t('error'), t('validFeesRequired'));
      return;
    }
    
    if (!loanLimit.trim() || isNaN(parseFloat(loanLimit.replace(/,/g, '')))) {
      Alert.alert(t('error'), t('validLimitRequired'));
      return;
    }

    Alert.alert(
      t('success'),
      t('settingsSaved'),
      [{ text: t('ok') }]
    );
  };

  const handleAddSite = () => {
    router.push('/add-site');
  };

  const handleEditSite = (site) => {
    router.push(`/edit-site?siteId=${site.id}&siteName=${encodeURIComponent(site.name)}`);
  };

  const handleDeleteSite = (site) => {
    Alert.alert(
      t('confirmDelete'),
      t('deleteSiteConfirmation', { siteName: site.name }),
      [
        { text: t('cancel'), style: 'cancel' },
        { 
          text: t('delete'), 
          style: 'destructive',
          onPress: () => {
            // Handle delete logic here
            Alert.alert(t('success'), t('siteDeleted'));
          }
        }
      ]
    );
  };

  const toggleSiteExpansion = (siteId) => {
    setExpandedSite(expandedSite === siteId ? null : siteId);
  };

  const renderSiteItem = ({ item }) => (
    <View className="bg-app-surface rounded-lg mb-3 shadow-sm">
      <TouchableOpacity 
        onPress={() => toggleSiteExpansion(item.id)}
        className="p-4"
      >
        <View className="flex-row items-center">
          <Image 
            source={{ uri: item.image }}
            className="w-12 h-12 rounded-lg mr-3"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-base font-medium text-app-text-primary">
              {item.name}
            </Text>
            <Text className="text-sm text-app-text-secondary mt-1">
              {item.address}
            </Text>
          </View>
          <View className="items-end">
            <View className={`px-2 py-1 rounded-full mb-1 ${
              item.status === 'Active' ? 'bg-app-primary-light' : 'bg-app-surface-variant'
            }`}>
              <Text className={`text-xs font-medium ${
                item.status === 'Active' ? 'text-app-primary' : 'text-app-text-tertiary'
              }`}>
                {t(item.status.toLowerCase())}
              </Text>
            </View>
            <Text className="text-app-text-tertiary text-lg">
              {expandedSite === item.id ? '▼' : '▶'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {expandedSite === item.id && (
        <View className="px-4 pb-4 border-t border-app-divider pt-4">
          <View className="mb-3">
            <Text className="text-sm text-app-text-secondary">
              {t('manager')}: {item.manager}
            </Text>
            <Text className="text-sm text-app-text-secondary">
              {t('workers')}: {item.workers}
            </Text>
            <Text className="text-sm text-app-text-secondary">
              {t('type')}: {item.type}
            </Text>
          </View>
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              onPress={() => handleEditSite(item)}
              className="bg-app-accent hover:bg-app-accent-dark py-2 px-4 rounded-lg flex-1 mr-1"
            >
              <Text className="text-white text-center font-medium">{t('edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteSite(item)}
              className="bg-app-danger hover:bg-app-danger-dark py-2 px-4 rounded-lg flex-1 ml-1"
            >
              <Text className="text-white text-center font-medium">{t('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-app-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {t('title')}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row px-4 pt-4 pb-2">
        <TouchableOpacity 
          onPress={() => setActiveTab('business')}
          className="flex-1 mr-2"
        >
          <View className={`pb-3 border-b-2 ${activeTab === 'business' ? 'border-app-primary' : 'border-transparent'}`}>
            <Text className={`text-sm font-medium text-center ${
              activeTab === 'business' ? 'text-app-primary' : 'text-app-text-secondary'
            }`}>
              {t('businessSettings')}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setActiveTab('sites')}
          className="flex-1 ml-2"
        >
          <View className={`pb-3 border-b-2 ${activeTab === 'sites' ? 'border-app-primary' : 'border-transparent'}`}>
            <Text className={`text-sm font-medium text-center ${
              activeTab === 'sites' ? 'text-app-primary' : 'text-app-text-secondary'
            }`}>
              {t('siteManagement')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'business' ? (
        <ScrollView 
          className="flex-1 px-4 pt-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Business Settings Section */}
          <Text className="text-xl font-semibold text-app-text-primary mb-6">
            {t('processingFeesLoanLimits')}
          </Text>

          {/* Processing Fees */}
          <View className="mb-6">
            <Text className="text-base font-medium text-app-text-primary mb-2">
              {t('processingFees')}
            </Text>
            <TextInput
              className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
              placeholder="10%"
              placeholderTextColor="#9E9E9E"
              value={processingFees}
              onChangeText={setProcessingFees}
              keyboardType="numeric"
            />
            <Text className="text-sm text-app-text-secondary mt-1">
              {t('processingFeesDescription')}
            </Text>
          </View>

          {/* Loan Limit */}
          <View className="mb-8">
            <Text className="text-base font-medium text-app-text-primary mb-2">
              {t('loanLimit')}
            </Text>
            <TextInput
              className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-base text-app-text-primary"
              placeholder="10,000"
              placeholderTextColor="#9E9E9E"
              value={loanLimit}
              onChangeText={setLoanLimit}
              keyboardType="numeric"
            />
            <Text className="text-sm text-app-text-secondary mt-1">
              {t('loanLimitDescription')}
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            onPress={handleSaveBusinessSettings}
            className="bg-app-primary hover:bg-app-primary-dark py-4 px-6 rounded-lg mb-6"
          >
            <Text className="text-white text-center font-medium text-lg">
              {t('saveChanges')}
            </Text>
          </TouchableOpacity>

          {/* Additional Business Settings */}
          <View className="bg-app-surface rounded-lg p-4 mb-6">
            <Text className="text-lg font-semibold text-app-text-primary mb-4">
              {t('additionalSettings')}
            </Text>
            
            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-app-divider">
              <Text className="text-base text-app-text-primary">{t('notifications')}</Text>
              <Text className="text-app-accent">→</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-app-divider">
              <Text className="text-base text-app-text-primary">{t('language')}</Text>
              <Text className="text-app-text-secondary">{currentLanguage === 'en' ? 'English' : 'Kiswahili'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <Text className="text-base text-app-text-primary">{t('backup')}</Text>
              <Text className="text-app-accent">→</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 px-4 pt-4">
          {/* Add Site Button */}
          <TouchableOpacity
            onPress={handleAddSite}
            className="bg-app-primary hover:bg-app-primary-dark py-3 rounded-lg mb-4 flex-row items-center justify-center"
          >
            <Text className="text-white text-lg mr-2">+</Text>
            <Text className="text-white font-medium">{t('addSite')}</Text>
          </TouchableOpacity>

          {/* Sites List */}
          <Text className="text-lg font-semibold text-app-text-primary mb-4">
            {t('manageSites')}
          </Text>

          <FlatList
            data={managedSites}
            renderItem={renderSiteItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <Text className="text-app-text-secondary text-base text-center">
                  {t('noSitesToManage')}
                </Text>
                <TouchableOpacity 
                  onPress={handleAddSite}
                  className="bg-app-primary px-6 py-3 rounded-lg mt-4"
                >
                  <Text className="text-white font-medium">{t('addFirstSite')}</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}