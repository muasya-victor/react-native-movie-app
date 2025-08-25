import { useRouter } from "expo-router";
import { apiRequest } from '@/services/api';
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import translations from './translations.json';

export default function TransactionsComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  });

  const formatCurrency = (amount, currency = "KES") => {
    // Use locale based on current language
    const locale = currentLanguage === 'sw' ? 'sw-KE' : 'en-KE';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const locale = currentLanguage === 'sw' ? 'sw-KE' : 'en-KE';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const fetchTransactions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('=== FETCHING TRANSACTIONS DATA ===');
      const response = await apiRequest('GET', '/transactions/');
      console.log('Transactions Response:', response);

      if (response.success && response.data) {
        console.log('Transactions Results:', response.data.results);
        setTransactions(response.data.results || []);
        setPagination({
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous
        });
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (error) {
      console.log('Error fetching transactions:', error);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    fetchTransactions(true);
  };

  const getTransactionIcon = (transactionType) => {
    switch (transactionType?.toLowerCase()) {
      case "withdrawal":
        return "↗";
      case "disbursement":
        return "↗";
      case "fooddeduction":
      case "food_deduction":
        return "🍽️";
      case "interestratededuction":
      case "interest_rate_deduction":
        return "↘";
      default:
        return "→";
    }
  };

  const getTransactionTitle = (transactionType) => {
    switch (transactionType?.toLowerCase()) {
      case "withdrawal":
        return t('withdrawal');
      case "disbursement":
        return t('disbursement', 'Disbursement');
      case "fooddeduction":
      case "food_deduction":
        return t('foodDeduction');
      case "interestratededuction":
      case "interest_rate_deduction":
        return t('interestDeduction', 'Interest Deduction');
      default:
        return t('transaction');
    }
  };

  const getAmountPrefix = (transactionType) => {
    switch (transactionType?.toLowerCase()) {
      case "disbursement":
        return "+";
      case "withdrawal":
      case "fooddeduction":
      case "food_deduction":
      case "interestratededuction":
      case "interest_rate_deduction":
        return "-";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return t('completed');
      case "pending":
        return t('pending');
      case "approved":
        return t('approved', 'Approved');
      case "rejected":
        return t('rejected', 'Rejected');
      default:
        return status || t('unknown', 'Unknown');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "approved":
        return "text-green-600";
      case "pending":
        return "text-orange-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getIconBackgroundColor = (transactionType) => {
    switch (transactionType?.toLowerCase()) {
      case "withdrawal":
        return "bg-blue-100";
      case "disbursement":
        return "bg-green-100";
      case "fooddeduction":
      case "food_deduction":
        return "bg-orange-100";
      case "interestratededuction":
      case "interest_rate_deduction":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getIconColor = (transactionType) => {
    switch (transactionType?.toLowerCase()) {
      case "withdrawal":
        return "text-blue-600";
      case "disbursement":
        return "text-green-600";
      case "fooddeduction":
      case "food_deduction":
        return "text-orange-600";
      case "interestratededuction":
      case "interest_rate_deduction":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const renderTransaction = ({ item }) => (
    <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
      {/* Left side - Icon and details */}
      <View className="flex-row items-center flex-1">
        <View className={`w-10 h-10 ${getIconBackgroundColor(item.transaction_type)} rounded-full justify-center items-center mr-4`}>
          <Text className={`${getIconColor(item.transaction_type)} text-lg font-bold`}>
            {getTransactionIcon(item.transaction_type)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-black">
            {getAmountPrefix(item.transaction_type)}{formatCurrency(parseFloat(item.amount || 0), "KES")}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {getTransactionTitle(item.transaction_type)}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {formatDate(item.created_at)} • {item.payment_method || 'N/A'}
          </Text>
          {item.narration && (
            <Text className="text-xs text-gray-400 mt-1" numberOfLines={1}>
              {item.narration}
            </Text>
          )}
        </View>
      </View>

      {/* Right side - Status and Balance Info */}
      <View className="items-end">
        <Text className={`text-sm font-medium ${getStatusColor(item.status)}`}>
          {getStatusText(item.status)}
        </Text>
        {item.wallet_balance_after && (
          <Text className="text-xs text-gray-400 mt-1">
            {t('balance', 'Balance')}: {formatCurrency(parseFloat(item.wallet_balance_after), "KES")}
          </Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="justify-center items-center py-20">
      <Text className="text-6xl mb-4">📊</Text>
      <Text className="text-gray-500 text-base text-center">
        {t('noTransactions')}
      </Text>
      <TouchableOpacity 
        className="bg-green-500 py-2 px-4 rounded-lg mt-4"
        onPress={() => fetchTransactions()}
      >
        <Text className="text-white font-medium">{t('refresh', 'Refresh')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View className="justify-center items-center py-20 px-4">
      <Text className="text-6xl mb-4">⚠️</Text>
      <Text className="text-red-500 text-base text-center mb-4">
        {error}
      </Text>
      <TouchableOpacity 
        className="bg-green-500 py-3 px-6 rounded-lg"
        onPress={() => fetchTransactions()}
      >
        <Text className="text-white font-medium">{t('retry', 'Retry')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View className="justify-center items-center py-20">
      <Text className="text-gray-500 text-base">{t('loading', 'Loading transactions...')}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-center flex-1 mr-8">
          {t('title')}
        </Text>
      </View>

      {/* Summary Section */}
      {pagination.count > 0 && (
        <View className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <Text className="text-sm text-gray-600">
            {t('totalTransactions', 'Total transactions')}: {pagination.count}
          </Text>
        </View>
      )}

      {/* Transaction List */}
      {loading && transactions.length === 0 ? (
        renderLoading()
      ) : error && transactions.length === 0 ? (
        renderError()
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor={'#4CAF50'}
            />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={transactions.length === 0 ? { flex: 1 } : {}}
        />
      )}
    </View>
  );
}