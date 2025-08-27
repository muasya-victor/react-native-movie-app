import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { WithdrawalRequestService } from '../../services/withdrawalRequestService';
import { useWithdrawalRequestStore } from '../../store/withdrawalRequestStore';
import AppleStyleHeader from "../common/AppleStyleHeader";
import WithdrawalRequestFAB from "./WithdrawalRequestFAB";
import translations from './translations.json';

const STATUS_FILTERS = [
  { key: null, label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Rejected', label: 'Rejected' },
  { key: 'Processed', label: 'Processed' },
];

export default function WithdrawalRequestsComponent() {
  const router = useRouter();
  const { userType, isSiteManager, isSystemAdmin } = useAuth();
  const { t } = useTranslation(translations);

  // Zustand store
  const {
    managerWithdrawalRequests,
    isLoading,
    isApproving,
    isRejecting,
    error,
    selectedStatus,
    currentPage,
    fetchManagerWithdrawalRequests,
    approveWithdrawalRequest,
    rejectWithdrawalRequest,
    setSelectedStatus,
    setCurrentPage,
    clearError,
    refreshData,
  } = useWithdrawalRequestStore();

  // Local state
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (selectedStatus !== null) {
      fetchManagerWithdrawalRequests({
        status: selectedStatus,
        page: currentPage,
      });
    } else {
      // Fetch all statuses when "All" is selected
      fetchManagerWithdrawalRequests({
        page: currentPage,
      });
    }
  }, [selectedStatus, currentPage]);

  const loadInitialData = useCallback(async () => {

    try {
      // Set default filter to Pending
      setSelectedStatus('Pending');
      await fetchManagerWithdrawalRequests({
        status: 'Pending',
        page: 1,
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  const handleToggleExpand = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    setExpandedRequest(null); // Close any expanded items
  };

  const handleApprove = async (request) => {
    const formattedAmount = request.amount?.toLocaleString()
    const approveRequestMessage = t('approveRequestMessage').toString()?.replace('{name}', request.user_name).replace('{amount}', formattedAmount)
    const requestApproved = t('requestApproved').toString()?.replace('{name}', request.user_name)
    // First, prompt for phone number
    Alert.prompt(
      t('approveRequest'),
      t('enterPhoneNumber') || 'Enter phone number for withdrawal (07...)',
      async (phoneNumber) => {
        if (!phoneNumber || phoneNumber.trim() === '') {
          Alert.alert('Error', 'Phone number is required');
          return;
        }

        // Validate Kenyan phone number
        if (!WithdrawalRequestService.validateKenyanPhone(phoneNumber)) {
          Alert.alert('Error', 'Please enter a valid Kenyan phone number');
          return;
        }

        Alert.alert(
          t('approveRequest'),
          approveRequestMessage,
          [
            { text: t('cancel'), style: 'cancel' },
            {
              text: `${t('approve')}`,
              onPress: async () => {
                try {
                  await approveWithdrawalRequest(request.id, {
                    manager_provided_phone: phoneNumber
                  });

                  setExpandedRequest(null);
                  Alert.alert(
                    t('success'),
                    requestApproved
                  );
                } catch (error) {
                  Alert.alert('Error', error.message);
                }
              }
            }
          ]
        );
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  const handleReject = (request) => {
    Alert.prompt(
      t('declineRequest'),
      'Please provide a reason for rejecting this request',
      async (reason) => {
        if (!reason || reason.trim() === '') {
          Alert.alert('Error', 'Rejection reason is required');
          return;
        }

        Alert.alert(
          t('declineRequest'),
          t('declineRequestMessage', { name: request.user_name }),
          [
            { text: t('cancel'), style: 'cancel' },
            {
              text: t('decline'),
              style: 'destructive',
              onPress: async () => {
                try {
                  await rejectWithdrawalRequest(request.id, {
                    rejection_reason: reason.trim()
                  });

                  setExpandedRequest(null);
                  Alert.alert(
                    t('success'),
                    t('requestDeclined', { name: request.user_name })
                  );
                } catch (error) {
                  Alert.alert('Error', error.message);
                }
              }
            }
          ]
        );
      },
      'plain-text'
    );
  };

  const handleWithdrawalRequestSuccess = () => {
    // Refresh the data to show the new request
    handleRefresh();

    // Optionally switch to "All" filter to show the new request
    setSelectedStatus(null);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'Approved':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'Processed':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'Rejected':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const renderStatusTabs = () => (
    <View className="flex-row bg-white px-4 py-3 mb-4 border-b border-app-border">
      <FlatList
        data={STATUS_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key || 'all'}
        renderItem={({ item }) => {
          const isSelected = selectedStatus === item.key;
          return (
            <TouchableOpacity
              onPress={() => handleStatusFilter(item.key)}
              className={`mr-4 px-4 py-2 rounded-full ${isSelected
                ? 'bg-app-primary'
                : 'bg-app-surface border border-app-border'
                }`}
            >
              <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-app-text-secondary'
                }`}>
                {t(item.label.toLowerCase()) || item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );

  const renderWithdrawalRequest = ({ item }) => {
    const isExpanded = expandedRequest === item.id;
    const isPending = item.status === 'Pending';
    const statusColors = getStatusColor(item.status);
    const initials = getInitials(item.user_name);

    return (
      <View className={`rounded-lg mb-4 mx-4 overflow-hidden bg-white ${isExpanded ? 'border-2 border-app-primary' : 'border border-app-border'
        }`}>
        {/* Main Request Card */}
        <TouchableOpacity
          className="p-4"
          onPress={() => handleToggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full mr-4 bg-app-primary-light justify-center items-center">
              <Text className="text-app-primary font-semibold text-sm">
                {initials}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-base font-semibold text-app-text-primary">
                {item.user_name}
              </Text>
              <Text className="text-sm text-app-text-secondary">
                {item.user_email}
              </Text>
              <Text className="text-xs text-app-text-tertiary mt-1">
                {item.site_name} • {WithdrawalRequestService.formatDate(item.requested_at)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-xl font-bold text-app-text-primary">
                KES {parseFloat(item.amount).toLocaleString()}
              </Text>

              {/* Status Badge */}
              <View className={`px-2 py-1 rounded-full mt-2 ${statusColors.bg}`}>
                <Text className={`text-xs font-medium ${statusColors.text}`}>
                  {item.status}
                </Text>
              </View>

              {/* Expand/Collapse Indicator */}
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color="#9E9E9E"
                style={{ marginTop: 4 }}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Details and Actions */}
        {isExpanded && (
          <View className="px-4 pb-4">
            <View className="h-px bg-app-border mb-4" />

            {/* Additional Details */}
            <View className="mb-4 space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-app-text-secondary">Reference:</Text>
                <Text className="text-sm font-medium text-app-text-primary">
                  {item.request_reference}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-app-text-secondary">Wallet Balance:</Text>
                <Text className="text-sm font-medium text-app-text-primary">
                  KES {parseFloat(item.wallet_balance_at_request).toLocaleString()}
                </Text>
              </View>

              {item.rejection_reason && (
                <View className="mt-2">
                  <Text className="text-sm text-app-text-secondary mb-1">Rejection Reason:</Text>
                  <Text className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {item.rejection_reason}
                  </Text>
                </View>
              )}

              {item.manager_provided_phone && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-app-text-secondary">Payment Phone:</Text>
                  <Text className="text-sm font-medium text-app-text-primary">
                    {item.manager_provided_phone}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons - Only for Pending Requests */}
            {isPending && isSiteManager() && (
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-app-danger rounded-lg py-3"
                  onPress={() => handleReject(item)}
                  disabled={isRejecting}
                >
                  {isRejecting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      {t('decline')}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-1 bg-app-primary rounded-lg py-3"
                  onPress={() => handleApprove(item)}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      {t('approve')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons
        name="document-text-outline"
        size={64}
        color="#CBD5E1"
      />
      <Text className="text-app-text-tertiary text-lg mb-2 mt-4">
        {t('noRequests')}
      </Text>
      <Text className="text-app-text-tertiary text-sm text-center px-8">
        {selectedStatus === 'Pending'
          ? (t('noPendingRequests') || 'No pending withdrawal requests at the moment.')
          : (t('noRequestsDescription') || 'No requests found for the selected filter.')
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <ActivityIndicator size="large" color="#007AFF" />
      <Text className="text-app-text-secondary mt-4">Loading requests...</Text>
    </View>
  );

  const requests = managerWithdrawalRequests?.results || [];

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <AppleStyleHeader
        title={t("withdrawalRequests") || "Withdrawal Requests"}
      />

      {/* Status Filter Tabs */}
      {renderStatusTabs()}

      {/* Error Message */}
      {error && (
        <View className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text className="text-red-600 ml-2 flex-1">{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      {isLoading && requests.length === 0 ? (
        renderLoadingState()
      ) : requests.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => `request-${item.id}`}
          renderItem={renderWithdrawalRequest}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }} // Extra padding for FAB
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListFooterComponent={() => {
            // Pagination would go here if needed
            if (managerWithdrawalRequests?.next) {
              return (
                <TouchableOpacity
                  className="mx-4 py-3 bg-app-surface rounded-lg items-center mb-4"
                  onPress={() => {
                    // Implement load more functionality
                    setCurrentPage(currentPage + 1);
                  }}
                >
                  <Text className="text-app-primary font-medium">Load More</Text>
                </TouchableOpacity>
              );
            }
            return null;
          }}
        />
      )}

      {/* Floating Action Button */}
      <WithdrawalRequestFAB onSuccess={handleWithdrawalRequestSuccess} />

      {/* Loading overlay for actions */}
      {(isApproving || isRejecting) && (
        <View className="absolute inset-0 bg-black/20 justify-center items-center">
          <View className="bg-white p-6 rounded-lg items-center">
            <ActivityIndicator size="large" color="#007AFF" />
            <Text className="mt-3 text-app-text-primary">
              {isApproving ? 'Approving request...' : 'Rejecting request...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}