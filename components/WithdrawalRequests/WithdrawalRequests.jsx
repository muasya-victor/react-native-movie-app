import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import AppleStyleHeader from "../common/AppleStyleHeader";
import translations from './translations.json';

export default function WithdrawalRequestsComponent() {
  const router = useRouter();
  const { userType, isSiteManager, isSystemAdmin } = useAuth();
  const { t } = useTranslation(translations);
  const [expandedRequest, setExpandedRequest] = useState(null);

  // Mock withdrawal requests data
  const [withdrawalRequests, setWithdrawalRequests] = useState([
    {
      id: 1,
      workerName: "Liam Carter",
      workerPhone: "1234567890",
      amount: 3000,
      status: "pending",
      requestDate: "2024-08-21",
      initials: "LC"
    },
    {
      id: 2,
      workerName: "Oliver Hayes",
      workerPhone: "1234567890",
      amount: 2500,
      status: "pending",
      requestDate: "2024-08-21",
      initials: "OH"
    },
    {
      id: 3,
      workerName: "Elijah Foster",
      workerPhone: "1234567890",
      amount: 1800,
      status: "pending",
      requestDate: "2024-08-20",
      initials: "EF"
    },
    {
      id: 4,
      workerName: "Lucas Reed",
      workerPhone: "1234567890",
      amount: 4200,
      status: "pending",
      requestDate: "2024-08-20",
      initials: "LR"
    }
  ]);

  const handleToggleExpand = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const handleApprove = (requestId, workerName, amount) => {
    Alert.alert(
      t('approveRequest'),
      t('approveRequestMessage', { name: workerName, amount: amount }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('approve'),
          onPress: () => {
            // Update the request status
            setWithdrawalRequests(prev =>
              prev.map(req =>
                req.id === requestId
                  ? { ...req, status: 'approved' }
                  : req
              )
            );
            setExpandedRequest(null); // Collapse after action
            Alert.alert(t('success'), t('requestApproved', { name: workerName }));
          }
        }
      ]
    );
  };

  const handleDecline = (requestId, workerName) => {
    Alert.alert(
      t('declineRequest'),
      t('declineRequestMessage', { name: workerName }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('decline'),
          style: 'destructive',
          onPress: () => {
            // Update the request status
            setWithdrawalRequests(prev =>
              prev.map(req =>
                req.id === requestId
                  ? { ...req, status: 'declined' }
                  : req
              )
            );
            setExpandedRequest(null); // Collapse after action
            Alert.alert(t('success'), t('requestDeclined', { name: workerName }));
          }
        }
      ]
    );
  };

  const renderPendingRequest = ({ item }) => {
    const isExpanded = expandedRequest === item.id;

    return (
      <View className={`rounded-lg mb-4 mx-4 overflow-hidden ${isExpanded ? 'bg-app-primary-light' : ''
        }`}>
        {/* Main Request Card - Always Visible */}
        <TouchableOpacity
          className="p-4"
          onPress={() => handleToggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full mr-4 bg-app-primary-light justify-center items-center">
              <Text className="text-app-primary font-semibold text-sm">
                {item.initials}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-app-text-primary">
                {item.workerName}
              </Text>
              <Text className="text-sm text-app-text-secondary">
                {item.workerPhone}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xl font-bold text-app-text-primary">
                KES {item.amount.toLocaleString()}
              </Text>
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

        {/* Action Buttons - Only Visible When Expanded */}
        {isExpanded && (
          <View className="px-4 pb-4">
            <View className="h-px bg-app-border mb-4" />
            <View className="flex-row space-x-3">
              {/* <TouchableOpacity 
                className="flex-1 bg-app-danger rounded-lg py-3"
                onPress={() => handleDecline(item.id, item.workerName)}
              >
                <Text className="text-white text-center font-semibold">
                  {t('decline')}
                </Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                className="flex-1 bg-app-primary rounded-lg py-3"
                onPress={() => handleApprove(item.id, item.workerName, item.amount)}
              >
                <Text className="text-white text-center font-semibold">
                  {t('approve')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderProcessedRequest = ({ item }) => (
    <TouchableOpacity
      className="bg-app-surface rounded-lg p-4 mb-3 mx-4"
      activeOpacity={0.6}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full mr-3 bg-app-surface-variant justify-center items-center">
          <Text className="text-app-text-secondary font-semibold text-xs">
            {item.initials}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium text-app-text-primary">
            {item.workerName}
          </Text>
          <Text className="text-xs text-app-text-tertiary">
            {item.workerPhone}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-sm font-bold text-app-text-primary">
            KES {item.amount.toLocaleString()}
          </Text>
          <View className={`px-2 py-1 rounded-full mt-1 ${item.status === 'approved'
            ? 'bg-app-primary-light'
            : 'bg-app-danger-light'
            }`}>
            <Text className={`text-xs font-medium ${item.status === 'approved'
              ? 'text-app-primary'
              : 'text-app-danger'
              }`}>
              {item.status === 'approved' ? t('approved') : t('declined')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const pendingRequests = withdrawalRequests.filter(req => req.status === 'pending');
  const processedRequests = withdrawalRequests.filter(req => req.status !== 'pending');

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}

      <AppleStyleHeader
        title={t("withdrawalRequests") || "Withdrawal Requests"}
      />

      <FlatList
        data={[]}
        ListHeaderComponent={() => (
          <View>
            {/* Pending Section */}
            {pendingRequests.length > 0 && (
              <View className="mt-6">
                <View className="px-4 mb-4">
                  <Text className="text-lg font-semibold text-app-text-primary">
                    {t('pending')}
                  </Text>
                </View>
                {pendingRequests.map((request) => (
                  <View key={`pending-${request.id}`}>
                    {renderPendingRequest({ item: request })}
                  </View>
                ))}
              </View>
            )}

            {/* Processed Section */}
            {processedRequests.length > 0 && (
              <View className="mt-6">
                <View className="px-4 mb-4">
                  <Text className="text-lg font-semibold text-app-text-primary">
                    {t('processed')}
                  </Text>
                </View>
                {processedRequests.map((request) => (
                  <View key={`processed-${request.id}`}>
                    {renderProcessedRequest({ item: request })}
                  </View>
                ))}
              </View>
            )}

            {/* Empty State */}
            {withdrawalRequests.length === 0 && (
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-app-text-tertiary text-lg mb-2">
                  {t('noRequests')}
                </Text>
                <Text className="text-app-text-tertiary text-sm text-center">
                  {t('noRequestsDescription')}
                </Text>
              </View>
            )}

            {/* Hint Text */}
            {pendingRequests.length > 0 && (
              <View className="px-4 py-2 mb-4">
                <Text className="text-app-text-tertiary text-sm text-center">
                  {t('tapToExpand')}
                </Text>
              </View>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}