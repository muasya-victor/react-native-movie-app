import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import translations from './translations.json';

export default function WorkerDetailComponent() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { userType, isSiteManager, isSystemAdmin } = useAuth();
  const { t } = useTranslation(translations);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock worker data - replace with actual API call using the id
  const worker = {
    id: parseInt(id),
    name: "Ethan Carter",
    role: "Construction Worker",
    department: "Site Construction",
    phone: "+254 712 345 678",
    employeeId: "EMP001",
    joinDate: "2023-03-15",
    status: "Active",
    avatar: require("@/assets/images/otp.png"),
    totalEarnings: "KSh 145,500",
    thisMonthEarnings: "KSh 22,400",
    hoursWorked: 168,
    attendance: 95,
    skills: ["Concrete Work", "Steel Fixing", "Safety Protocols"],
    emergencyContact: {
      name: "Sarah Carter",
      relationship: "Spouse",
      phone: "+254 701 234 567"
    },
    recentActivity: [
      {
        id: 1,
        date: "2024-08-20",
        activity: "Clocked in",
        time: "07:30 AM",
        location: "Site A - Foundation"
      },
      {
        id: 2,
        date: "2024-08-19",
        activity: "Payment received",
        amount: "KSh 3,200",
        time: "06:15 PM"
      },
      {
        id: 3,
        date: "2024-08-19",
        activity: "Clocked out",
        time: "05:30 PM",
        location: "Site A - Foundation"
      },
      {
        id: 4,
        date: "2024-08-18",
        activity: "Safety training completed",
        time: "02:00 PM",
        certificate: "ST-2024-045"
      }
    ]
  };

  const tabs = [
    { id: 'overview', label: t('overview') },
    { id: 'payments', label: t('payments') }
  ];

  const handleEditWorker = () => {
    router.push(`/worker/${id}/edit`);
  };


  const handleDeactivateWorker = () => {
    Alert.alert(
      t('deactivateWorker'),
      t('deactivateWorkerPrompt'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('deactivate'), style: 'destructive', onPress: () => {} }
      ]
    );
  };

  const renderOverviewTab = () => (
    <View className="p-4 space-y-6">
      {/* Personal Information */}
      <View className="bg-app-surface rounded-lg p-4">
        <Text className="text-lg font-semibold text-app-text-primary mb-4">
          {t('personalInformation')}
        </Text>
        
        <View className="space-y-3">
          <View className="flex-row justify-between">
            <Text className="text-app-text-secondary">{t('employeeId')}</Text>
            <Text className="text-app-text-primary font-medium">{worker.employeeId}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-app-text-secondary">{t('department')}</Text>
            <Text className="text-app-text-primary font-medium">{worker.department}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-app-text-secondary">{t('joinDate')}</Text>
            <Text className="text-app-text-primary font-medium">{worker.joinDate}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-app-text-secondary">{t('phone')}</Text>
            <Text className="text-app-text-primary font-medium">{worker.phone}</Text>
          </View>
        </View>
      </View>



      {/* Skills */}
      <View className="bg-app-surface rounded-lg p-4">
        <Text className="text-lg font-semibold text-app-text-primary mb-4">
          {t('skills')}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {worker.skills.map((skill, index) => (
            <View key={index} className="bg-app-primary-light px-3 py-2 rounded-full">
              <Text className="text-app-primary text-sm font-medium">{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Emergency Contact */}
      <View className="bg-app-surface rounded-lg p-4">
        <Text className="text-lg font-semibold text-app-text-primary mb-4">
          {t('emergencyContact')}
        </Text>
        
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-app-text-secondary">{t('name')}</Text>
            <Text className="text-app-text-primary font-medium">{worker.emergencyContact.name}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-app-text-secondary">{t('relationship')}</Text>
            <Text className="text-app-text-primary font-medium">{worker.emergencyContact.relationship}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-app-text-secondary">{t('phone')}</Text>
            <Text className="text-app-text-primary font-medium">{worker.emergencyContact.phone}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderActivityTab = () => (
    <View className="p-4">
      <Text className="text-lg font-semibold text-app-text-primary mb-4">
        {t('recentActivity')}
      </Text>
      
      {worker.recentActivity.map((activity) => (
        <View key={activity.id} className="bg-app-surface rounded-lg p-4 mb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-base font-medium text-app-text-primary">
                {activity.activity}
              </Text>
              {activity.location && (
                <Text className="text-sm text-app-text-secondary mt-1">
                  📍 {activity.location}
                </Text>
              )}
              {activity.amount && (
                <Text className="text-sm text-app-primary mt-1 font-medium">
                  💰 {activity.amount}
                </Text>
              )}
              {activity.certificate && (
                <Text className="text-sm text-app-accent mt-1">
                  🏆 {t('certificate')}: {activity.certificate}
                </Text>
              )}
            </View>
            <View className="items-end">
              <Text className="text-xs text-app-text-tertiary">{activity.date}</Text>
              <Text className="text-xs text-app-text-secondary">{activity.time}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPaymentsTab = () => (
    <View className="p-4">
      {/* Earnings Summary */}
      <View className="bg-app-surface rounded-lg p-4 mb-6">
        <Text className="text-lg font-semibold text-app-text-primary mb-4">
          {t('earningsSummary')}
        </Text>
        
        <View className="space-y-4">
          <View className="flex-row justify-between items-center">
            <Text className="text-app-text-secondary">{t('totalEarnings')}</Text>
            <Text className="text-2xl font-bold text-app-text-primary">{worker.totalEarnings}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-app-text-secondary">{t('thisMonth')}</Text>
            <Text className="text-lg font-semibold text-app-primary">{worker.thisMonthEarnings}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row gap-4 mb-6">
        <TouchableOpacity className="flex-1 bg-app-primary rounded-lg p-3">
          <Text className="text-white text-center font-medium">{t('sendPayment')}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-app-surface border border-app-border rounded-lg p-3">
          <Text className="text-app-text-primary text-center font-medium">{t('viewHistory')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {t('workerDetails')}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Worker Profile Header */}
        <View className="bg-app-surface p-6 border-b border-app-divider">
          <View className="flex-row items-center mb-4">
            <View className="w-20 h-20 rounded-full mr-4 overflow-hidden">
              <Image 
                source={worker.avatar} 
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-app-text-primary">
                {worker.name}
              </Text>
              <Text className="text-base text-app-text-secondary mt-1">
                {worker.role}
              </Text>
              <View className="flex-row items-center mt-2">
                <View className="px-3 py-1 bg-app-primary-light rounded-full">
                  <Text className="text-app-primary text-sm font-medium">
                    {worker.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {(isSiteManager() || isSystemAdmin()) && (
            <View className="flex-row space-x-3">

              <TouchableOpacity 
                className="flex-1 bg-app-surface border border-app-border rounded-lg p-3"
                onPress={handleEditWorker}
              >
                <Text className="text-app-text-primary text-center font-medium">{t('edit')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-app-background border-b border-app-divider">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-1 py-4 px-4 ${
                activeTab === tab.id ? 'border-b-2 border-app-primary' : ''
              }`}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text className={`text-center font-medium ${
                activeTab === tab.id 
                  ? 'text-app-primary' 
                  : 'text-app-text-tertiary'
              }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'payments' && renderPaymentsTab()}

        {/* Admin Actions (only for SystemAdmin) */}
        {isSystemAdmin() && (
          <View className="p-4 border-t border-app-divider">
            <TouchableOpacity 
              className="bg-app-danger-light border border-app-danger rounded-lg p-3"
              onPress={handleDeactivateWorker}
            >
              <Text className="text-app-danger text-center font-medium">
                {t('deactivateWorker')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
