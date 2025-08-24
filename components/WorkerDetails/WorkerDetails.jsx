// components/WorkerDetails/WorkerDetails.js
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from '@/hooks/useTranslation';
import translations from './translations.json';

export default function WorkerDetailsComponent() {
  const router = useRouter();
  const { workerId, workerName } = useLocalSearchParams();
  const { t, currentLanguage } = useTranslation(translations);
  
  const [activeTab, setActiveTab] = useState('borrowing');

  // Sample borrowing history data
  const borrowingHistory = [
    {
      id: 1,
      requestedAmount: 1000,
      receivedAmount: 900,
      profit: 100,
      date: '2024-01-15',
      status: 'Completed',
      dueDate: '2024-01-30'
    },
    {
      id: 2,
      requestedAmount: 800,
      receivedAmount: 720,
      profit: 80,
      date: '2024-01-10',
      status: 'Completed',
      dueDate: '2024-01-25'
    },
    {
      id: 3,
      requestedAmount: 1200,
      receivedAmount: 1080,
      profit: 120,
      date: '2024-01-05',
      status: 'Pending',
      dueDate: '2024-01-20'
    }
  ];

  // Sample food consumption history
  const foodHistory = [
    {
      id: 1,
      item: 'Chapati & Beans',
      amount: 80,
      date: '2024-01-14',
      time: '12:30 PM',
      category: 'Lunch'
    },
    {
      id: 2,
      item: 'Ugali & Sukuma',
      amount: 60,
      date: '2024-01-14',
      time: '7:30 PM',
      category: 'Dinner'
    },
    {
      id: 3,
      item: 'Tea & Bread',
      amount: 25,
      date: '2024-01-14',
      time: '6:00 AM',
      category: 'Breakfast'
    },
    {
      id: 4,
      item: 'Rice & Chicken',
      amount: 120,
      date: '2024-01-13',
      time: '1:00 PM',
      category: 'Lunch'
    },
    {
      id: 5,
      item: 'Chapati & Stew',
      amount: 90,
      date: '2024-01-13',
      time: '8:00 PM',
      category: 'Dinner'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleTransactionPress = (transaction) => {
    router.push(`/transaction-details?transactionId=${transaction.id}&type=borrowing`);
  };

  const handleFoodPress = (foodItem) => {
    router.push(`/transaction-details?transactionId=${foodItem.id}&type=food`);
  };

  const renderBorrowingItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleTransactionPress(item)}
      className="bg-app-surface rounded-lg p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
          <Text className="text-base font-medium text-app-text-primary">
            {t('requested')}: KES {item.requestedAmount.toLocaleString()}
          </Text>
          <Text className="text-lg font-bold text-app-primary mt-1">
            {t('received')}: KES {item.receivedAmount.toLocaleString()}
          </Text>
        </View>
        
        <View className="items-end">
          <View className={`px-3 py-1 rounded-full ${
            item.status === 'Completed' ? 'bg-app-primary-light' : 'bg-app-surface-variant'
          }`}>
            <Text className={`text-xs font-medium ${
              item.status === 'Completed' ? 'text-app-primary' : 'text-app-text-tertiary'
            }`}>
              {t(item.status.toLowerCase())}
            </Text>
          </View>
        </View>
      </View>
      
      <View className="flex-row justify-between items-center pt-3 border-t border-app-divider">
        <View>
          <Text className="text-sm text-app-text-secondary">
            {t('profit')}: KES {item.profit}
          </Text>
          <Text className="text-xs text-app-text-tertiary mt-1">
            {formatDate(item.date)}
          </Text>
        </View>
        
        <View className="items-end">
          <Text className="text-sm text-app-text-secondary">
            {t('dueDate')}: {formatDate(item.dueDate)}
          </Text>
          <Text className="text-xs text-app-accent mt-1">
            {t('tapForDetails')} →
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleFoodPress(item)}
      className="bg-app-surface rounded-lg p-4 mb-3 shadow-sm"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 bg-app-danger-light rounded-full justify-center items-center mr-3">
            <Text className="text-app-danger text-lg">🍽️</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-medium text-app-text-primary">
              {item.item}
            </Text>
            <Text className="text-sm text-app-text-secondary mt-1">
              {item.category} • {item.time}
            </Text>
            <Text className="text-xs text-app-text-tertiary mt-1">
              {formatDate(item.date)}
            </Text>
          </View>
        </View>
        
        <View className="items-end">
          <Text className="text-lg font-bold text-app-danger">
            KES {item.amount}
          </Text>
          <Text className="text-xs text-app-accent mt-1">
            {t('tapForDetails')} →
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Calculate totals
  const totalBorrowed = borrowingHistory.reduce((sum, item) => sum + item.receivedAmount, 0);
  const totalProfit = borrowingHistory.reduce((sum, item) => sum + item.profit, 0);
  const totalFood = foodHistory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {decodeURIComponent(workerName || 'Worker Details')}
        </Text>
      </View>

      {/* Summary Cards */}
      <View className="px-4 pt-4 pb-2">
        <View className="flex-row justify-between mb-4">
          <View className="bg-app-primary-light rounded-lg p-3 flex-1 mr-2">
            <Text className="text-sm text-app-primary font-medium">
              {t('totalBorrowed')}
            </Text>
            <Text className="text-xl font-bold text-app-primary mt-1">
              KES {totalBorrowed.toLocaleString()}
            </Text>
          </View>
          
          <View className="bg-app-accent-light rounded-lg p-3 flex-1 mx-1">
            <Text className="text-sm text-app-accent font-medium">
              {t('ourProfit')}
            </Text>
            <Text className="text-xl font-bold text-app-accent mt-1">
              KES {totalProfit.toLocaleString()}
            </Text>
          </View>
          
          <View className="bg-app-danger-light rounded-lg p-3 flex-1 ml-2">
            <Text className="text-sm text-app-danger font-medium">
              {t('foodSpent')}
            </Text>
            <Text className="text-xl font-bold text-app-danger mt-1">
              KES {totalFood.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row px-4 pb-2">
        <TouchableOpacity 
          onPress={() => setActiveTab('borrowing')}
          className="flex-1 mr-2"
        >
          <View className={`pb-3 border-b-2 ${activeTab === 'borrowing' ? 'border-app-primary' : 'border-transparent'}`}>
            <Text className={`text-base font-medium text-center ${
              activeTab === 'borrowing' ? 'text-app-primary' : 'text-app-text-secondary'
            }`}>
              {t('borrowingHistory')}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setActiveTab('food')}
          className="flex-1 ml-2"
        >
          <View className={`pb-3 border-b-2 ${activeTab === 'food' ? 'border-app-primary' : 'border-transparent'}`}>
            <Text className={`text-base font-medium text-center ${
              activeTab === 'food' ? 'text-app-primary' : 'text-app-text-secondary'
            }`}>
              {t('foodHistory')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 pt-2">
        {activeTab === 'borrowing' ? (
          <FlatList
            data={borrowingHistory}
            renderItem={renderBorrowingItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <FlatList
            data={foodHistory}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
}