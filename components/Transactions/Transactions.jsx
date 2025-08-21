import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from '../../hooks/useTranslation';
import translations from './translations.json';

// Sample transaction data
const transactionData = [
  {
    id: 1,
    type: "loan",
    amount: 100,
    status: "completed",
    date: "2025-08-19"
  },
  {
    id: 2,
    type: "withdrawal",
    amount: 50,
    status: "completed",
    date: "2025-08-18"
  },
  {
    id: 3,
    type: "loan",
    amount: 100,
    status: "completed",
    date: "2025-08-17"
  },
  {
    id: 4,
    type: "withdrawal",
    amount: 50,
    status: "completed",
    date: "2025-08-16"
  },
  {
    id: 5,
    type: "loan",
    amount: 100,
    status: "completed",
    date: "2025-08-15"
  },
  {
    id: 6,
    type: "withdrawal",
    amount: 50,
    status: "completed",
    date: "2025-08-14"
  },
  {
    id: 7,
    type: "food_deduction",
    amount: 25,
    status: "completed",
    date: "2025-08-14"
  },
  {
    id: 8,
    type: "loan_deduction",
    amount: 15,
    status: "completed",
    date: "2025-08-13"
  }
];

export default function TransactionsComponent() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation(translations);

  const formatCurrency = (amount, currency = "KES") => {
    // Use locale based on current language
    const locale = currentLanguage === 'sw' ? 'sw-KE' : 'en-KE';
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "loan":
        return "↗";
      case "withdrawal":
        return "✓";
      case "food_deduction":
        return "↘";
      case "loan_deduction":
        return "↘";
      default:
        return "→";
    }
  };

  const getTransactionTitle = (type) => {
    switch (type) {
      case "loan":
        return t('loan');
      case "withdrawal":
        return t('withdrawal');
      case "food_deduction":
        return t('foodDeduction');
      case "loan_deduction":
        return t('loanDeduction');
      default:
        return t('transaction');
    }
  };

  const getAmountPrefix = (type) => {
    switch (type) {
      case "loan":
        return "+";
      case "withdrawal":
      case "food_deduction":
      case "loan_deduction":
        return "-";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return t('completed');
      case "pending":
        return t('pending');
      case "failed":
        return t('failed');
      case "processing":
        return t('processing');
      default:
        return status;
    }
  };

  const renderTransaction = ({ item }) => (
    <View className="flex-row items-center justify-between py-4 px-4 border-b border-gray-100">
      {/* Left side - Icon and details */}
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 bg-green-100 rounded-full justify-center items-center mr-4">
          <Text className="text-green-600 text-lg font-bold">
            {getTransactionIcon(item.type)}
          </Text>
        </View>
        <View>
          <Text className="text-lg font-semibold text-black">
            {getAmountPrefix(item.type)}{formatCurrency(item.amount, "KES")}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {getTransactionTitle(item.type)}
          </Text>
        </View>
      </View>

      {/* Right side - Status */}
      <Text className="text-sm text-gray-600">
        {getStatusText(item.status)}
      </Text>
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

      {/* Transaction List */}
      <FlatList
        data={transactionData}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="justify-center items-center py-20">
            <Text className="text-gray-500 text-base">
              {t('noTransactions')}
            </Text>
          </View>
        }
      />
    </View>
  );
}