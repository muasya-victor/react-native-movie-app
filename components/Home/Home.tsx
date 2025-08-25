import { apiRequest } from '@/services/api';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import translations from './translations.json';

export default function HomeComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [wallet, setWallet] = useState(null);
  const [loanEligibility, setLoanEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loanLoading, setLoanLoading] = useState(false);
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
      const response = await apiRequest('GET', '/wallets/my-wallet/');
      console.log('Wallet Response:', response);
      
      if (response.success && response.data) {
        setWallet(response.data)
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchLoanEligibility = async () => {
    try {
      const response = await apiRequest('GET', '/loans/eligibility/');
      console.log('Loan Eligibility Response:', response);
      
      if (response.success && response.data) {
        setLoanEligibility(response.data);
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);
      
      await Promise.all([
        fetchWalletData(),
        fetchLoanEligibility()
      ]);
    } catch (error) {
      setError('Failed to fetch data');
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdrawPress = () => {
    setShowWithdrawModal(true);
  }; 

  const handleLoanPress = () => {
    if (loanEligibility?.eligible) {
      setShowLoanModal(true);
      setLoanAmount(''); // Reset loan amount
    } else {
      Alert.alert(
        t('loanNotAvailable', 'Loan Not Available'),
        loanEligibility?.reason || t('notEligible', 'Not eligible for loan'),
        [{ text: t('ok', 'OK') }]
      );
    }
  };

  const handleLoanRequest = async () => {
    const amount = parseFloat(loanAmount);
    const maxAmount = parseFloat(loanEligibility?.max_loan_amount || 0);

    // Validation
    if (!loanAmount || amount <= 0) {
      Alert.alert(
        t('invalidAmount', 'Invalid Amount'),
        t('pleaseEnterValidAmount', 'Please enter a valid amount'),
        [{ text: t('ok', 'OK') }]
      );
      return;
    }

    if (amount > maxAmount) {
      Alert.alert(
        t('amountTooHigh', 'Amount Too High'),
        t('maxLoanAmount', `Maximum loan amount is ${formatCurrency(maxAmount)}`),
        [{ text: t('ok', 'OK') }]
      );
      return;
    }

    if (!loanEligibility?.site_id) {
      Alert.alert(
        t('error', 'Error'),
        t('siteNotFound', 'Site information not found'),
        [{ text: t('ok', 'OK') }]
      );
      return;
    }

    try {
      setLoanLoading(true);
      
      const response = await apiRequest('POST', '/loans/request/', {
        amount_requested: loanAmount,
        site_id: loanEligibility.site_id
      });

      if (response.success) {
        Alert.alert(
          t('loanRequestSuccess', 'Loan Request Submitted'),
          t('loanRequestSuccessMessage', 'Your loan request has been submitted successfully and is pending approval.'),
          [
            { 
              text: t('ok', 'OK'), 
              onPress: () => {
                setShowLoanModal(false);
                setLoanAmount('');
                // Refresh data to get updated loan eligibility
                fetchData();
              }
            }
          ]
        );
      } else {
        Alert.alert(
          t('error', 'Error'),
          response.error?.message || response.error || t('loanRequestFailed', 'Failed to submit loan request'),
          [{ text: t('ok', 'OK') }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('error', 'Error'),
        t('loanRequestFailed', 'Failed to submit loan request'),
        [{ text: t('ok', 'OK') }]
      );
    } finally {
      setLoanLoading(false);
    }
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
  const currentBalance = wallet ? parseFloat(wallet?.balance || 0) : 0;
  const accruedBalance = wallet ? parseFloat(wallet?.all_time_accrued_balance || 0) : 0;
  const pendingBalance = wallet ? parseFloat(wallet?.pending_accrued_balance || 0) : 0;
  const maxLoanAmount = loanEligibility ? parseFloat(loanEligibility?.max_loan_amount || 0) : 0;

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
            onPress={fetchData}
          >
            <Text className="text-white font-medium">{t('retry', 'Retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 flex flex-col gap-4 space-y-6"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
        >
          {/* Main Balance Card */}
          <View className="w-full overflow-hidden">
            {/* Hero Image with Overlay */}
            <View className="relative w-full h-24 mb-4 mx-4 overflow-hidden">
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

          {/* Loan Eligibility Card */}
          <TouchableOpacity 
            className={`py-6 px-4 rounded-lg border-2 ${
              loanEligibility?.eligible 
                ? 'bg-purple-50 border-purple-200 border-dashed' 
                : 'bg-gray-50 border-gray-200'
            }`}
            onPress={handleLoanPress}
            disabled={!loanEligibility?.eligible}
            activeOpacity={loanEligibility?.eligible ? 0.7 : 1}
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-1 space-y-4">
                <Text className="text-xl font-bold text-black mb-1">
                  {loanEligibility?.eligible ? formatCurrency(maxLoanAmount) : formatCurrency(0)}
                </Text>
                <Text className={`text-sm mb-2 ${
                  loanEligibility?.eligible ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {t('loanEligible', 'Loan Available')}
                </Text>

                {loanEligibility?.site_name && (
                  <Text className="text-xs text-gray-400 mt-1">
                    {t('site', 'Site')}: {loanEligibility.site_name}
                  </Text>
                )}
                {loanEligibility?.interest_rate && (
                  <Text className="text-xs text-gray-400">
                    {t('interestRate', 'Interest')}: {loanEligibility.interest_rate}%
                  </Text>
                )}
                    {loanEligibility && !loanEligibility.eligible && (
                      <Text className="text-sm text-red-500 mt-2">
                        {loanEligibility.reason || t('notEligible', 'Not eligible for loan')}
                      </Text>
                    )}
                    {loanEligibility?.outstanding_loan_balance > 0 && (
                      <Text className="text-sm text-orange-600 mt-2">
                        {t('outstandingLoan', 'Outstanding')}: {formatCurrency(loanEligibility.outstanding_loan_balance)}
                      </Text>
                   )}
                {loanEligibility?.eligible && (
                  <View className="bg-purple-700 self-start px-3 py-4 rounded-full w-full mt-2">
                    <Text className="text-purple-100  text-center font-medium">
                      {t('tapToRequest', 'Tap to request loan')}
                    </Text>
                  </View>
                )}


                
              </View>
              {/* <View className={`rounded-xl w-16 h-16 justify-center items-center ${
                loanEligibility?.eligible ? 'bg-purple-200' : 'bg-gray-200'
              }`}>
                <Text className="text-3xl">
                  {loanEligibility?.eligible ? '🏦' : '🚫'}
                </Text>
                {loanEligibility?.eligible && (
                  <View className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full w-6 h-6 justify-center items-center">
                    <Text className="text-white text-xs font-bold">+</Text>
                  </View>
                )}
              </View> */}
            </View>

          </TouchableOpacity>

          {/* User Info Card */}
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

      {/* Loan Request Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLoanModal}
        onRequestClose={() => setShowLoanModal(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowLoanModal(false)}
        >
          <Pressable className="bg-white rounded-lg mx-8 w-80 overflow-hidden">
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <TouchableOpacity 
                  onPress={() => setShowLoanModal(false)}
                  className="mr-4"
                >
                  <Text className="text-xl">←</Text>
                </TouchableOpacity>
                <Text className="text-lg font-semibold flex-1 text-center mr-8">
                  {t('requestLoan', 'Request Loan')}
                </Text>
              </View>
            </View>

            {/* Loan Info */}
            <View className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <Text className="text-sm text-gray-600 text-center mb-2">
                {t('maxLoanAvailable', 'Maximum Loan Available')}
              </Text>
              <Text className="text-xl font-bold text-center text-purple-600 mb-2">
                {formatCurrency(maxLoanAmount)}
              </Text>
              {loanEligibility?.site_name && (
                <Text className="text-xs text-gray-500 text-center">
                  {t('site', 'Site')}: {loanEligibility.site_name}
                </Text>
              )}
              {loanEligibility?.interest_rate && (
                <Text className="text-xs text-gray-500 text-center">
                  {t('interestRate', 'Interest Rate')}: {loanEligibility.interest_rate}%
                </Text>
              )}
            </View>

            {/* Amount Input */}
            <View className="px-6 py-4">
              <Text className="text-sm text-gray-600 mb-2">
                {t('enterLoanAmount', 'Enter loan amount')}
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder={t('amountPlaceholder', 'e.g. 1000')}
                value={loanAmount}
                onChangeText={setLoanAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row px-6 py-4 space-x-3">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-3 rounded-lg mr-2"
                onPress={() => setShowLoanModal(false)}
                disabled={loanLoading}
              >
                <Text className="text-gray-700 text-center font-medium">
                  {t('cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`flex-1 py-3 rounded-lg ml-2 ${
                  loanLoading ? 'bg-gray-400' : 'bg-purple-600'
                }`}
                onPress={handleLoanRequest}
                disabled={loanLoading}
              >
                <Text className="text-white text-center font-medium">
                  {loanLoading ? t('submitting', 'Submitting...') : t('submit', 'Submit')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}