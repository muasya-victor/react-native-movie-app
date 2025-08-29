import { apiRequest } from '@/services/api';
import React, { useEffect } from "react";
import { Text, View } from "react-native";

export default function WalletDataLogger() {
  // Function to fetch wallet data
  const fetchWalletData = async () => {
    try {
      console.log('=== FETCHING WALLET DATA ===');
      const response = await apiRequest('GET', '/wallets/my-wallet/');
      console.log('Full Response:', response.data);   
    } catch (error) {
      throw new Error(`Failed to fetch wallet data: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4">Wallet Data Logger</Text>
      
      <Text className="text-gray-500 text-sm mt-4">
        Check the console/logs to see the detailed wallet data structure
      </Text>
    </View>
  );
}