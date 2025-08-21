import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import translations from './translations.json';

export default function WorkersComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);

  // Mock data - replace with actual data source
  const workers = [
    {
      id: 1,
      name: "Ethan Carter",
      status: "Active",
      avatar: require("../../assets/images/otp.png") // Replace with actual avatar paths
    },
    {
      id: 2,
      name: "Liam Harper",
      status: "Active",
      avatar: require("../../assets/images/otp.png")
    },
    {
      id: 3,
      name: "Noah Bennett",
      status: "Active",
      avatar: require("../../assets/images/otp.png")
    },
    {
      id: 4,
      name: "Oliver Hayes",
      status: "Active",
      avatar: require("../../assets/images/otp.png")
    },
    {
      id: 5,
      name: "Elijah Foster",
      status: "Active",
      avatar: require("../../assets/images/otp.png")
    },
    {
      id: 6,
      name: "Lucas Reed",
      status: "Active",
      avatar: require("../../assets/images/otp.png")
    },
    {
      id: 7,
      name: "Mason Coleman",
      status: "Active",
      avatar: require("../../assets/images/otp.png")
    },
    {
      id: 8,
      name: "Logan Brooks",
      status: "Active",
      avatar: require("../../assets/images/otp.png")
    }
  ];

  const renderWorkerItem = ({ item }) => (
    <TouchableOpacity 
      className="flex-row items-center justify-between py-4 px-4 border-b border-app-divider"
      onPress={() => {
        // Navigate to worker details
        router.push(`/worker/${item.id}`);
      }}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 rounded-full mr-4 overflow-hidden">
          <Image 
            source={item.avatar} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-app-text-primary">
            {item.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <View className="px-2 py-1 bg-app-primary-light rounded-full">
              <Text className="text-app-primary text-xs font-medium">
                {t('active')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleAddWorker = () => {
    router.push('/add-worker');
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

      {/* All Workers Section */}
      <View className="flex-1">
        <View className="px-4 py-3 bg-app-surface">
          <Text className="text-base font-semibold text-app-text-primary">
            {t('allWorkers')}
          </Text>
        </View>

        {/* Workers List */}
        <FlatList
          data={workers}
          renderItem={renderWorkerItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      {/* Add Worker Button */}
      <View className="absolute bottom-8 left-4 right-4">
        <TouchableOpacity 
          className="bg-app-primary hover:bg-app-primary-dark text-white font-medium py-3 px-6 rounded-lg flex-row items-center justify-center"
          onPress={handleAddWorker}
        >
          <Text className="text-white text-lg font-bold mr-2">+</Text>
          <Text className="text-white text-center font-medium">
            {t('addWorker')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}