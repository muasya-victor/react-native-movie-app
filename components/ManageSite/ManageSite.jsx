// components/ManageSite/ManageSite.js
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import translations from './translations.json';

export default function ManageSiteComponent() {
  const router = useRouter();
  const { siteName } = useLocalSearchParams();
  const { t, currentLanguage } = useTranslation(translations);
  
  const [activeTab, setActiveTab] = useState('reports');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for site reports
  const siteReports = [
    {
      id: 1,
      title: 'Amount Borrowed',
      amount: 1200,
      workers: 12,
      icon: '$',
      type: 'borrowed'
    },
    {
      id: 2,
      title: 'Revenue From Borrowing',
      amount: 1200,
      workers: 12,
      icon: '$',
      type: 'revenue_borrowing'
    },
    {
      id: 3,
      title: 'Revenue From Food',
      amount: 1200,
      workers: 12,
      icon: '$',
      type: 'revenue_food'
    }
  ];

  // Sample data for workers (from old component)
  const workers = [
    {
      id: 1,
      name: 'John Mwangi',
      phone: '+254 712 345 678',
      totalBorrowed: 2500,
      totalFood: 850,
      status: 'Active',
      lastActivity: '2 hours ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Grace Wanjiku',
      phone: '+254 723 456 789',
      totalBorrowed: 1800,
      totalFood: 620,
      status: 'Active',
      lastActivity: '5 hours ago',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Peter Kamau',
      phone: '+254 734 567 890',
      totalBorrowed: 3200,
      totalFood: 1100,
      status: 'Inactive',
      lastActivity: '2 days ago',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Mary Njeri',
      phone: '+254 745 678 901',
      totalBorrowed: 950,
      totalFood: 340,
      status: 'Active',
      lastActivity: '1 hour ago',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612e742?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Ethan Carter',
      phone: '+254 756 789 012',
      totalBorrowed: 1500,
      totalFood: 480,
      status: 'Active',
      lastActivity: '30 minutes ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  ];

  const handleWorkerPress = (worker) => {
    if (activeTab === 'workers') {
      // Navigate to worker details (analytics view)
      router.push(`/worker-details?workerId=${worker.id}&workerName=${encodeURIComponent(worker.name)}`);
    } else if (activeTab === 'placeOrder') {
      // Navigate to place order (from old component functionality)
      router.push({
        pathname: '/place-order',
        params: { 
          workerId: worker.id, 
          workerName: worker.name,
          siteName: siteName || 'Current Site'
        }
      });
    }
  };

  // Filter workers for search functionality
  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderReportItem = ({ item }) => (
    <View className="bg-app-surface rounded-lg p-4 mb-4 shadow-sm">
      <Text className="text-lg font-semibold text-app-text-primary mb-2">
        {t(item.type)}
      </Text>
      
      <View className="flex-row items-center">
        <View className="w-12 h-12 bg-app-primary-light rounded-full justify-center items-center mr-4">
          <Text className="text-app-primary text-xl font-bold">
            {item.icon}
          </Text>
        </View>
        
        <View>
          <Text className="text-2xl font-bold text-app-text-primary">
            ${item.amount.toLocaleString()}
          </Text>
          <Text className="text-sm text-app-text-secondary mt-1">
            {item.workers} {t('workers')}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderWorkerItem = ({ item, index }) => {
    const isFeatured = activeTab === 'placeOrder' && index === 0;
    
    if (activeTab === 'placeOrder') {
      // Render for place order tab (from old component)
      return (
        <TouchableOpacity 
          className={`mx-4 my-2 rounded-lg shadow-sm ${isFeatured ? 'bg-app-primary-light' : 'bg-app-surface'}`}
          onPress={() => handleWorkerPress(item)}
        >
          <View className="px-4 py-4 flex-row items-center">
            <Image 
              source={{ uri: item.avatar }}
              className="w-16 h-16 rounded-full mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-lg font-semibold text-app-text-primary mb-1">
                {item.name}
              </Text>
              <Text className="text-sm text-app-primary font-medium">
                {t(item.status.toLowerCase())} 
              </Text>
            </View>
          </View>
          
          {isFeatured && (
            <View className="px-4 pb-4">
              <TouchableOpacity 
                onPress={() => handleWorkerPress(item)}
                className="bg-app-primary hover:bg-app-primary-dark py-4 rounded-lg"
              >
                <Text className="text-white text-center text-lg font-medium">
                  {t('placeOrder')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      );
    } else {
      // Render for worker reports tab (analytics view)
      return (
        <TouchableOpacity 
          onPress={() => handleWorkerPress(item)}
          className="bg-app-surface rounded-lg p-4 mb-3 shadow-sm"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Image 
                source={{ uri: item.avatar }}
                className="w-12 h-12 rounded-full mr-4"
                resizeMode="cover"
              />
              
              <View className="flex-1">
                <Text className="text-base font-medium text-app-text-primary">
                  {item.name}
                </Text>
                {/* <Text className="text-sm text-app-text-secondary mt-1">
                  {item.phone}
                </Text> */}
              </View>
            </View>
            
            <View className="items-end">
              <View className={`px-2 py-1 rounded-full mb-2 ${
                item.status === 'Active' ? 'bg-app-primary-light' : 'bg-app-surface-variant'
              }`}>
                <Text className={`text-xs font-medium ${
                  item.status === 'Active' ? 'text-app-primary' : 'text-app-text-tertiary'
                }`}>
                  {t(item.status.toLowerCase())}
                </Text>
              </View>

            </View>
          </View>
          
          <View className="mt-3 pt-3 border-t border-app-divider flex-row justify-between">
            <Text className="text-sm font-medium text-app-text-primary">
              {t('totalBorrowed')}: ${item.totalBorrowed.toLocaleString()}
            </Text>
            <Text className="text-sm font-medium text-app-text-primary">
              {t('foodSpent')}: ${item.totalFood.toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  return (
    <View className="flex-1 bg-app-background">
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
          onPress={() => setActiveTab('reports')}
          className="flex-1 mr-1"
        >
          <View className={`pb-3 border-b-2 ${activeTab === 'reports' ? 'border-app-primary' : 'border-transparent'}`}>
            <Text className={`text-sm font-medium text-center ${
              activeTab === 'reports' ? 'text-app-primary' : 'text-app-text-secondary'
            }`}>
              {t('siteReports')}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setActiveTab('workers')}
          className="flex-1 mx-1"
        >
          <View className={`pb-3 border-b-2 ${activeTab === 'workers' ? 'border-app-primary' : 'border-transparent'}`}>
            <Text className={`text-sm font-medium text-center ${
              activeTab === 'workers' ? 'text-app-primary' : 'text-app-text-secondary'
            }`}>
              {t('workerReports')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('placeOrder')}
          className="flex-1 ml-1"
        >
          <View className={`pb-3 border-b-2 ${activeTab === 'placeOrder' ? 'border-app-primary' : 'border-transparent'}`}>
            <Text className={`text-sm font-medium text-center ${
              activeTab === 'placeOrder' ? 'text-app-primary' : 'text-app-text-secondary'
            }`}>
              {t('placeOrder')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar - Only show for workers and place order tabs */}
      {(activeTab === 'workers' || activeTab === 'placeOrder') && (
        <View className="px-4 py-4 bg-app-accent-light">
          <TextInput
            className="bg-white px-4 py-3 rounded-lg border border-app-border text-app-text-primary"
            placeholder={t('searchWorkers')}
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {/* Content */}
      <View className="flex-1 px-4 pt-4">
        {activeTab === 'reports' ? (
          <FlatList
            data={siteReports}
            renderItem={renderReportItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <FlatList
            data={filteredWorkers}
            renderItem={renderWorkerItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingBottom: activeTab === 'placeOrder' ? 100 : 20,
              paddingTop: activeTab === 'placeOrder' ? 8 : 0
            }}
          />
        )}
      </View>
    </View>
  );
}