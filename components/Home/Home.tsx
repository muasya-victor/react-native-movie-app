import { apiRequest } from '@/services/api';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import translations from './translations.json';

export default function HomeComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (amount, currency = "KES") => {
    // Use locale based on current language
    const locale = currentLanguage === 'sw' ? 'sw-KE' : 'en-KE';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== FETCHING WALLET DATA ===');
      const response = await apiRequest('GET', '/wallets/wallets');
      console.log('Full Response:', response.data?.results);
      
      if (response.success && response.data?.results?.length > 0) {
        setWallet(response.data.results[0]);
      } else {
        setError('No wallet data found');
      }
    } catch (error) {
      console.log('Error fetching wallet data:', error);
      setError('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleWithdrawPress = () => {
    setShowWithdrawModal(true);
  }; 

  const handleWithMPesa = () => {
    setShowWithdrawModal(false);
    router.push('/withdraw-mpesa');
  };

  const handleWithoutMPesa = () => {
    setShowWithdrawModal(false);
    router.push('/withdraw-without-mpesa');
  };

  // Get balance values with fallbacks
  const currentBalance = wallet ? parseFloat(wallet?.balance || 10) : 0;
  const accruedBalance = wallet ? parseFloat(wallet?.all_time_accrued_balance || 0) : 0;
  const pendingBalance = wallet ? parseFloat(wallet?.pending_accrued_balance || 0) : 0;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 flex-row justify-between items-center">
        <Text className="text-xl font-semibold text-center flex-1">
          {t('appTitle')}
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-base">{t('loading', 'Loading...')}</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center px-4">
          <Text className="text-red-500 text-base text-center mb-4">{error}</Text>
          <TouchableOpacity 
            className="bg-green-500 py-3 px-6 rounded-lg"
            onPress={fetchWalletData}
          >
            <Text className="text-white font-medium">{t('retry', 'Retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 flex flex-col gap-4 space-y-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Balance Card */}
          <View className="w-full overflow-hidden">
            {/* Hero Image with Overlay */}
            <View className="relative w-full h-56 mb-4 mx-4 overflow-hidden">
              <Image 
                source={require('../../assets/images/transactions.jpg')}
                className="w-full h-full object-cover"
                resizeMode="cover"
              />
            </View>

            {/* Balance Amount */}
            <View className="px-4">
              <Text className="text-2xl font-bold text-black mb-1 text-center">
                {formatCurrency(currentBalance)}
              </Text>
              <Text className="text-green-600 text-sm mb-4 text-center">
                {t('withdrawableBalance')}
              </Text>
            </View>

            {/* Withdraw Button */}
            <View className="">
              <TouchableOpacity 
                className={`rounded-full py-4 ${currentBalance > 0 ? 'bg-green-500' : 'bg-gray-400'}`}
                onPress={currentBalance > 0 ? handleWithdrawPress : null}
                disabled={currentBalance <= 0}
              >
                <Text className="text-white text-center text-base font-semibold">
                  {t('withdrawCash')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* All Time Accrued Wages Card */}
          <View className="py-6">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-xl font-bold text-black mb-1">
                  {formatCurrency(accruedBalance)}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {t('accruedWages')}
                </Text>
              </View>
              <View className="bg-orange-200 rounded-xl w-16 h-16 justify-center items-center">
                <Text className="text-3xl">💰</Text>
              </View>
            </View>
          </View>

          {/* Pending Accrued Balance Card */}
          <View className="py-6">
            <View className="flex-row justify-between items-center"> 
              <View className="flex-1">
                <Text className="text-xl font-bold text-black mb-1">
                  {formatCurrency(pendingBalance)}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {t('pendingAccrued', 'Pending Accrued')}
                </Text>
              </View>
              <View className="bg-blue-200 rounded-xl w-16 h-16 justify-center items-center">
                <Text className="text-3xl">⏳</Text>
              </View>
            </View>
          </View>

          {/* User Info Card (Optional) */}
          {wallet && wallet.user_name && (
            <View className="py-6 border-t border-gray-100">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-black mb-1">
                    {wallet.user_name}
                  </Text>
                  {wallet.user_phone && (
                    <Text className="text-gray-500 text-sm">
                      {wallet.user_phone}
                    </Text>
                  )}
                  {wallet.user_email && (
                    <Text className="text-gray-500 text-sm">
                      {wallet.user_email}
                    </Text>
                  )}
                </View>
                <View className="bg-green-200 rounded-xl w-16 h-16 justify-center items-center">
                  <Text className="text-3xl">👤</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Withdraw Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showWithdrawModal}
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowWithdrawModal(false)}
        >
          <Pressable className="bg-white rounded-lg mx-12 w-80 overflow-hidden">
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={() => setShowWithdrawModal(false)}
                  className="mr-4"
                >
                  <Text className="text-xl">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold flex-1 text-center mr-8">
                  {t('withdraw')}
                </Text>
              </View>
            </View>

            {/* Current Balance Display */}
            <View className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <Text className="text-sm text-gray-600 text-center">
                {t('availableBalance', 'Available Balance')}
              </Text>
              <Text className="text-xl font-bold text-center text-green-600">
                {formatCurrency(currentBalance)}
              </Text>
            </View>

            {/* With MPesa Option */}
            <TouchableOpacity 
              className="px-4 py-4 border-b border-gray-100"
              onPress={handleWithMPesa}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-black mb-1">
                    {t('withMPesa')}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {t('withMPesaDescription')}
                  </Text>
                </View>
                <View className="bg-green-100 rounded p-2 ml-4">
                  <Text className="text-green-600 text-sm">→</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Without MPesa Option */}
            <TouchableOpacity 
              className="px-4 py-4"
              onPress={handleWithoutMPesa}
            >
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-base font-semibold text-black mb-1">
                    {t('withoutMPesa')}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {t('withoutMPesaDescription')}
                  </Text>
                </View>
                <View className="bg-gray-100 rounded p-2 ml-4">
                  <View className="w-6 h-6 bg-gray-400 rounded-full justify-center items-center">
                    <Text className="text-white text-xs">👤</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}