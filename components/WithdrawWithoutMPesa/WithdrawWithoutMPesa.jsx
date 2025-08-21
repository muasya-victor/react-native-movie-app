import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useTranslation } from '@/hooks/useTranslation';
import translations from './translations.json';

export default function WithdrawWithoutMPesaComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  const [amount, setAmount] = useState("");

  const formatCurrency = (amount, currency = "KES") => {
    // Use locale based on current language
    const locale = currentLanguage === 'sw' ? 'sw-KE' : 'en-KE';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  const handleConfirm = () => {
    // Handle withdrawal request logic here
    console.log("Withdraw amount:", amount);
    // You can add validation and API calls here
    // router.push('/withdrawal-request-success') or similar
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8">
          {t('withdraw')}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "space-between",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-6">
          {/* Site Manager Section */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-2">
              {t('siteManager')}
            </Text>
            <Text className="text-lg text-black font-medium">John Doe</Text>
          </View>

          {/* Amount Section */}
          <View className="mb-6">
            <Text className="text-sm text-gray-600 mb-3">
              {t('amount')}
            </Text>
            <TextInput
              className="bg-green-50 border border-green-100 rounded-full px-4 py-4 text-lg text-black"
              placeholder={t('enterAmount')}
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

        </View>

        {/* Confirm Button */}
        <View className="pb-8">
          <TouchableOpacity
            className={`rounded-full py-4 ${
              amount ? "bg-green-500" : "bg-gray-300"
            }`}
            onPress={handleConfirm}
            disabled={!amount}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {t('requestWithdrawal')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}