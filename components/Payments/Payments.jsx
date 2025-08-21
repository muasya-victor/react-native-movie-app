import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import translations from './translations.json';

export default function PaymentsComponent() {
  const router = useRouter();
  const { userType, isSiteManager, isSystemAdmin } = useAuth();
  const { t } = useTranslation(translations);
  const [activeTab, setActiveTab] = useState('reports');

  // Mock data - replace with actual API calls
  const dashboardData = {
    dailyWagesOwed: {
      amount: 1200,
      workerCount: 12
    },
    remitToMyPay: {
      amount: 5000,
      vendorCount: 4
    }
  };

  const handleDisbursePayments = () => {
    router.push('/disburse-payments');
  };

  const handlePayMyPay = () => {
    router.push('/pay-mypay');
  };

  const tabs = [
    { id: 'reports', label: t('reports') },
    { id: 'workers', label: t('workers') }
  ];

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-app-text-primary">
          MyPay
        </Text>
        <View className="w-8" />
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-app-background px-4 border-b border-app-divider">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`mr-8 pb-3 ${
              activeTab === tab.id ? 'border-b-2 border-app-primary' : ''
            }`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text className={`font-medium ${
              activeTab === tab.id 
                ? 'text-app-primary' 
                : 'text-app-text-tertiary'
            }`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        {/* Daily Wages Owed Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-app-text-primary mb-4">
            {t('dailyWagesOwed')}
          </Text>
          
          <View className="bg-app-surface rounded-lg p-6 mb-4">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-app-surface-variant rounded-lg justify-center items-center mr-4">
                <Text className="text-2xl text-app-text-primary">$</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-app-text-primary">
                  ${dashboardData.dailyWagesOwed.amount.toLocaleString()}
                </Text>
                <Text className="text-sm text-app-text-secondary">
                  {dashboardData.dailyWagesOwed.workerCount} {t('workers')}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              className="bg-app-primary rounded-lg py-4"
              onPress={handleDisbursePayments}
            >
              <Text className="text-white text-center font-semibold text-base">
                {t('disbursePayments')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amount to Remit Section */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-app-text-primary mb-4">
            {t('amountToRemit')}
          </Text>
          
          <View className="bg-app-surface rounded-lg p-6 mb-4">
            <View className="flex-row items-center mb-6">
              <View className="w-12 h-12 bg-app-accent-light rounded-lg justify-center items-center mr-4">
                <Text className="text-2xl text-app-accent">$</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-app-text-primary">
                  ${dashboardData.remitToMyPay.amount.toLocaleString()}
                </Text>
                <Text className="text-sm text-app-text-secondary">
                  {dashboardData.remitToMyPay.vendorCount} {t('vendors')}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              className="bg-app-primary rounded-lg py-4"
              onPress={handlePayMyPay}
            >
              <Text className="text-white text-center font-semibold text-base">
                {t('pay')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}