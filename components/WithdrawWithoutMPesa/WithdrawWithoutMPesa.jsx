import { useTranslation } from '@/hooks/useTranslation';
import { apiRequest } from '@/services/api';
import { useSiteStore } from '@/store/siteStore';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import translations from './translations.json';

export default function WithdrawWithoutMPesaComponent() {
  const router = useRouter();
  const { selectedSite } = useSiteStore();
  const { t, currentLanguage } = useTranslation(translations);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await apiRequest('GET', '/wallets/my-wallet/');
      
      if (response && response.data) {
        const walletData = response.data;
        setWallet(walletData);
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

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    const availableBalance = wallet ? parseFloat(wallet.balance || 0) : 0;
    return numAmount > 0 && numAmount <= availableBalance;
  };

  const handleConfirm = async () => {
    if (!isValidAmount()) {
      Alert.alert(
        t('error', 'Error'),
        t('invalidAmount', 'Invalid amount or insufficient balance')
      );
      return;
    }

    if (!selectedSite) {
      Alert.alert(
        t('error', 'Error'),
        t('noSiteSelected', 'Please select a site first')
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const withdrawalData = {
        site_id: parseInt(selectedSite.id),
        amount: parseFloat(amount)
      };

      console.log('Withdrawal request data:', withdrawalData);

      const response = await apiRequest('POST', '/withdrawals/requests/', withdrawalData);

      if (response.success) {
        console.log('Withdrawal request successful:', response.data);
        
        Alert.alert(
          t('success', 'Success'),
          t('withdrawalRequestSubmitted', 'Your withdrawal request has been submitted successfully'),
          [
            {
              text: t('ok', 'OK'),
              onPress: () => {
                // Clear form and navigate back
                setAmount("");
                router.back();
              }
            }
          ]
        );
      } else {
        console.error('Withdrawal request failed:', response.error);
        Alert.alert(
          t('error', 'Error'),
          response.error?.message || t('withdrawalFailed', 'Failed to submit withdrawal request')
        );
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert(
        t('error', 'Error'),
        t('networkError', 'Network error occurred. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableBalance = wallet ? parseFloat(wallet.balance || 0) : 0;
  const enteredAmount = parseFloat(amount || 0);

  if (loading) {
    return (
      <View className="flex-1 bg-app-background justify-center items-center">
        <Text className="text-app-text-secondary text-base">{t('loading', 'Loading...')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-app-background justify-center items-center px-4">
        <Text className="text-app-danger text-base text-center mb-4">{error}</Text>
        <TouchableOpacity 
          className="bg-app-primary py-3 px-6 rounded-lg"
          onPress={fetchWalletData}
        >
          <Text className="text-white font-medium">{t('retry', 'Retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="bg-app-background px-4 pt-12 pb-4 flex-row items-center border-b border-app-border">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8 text-app-text-primary">
          {t('withdrawWithoutMPesa', 'Cash Withdrawal Request')}
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
          {/* Available Balance Section */}
          <View className="bg-app-surface rounded-lg p-4 mb-6 shadow-sm border border-app-border">
            <Text className="text-sm text-app-text-secondary mb-1">
              {t('availableBalance', 'Available Balance')}
            </Text>
            <Text className="text-2xl font-bold text-app-primary">
              {formatCurrency(availableBalance)}
            </Text>
            {wallet?.user_name && (
              <Text className="text-sm text-app-text-tertiary mt-1">
                {wallet.user_name}
              </Text>
            )}
          </View>

          {/* Selected Site Section */}
          <View className="bg-app-surface rounded-lg p-4 mb-6 shadow-sm border border-app-border">
            <Text className="text-sm text-app-text-secondary mb-2">
              {t('selectedSite', 'Selected Site')}
            </Text>
            {selectedSite ? (
              <View>
                <Text className="text-lg font-semibold text-app-text-primary">
                  {selectedSite.name}
                </Text>
                <Text className="text-sm text-app-text-secondary mt-1">
                  {selectedSite.address}
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-app-text-tertiary">
                  {t('noSiteSelected', 'No site selected')}
                </Text>
                <TouchableOpacity 
                  className="bg-app-primary px-4 py-2 rounded-lg mt-2 self-start"
                  onPress={() => router.push('/select-site')}
                >
                  <Text className="text-white text-sm font-medium">
                    {t('selectSite', 'Select Site')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Amount Section */}
          <View className="mb-6">
            <Text className="text-sm text-app-text-secondary mb-3">
              {t('withdrawalAmount', 'Withdrawal Amount')}
            </Text>
            <TextInput
              className="bg-app-primary-light border border-app-primary rounded-lg px-4 py-4 text-lg text-app-text-primary"
              placeholder={t('enterAmount', 'Enter amount')}
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            
            {/* Amount Validation Messages */}
            {amount && enteredAmount > availableBalance && (
              <Text className="text-app-danger text-sm mt-2">
                {t('insufficientBalance', 'Insufficient balance')}
              </Text>
            )}
            
            {amount && enteredAmount <= 0 && (
              <Text className="text-app-danger text-sm mt-2">
                {t('amountMustBePositive', 'Amount must be greater than 0')}
              </Text>
            )}
            
            {amount && isValidAmount() && (
              <Text className="text-app-primary text-sm mt-2">
                {t('validAmount', '✓ Valid amount')}
              </Text>
            )}
          </View>

          {/* Quick Amount Buttons */}
          {availableBalance > 0 && (
            <View className="mb-6">
              <Text className="text-sm text-app-text-secondary mb-3">
                {t('quickSelect', 'Quick Select')}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[100, 200, 500, Math.floor(availableBalance)].map((quickAmount) => (
                  quickAmount <= availableBalance && quickAmount > 0 ? (
                    <TouchableOpacity
                      key={quickAmount}
                      className="bg-app-surface-variant px-4 py-2 rounded-full border border-app-border"
                      onPress={() => setAmount(quickAmount.toString())}
                    >
                      <Text className="text-app-text-primary font-medium">
                        {formatCurrency(quickAmount)}
                      </Text>
                    </TouchableOpacity>
                  ) : null
                ))}
              </View>
            </View>
          )}

          {/* Important Note */}
          <View className="bg-app-accent-light rounded-lg p-4 mb-6 border border-app-accent">
            <Text className="text-app-accent text-sm font-medium mb-2">
              {t('importantNote', 'Important Note')}
            </Text>
            <Text className="text-app-accent text-sm leading-5">
              {t('withdrawalNote', 'Your withdrawal request will be sent to the site manager for approval. You will receive the cash from your site manager once approved.')}
            </Text>
          </View>
        </View>

        {/* Summary and Confirm Button */}
        <View className="pb-8">
          {amount && selectedSite && (
            <View className="bg-app-surface rounded-lg p-4 mb-4 shadow-sm border border-app-border">
              <Text className="text-sm text-app-text-secondary mb-2">
                {t('withdrawalSummary', 'Withdrawal Summary')}
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-app-text-secondary">{t('amount', 'Amount')}</Text>
                <Text className="font-semibold text-app-text-primary">{formatCurrency(enteredAmount)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-app-text-secondary">{t('site', 'Site')}</Text>
                <Text className="font-semibold text-app-text-primary">{selectedSite.name}</Text>
              </View>
              <View className="border-t border-app-divider pt-2 mt-2">
                <View className="flex-row justify-between">
                  <Text className="text-app-text-secondary">{t('remainingBalance', 'Remaining Balance')}</Text>
                  <Text className="font-semibold text-app-primary">
                    {formatCurrency(availableBalance - enteredAmount)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          <TouchableOpacity
            className={`rounded-lg py-4 ${
              (amount && selectedSite && isValidAmount() && !isSubmitting) 
                ? "bg-app-primary" 
                : "bg-app-text-tertiary"
            }`}
            onPress={handleConfirm}
            disabled={!(amount && selectedSite && isValidAmount()) || isSubmitting}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isSubmitting 
                ? t('submitting', 'Submitting...') 
                : t('requestWithdrawal', 'Request Withdrawal')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}