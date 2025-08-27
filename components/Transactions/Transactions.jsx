import { apiRequest } from '@/services/api';
import { useRouter } from "expo-router";
import { ArrowUpDown, Check } from 'lucide-react-native'; // Import Lucide icons
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import AppleStyleHeader from "../common/AppleStyleHeader";
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
  const [expandedTransactionId, setExpandedTransactionId] = useState(null);

  // --- Filter States ---
  const [filterOrdering, setFilterOrdering] = useState('-created_at'); // Default sort by Newest
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTransactionType, setFilterTransactionType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSortModalVisible, setSortModalVisible] = useState(false); // State for sort modal
  // --- End Filter States ---

  // --- Filter Data ---
  const STATUS_FILTERS = [
    { key: '', label: 'all' },
    { key: 'Completed', label: 'completed' },
    { key: 'Pending', label: 'pending' },
    { key: 'Approved', label: 'approved' },
    { key: 'Rejected', label: 'rejected' },
  ];

  const TYPE_FILTERS = [
    { key: '', label: 'all' },
    { key: 'Disbursement', label: 'disbursement' },
    { key: 'Withdrawal', label: 'withdrawal' },
    { key: 'LoanRepayment', label: 'loanRepayment' },
    { key: 'FoodDeduction', label: 'foodDeduction' },
    { key: 'InterestRateDeduction', label: 'interestDeduction' },
  ];

  const SORT_FILTERS = [
    { key: '-created_at', label: 'dateNewest' },
    { key: 'created_at', label: 'dateOldest' },
    { key: '-amount', label: 'amountDesc' },
    { key: 'amount', label: 'amountAsc' },
  ];
  // --- End Filter Data ---


  const formatCurrency = (amount, currency = "KES") => {
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

  const fetchTransactions = async (isRefresh = false, page = 1) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let queryParams = { page };

      if (filterOrdering) {
        queryParams.ordering = filterOrdering;
      }
      if (filterPaymentMethod) {
        queryParams.payment_method = filterPaymentMethod;
      }
      if (filterSearch) {
        queryParams.search = filterSearch;
      }
      if (filterStatus) {
        queryParams.status = filterStatus;
      }
      if (filterTransactionType) {
        queryParams.transaction_type = filterTransactionType;
      }

      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await apiRequest('GET', `/transactions/?${queryString}`);

      if (response.success && response.data) {
        setTransactions(response.data.results || []);
        setPagination({
          count: response.data.count || 0,
          next: response.data.next,
          previous: response.data.previous
        });
        setExpandedTransactionId(null);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (error) {
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTransactions();
    }, 500);
    return () => clearTimeout(debounce);
  }, [filterOrdering, filterPaymentMethod, filterSearch, filterStatus, filterTransactionType]);

  const onRefresh = () => {
    fetchTransactions(true);
  };

  const clearFilters = () => {
    setFilterOrdering('-created_at');
    setFilterPaymentMethod('');
    setFilterSearch('');
    setFilterStatus('');
    setFilterTransactionType('');
  };

  const handleSortSelect = (key) => {
    setFilterOrdering(key);
    setSortModalVisible(false);
  };

  // Helper functions (getTransactionIcon, getTransactionTitle, etc.) remain the same...

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
      case "loanrepayment":
        return "💸";
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
      case "loanrepayment":
        return t('loanRepayment', 'Loan Repayment');
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
      case "loanrepayment":
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
      case "loanrepayment":
        return "bg-purple-100";
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
      case "loanrepayment":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };


  const renderTransaction = ({ item }) => {
    const isExpanded = item.id === expandedTransactionId;

    return (
      <TouchableOpacity
        className="py-4 px-4 border-b border-gray-100"
        onPress={() => setExpandedTransactionId(isExpanded ? null : item.id)}
      >
        <View className="flex-row items-center justify-between">
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
                <Text className="text-xs text-gray-400 mt-1" numberOfLines={isExpanded ? 0 : 1}>
                  {item.narration}
                </Text>
              )}
            </View>
          </View>
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
        {isExpanded && (
          <View className="mt-4 pt-2 border-t border-gray-100">
            {item.transaction_id && (
              <Text className="text-sm text-gray-600 mt-1">
                <Text className="font-semibold">{t('transactionID', 'Transaction ID')}:</Text> {item.transaction_id}
              </Text>
            )}
            {item.reference && (
              <Text className="text-sm text-gray-600 mt-1">
                <Text className="font-semibold">{t('reference', 'Reference')}:</Text> {item.reference}
              </Text>
            )}
            {item.description && (
              <Text className="text-sm text-gray-600 mt-1">
                <Text className="font-semibold">{t('description', 'Description')}:</Text> {item.description}
              </Text>
            )}
            <Text className="text-sm text-gray-600 mt-1">
              <Text className="font-semibold capitalize">{t('on', 'On')}:</Text> {new Date(item.created_at).toLocaleDateString(currentLanguage === 'sw' ? 'sw-KE' : 'en-KE')}
              <Text className="font-semibold capitalize">  {t('at', 'At')}:</Text> {new Date(item.created_at).toLocaleTimeString(currentLanguage === 'sw' ? 'sw-KE' : 'en-KE')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };


  // Render states (empty, error, loading) remain the same...
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


  const FilterTabs = ({ title, data, selectedValue, onSelect }) => (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-600 mb-2 px-4">{title}</Text>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item, index }) => {
          const isSelected = selectedValue === item.key;
          return (
            <TouchableOpacity
              onPress={() => onSelect(item.key)}
              className={`px-4 py-2 rounded-full border ${isSelected
                ? 'bg-green-500 border-green-500'
                : 'bg-white border-gray-300'
                } ${index > 0 ? 'ml-2' : ''}`}
            >
              <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                {t(item.label.toLowerCase(), item.label)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderSortModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isSortModalVisible}
      onRequestClose={() => setSortModalVisible(false)}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPressOut={() => setSortModalVisible(false)}
      >
        <View className="w-4/5 bg-white rounded-xl shadow-lg" onStartShouldSetResponder={() => true}>
          <Text className="text-lg font-bold text-center py-4 border-b border-gray-200">
            {t('sortBy', 'Sort By')}
          </Text>
          {SORT_FILTERS.map((item) => {
            const isSelected = filterOrdering === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100"
                onPress={() => handleSortSelect(item.key)}
              >
                <Text className={`text-base ${isSelected ? 'font-bold text-green-600' : 'text-gray-800'}`}>
                  {t(item.label.toLowerCase(), item.label)}
                </Text>
                {isSelected && <Check color="#16A34A" size={20} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {renderSortModal()}

      <AppleStyleHeader
        title={t('title')}
        subText={`${t('totalTransactions', 'Total transactions')}: ${pagination.count || 0}`}
      />

      <TouchableOpacity
        className="flex-row justify-start items-center ml-4 py-2 bg-gray-50 border-b border-gray-100"
        onPress={() => setShowFilters(!showFilters)}
      >
        <Text className="text-blue-600 font-semibold text-base mr-2">
          {showFilters ? t('hideFilters', 'Hide Filters') : t('showFilters', 'Show Filters')}
        </Text>
        <Text className="text-lg">{showFilters ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showFilters && (
        <View className="py-2 bg-gray-50 border-b border-gray-200">
          <View className="px-4 mb-4">
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white text-gray-800"
              placeholder={t('searchPlaceholder', 'Search by narration, reference...')}
              value={filterSearch}
              onChangeText={setFilterSearch}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <FilterTabs
            title={t('status', 'Status')}
            data={STATUS_FILTERS}
            selectedValue={filterStatus}
            onSelect={setFilterStatus}
          />

          <FilterTabs
            title={t('transactionType', 'Transaction Type')}
            data={TYPE_FILTERS}
            selectedValue={filterTransactionType}
            onSelect={setFilterTransactionType}
          />

          <View className="flex-row justify-end mt-2 px-4">
            <TouchableOpacity
              className="px-4 py-2 rounded-lg bg-gray-200"
              onPress={clearFilters}
            >
              <Text className="text-gray-700 font-medium">{t('clearAll', 'Clear All')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
          ListHeaderComponent={
            <View className="px-4 pt-4 pb-2 flex-row justify-between items-center bg-white">
              <TouchableOpacity
                className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
                onPress={() => setSortModalVisible(true)}
              >
                <ArrowUpDown color="#4B5563" size={16} />
                <Text className="ml-2 text-gray-700 font-medium">
                  {t('sortBy', 'Sort By')}
                </Text>
              </TouchableOpacity>
              {/* You can add other controls here if needed */}
            </View>
          }
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