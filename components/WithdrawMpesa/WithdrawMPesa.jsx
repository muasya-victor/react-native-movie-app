import { apiRequest } from '@/services/api';
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
import { useTranslation } from '../../hooks/useTranslation';
import translations from './translations.json';

export default function WithdrawMPesaComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
        // Set phone number from wallet data if available
        if (walletData.user_phone) {
          setPhoneNumber(walletData.user_phone);
        }
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

  const formatPhoneNumber = (number) => {
    // Remove any non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // If starts with 0, replace with +254
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `+254${cleaned.slice(1)}`;
    }
    
    // If starts with 254, add +
    if (cleaned.startsWith('254') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    // If already has +254
    if (cleaned.startsWith('254') && number.startsWith('+')) {
      return number;
    }
    
    return number;
  };

  const isValidAmount = () => {
    const numAmount = parseFloat(amount);
    const availableBalance = wallet ? parseFloat(wallet.balance || 0) : 0;
    return numAmount > 0 && numAmount <= availableBalance;
  };

  const isValidPhone = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 9 && (
      cleaned.startsWith('0') || 
      cleaned.startsWith('254') || 
      cleaned.startsWith('7')
    );
  };

  const handleConfirm = async () => {
    if (!isValidAmount()) {
      Alert.alert(
        t('error', 'Error'),
        t('invalidAmount', 'Invalid amount or insufficient balance')
      );
      return;
    }
    
    if (!isValidPhone()) {
      Alert.alert(
        t('error', 'Error'),
        t('invalidPhone', 'Please enter a valid phone number')
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Create withdrawal data in the required format
      const withdrawalData = {
        amount: parseFloat(amount).toString(),
        customer_account_number: formatPhoneNumber(phoneNumber),
        withdrawal_method: "MPesa"
      };

      console.log("Withdraw data:", withdrawalData);

      const response = await apiRequest('POST', '/withdrawals/', withdrawalData);

      if (response.success) {
        console.log('MPesa withdrawal successful:', response.data);
        
        Alert.alert(
          t('success', 'Success'),
          t('withdrawalInitiated', 'Your MPesa withdrawal has been initiated successfully. You will receive an SMS prompt shortly.'),
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
        console.error('MPesa withdrawal failed:', response.error);
        Alert.alert(
          t('error', 'Error'),
          response.error?.message || t('withdrawalFailed', 'Failed to process withdrawal')
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

  const handleEditPhone = () => {
    setIsEditing(true);
  };

  const handleSavePhone = () => {
    if (isValidPhone()) {
      setIsEditing(false);
    } else {
      Alert.alert(
        t('error', 'Error'),
        t('invalidPhone', 'Please enter a valid phone number')
      );
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

          {/* MPesa Number Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm text-app-text-secondary">
                {t('mpesaNumber')}
              </Text>
              <TouchableOpacity onPress={isEditing ? handleSavePhone : handleEditPhone}>
                <Text className="text-app-primary text-sm font-medium">
                  {isEditing ? t('save', 'Save') : t('edit', 'Edit')}
                </Text>
              </TouchableOpacity>
            </View>
            
            {isEditing ? (
              <TextInput
                className="bg-app-surface border border-app-border rounded-lg px-4 py-3 text-lg text-app-text-primary"
                placeholder={t('enterPhoneNumber', 'Enter phone number')}
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoFocus={true}
              />
            ) : (
              <View className="bg-app-surface border border-app-border rounded-lg px-4 py-3">
                <Text className="text-lg text-app-text-primary font-medium">
                  {formatPhoneNumber(phoneNumber) || t('noPhoneNumber', 'No phone number')}
                </Text>
              </View>
            )}
          </View>

          {/* Amount Section */}
          <View className="mb-6">
            <Text className="text-sm text-app-text-secondary mb-3">
              {t('amount')}
            </Text>
            <TextInput
              className="bg-app-primary-light border border-app-primary rounded-lg px-4 py-4 text-lg text-app-text-primary"
              placeholder={t('enterAmount')}
              placeholderTextColor="#9CA3AF"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoFocus={false}
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
        </View>

        {/* Summary and Confirm Button */}
        <View className="pb-8">
          {amount && phoneNumber && (
            <View className="bg-app-surface rounded-lg p-4 mb-4 shadow-sm border border-app-border">
              <Text className="text-sm text-app-text-secondary mb-2">
                {t('withdrawalSummary', 'Withdrawal Summary')}
              </Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-app-text-secondary">{t('amount')}</Text>
                <Text className="font-semibold text-app-text-primary">{formatCurrency(enteredAmount)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-app-text-secondary">{t('to', 'To')}</Text>
                <Text className="font-semibold text-app-text-primary">{formatPhoneNumber(phoneNumber)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-app-text-secondary">{t('method', 'Method')}</Text>
                <Text className="font-semibold text-app-primary">MPesa</Text>
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
              (amount && phoneNumber && isValidAmount() && isValidPhone() && !isSubmitting) 
                ? "bg-app-primary" 
                : "bg-app-text-tertiary"
            }`}
            onPress={handleConfirm}
            disabled={!(amount && phoneNumber && isValidAmount() && isValidPhone()) || isSubmitting}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isSubmitting 
                ? t('processing', 'Processing...') 
                : t('confirm', 'Confirm Withdrawal')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}