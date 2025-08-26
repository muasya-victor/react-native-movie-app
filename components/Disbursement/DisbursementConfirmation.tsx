// components/Disbursement/DisbursementConfirmation.tsx
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  DollarSign,
  Users,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { DisbursementService } from "../../services/disbursementService";
import { useDisbursementStore } from "../../store/disbursementStore";
import { useSiteStore } from "../../store/siteStore";
import translations from "./translations2.json";

// Custom Checkbox Component for a consistent look
const CustomCheckbox = ({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onValueChange}
      className="w-6 h-6 mr-4 justify-center items-center border-2 rounded"
      style={{
        borderColor: value ? "#4CAF50" : "#ccc",
        backgroundColor: value ? "#4CAF50" : "transparent",
      }}
    >
      {value && <Check size={16} color="white" />}
    </TouchableOpacity>
  );
};

export default function DisbursementConfirmation() {
  const router = useRouter();
  const { t } = useTranslation(translations);
  const { selectedSite } = useSiteStore();

  const {
    preview,
    isLoadingPreview,
    isCreatingDisbursement,
    previewError,
    getDisbursementPreview,
    createDisbursement,
  } = useDisbursementStore();

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Memoize the list of eligible users to avoid recalculating
  const eligibleUsers = useMemo(
    () =>
      preview?.summary.users.filter(
        (user) => user.net_disbursement_amount > 0
      ) || [],
    [preview]
  );

  // Get the site ID from store
  const currentSiteId = selectedSite?.id;
  const currentSiteName = selectedSite?.name || `Site ${currentSiteId}`;

  // Load disbursement preview on component mount
  useEffect(() => {
    if (currentSiteId) {
      loadDisbursementPreview();
    }
  }, [currentSiteId]);

  // When preview data is loaded, select all eligible users by default
  useEffect(() => {
    if (preview) {
      const allEligibleUserIds = eligibleUsers.map((user) => user.id);
      setSelectedUserIds(allEligibleUserIds);
    }
  }, [preview, eligibleUsers]);

  const loadDisbursementPreview = async () => {
    if (!currentSiteId) return;
    try {
      await getDisbursementPreview(currentSiteId);
    } catch (error) {
      console.error("Failed to load disbursement preview:", error);
    }
  };

  const handleToggleUserSelection = (userId: number) => {
    setSelectedUserIds((prevSelectedIds) =>
      prevSelectedIds.includes(userId)
        ? prevSelectedIds.filter((id) => id !== userId)
        : [...prevSelectedIds, userId]
    );
  };

  const handleToggleSelectAll = () => {
    const allEligibleUserIds = eligibleUsers.map((user) => user.id);
    if (selectedUserIds.length === allEligibleUserIds.length) {
      // If all are selected, deselect all
      setSelectedUserIds([]);
    } else {
      // Otherwise, select all
      setSelectedUserIds(allEligibleUserIds);
    }
  };

  const { selectedUsersCount, selectedTotalAmount } = useMemo(() => {
    if (!preview) {
      return { selectedUsersCount: 0, selectedTotalAmount: 0 };
    }
    const selectedUsers = eligibleUsers.filter((user) =>
      selectedUserIds.includes(user.id)
    );
    const totalAmount = selectedUsers.reduce(
      (acc, user) => acc + user.net_disbursement_amount,
      0
    );
    return {
      selectedUsersCount: selectedUsers.length,
      selectedTotalAmount: totalAmount,
    };
  }, [preview, selectedUserIds, eligibleUsers]);

  const handleConfirmDisbursement = async () => {
    if (!currentSiteId || !preview || selectedUserIds.length === 0) return;

    try {
      const request = {
        site_id: currentSiteId,
        user_ids: selectedUserIds,
      };

      const result = await createDisbursement(request);

      if (result) {
        router.replace({
          pathname: "/(tabs)/disbursements/success-page",
          params: {
            disbursementId: result?.id?.toString(),
            totalAmount: result.total_amount_disbursed,
            userCount: result.total_users_disbursed,
            siteName: result.site_name,
            disbursementTime: result.disbursement_time,
            disbursedBy: result.disbursed_by_name,
          },
        });
      }
    } catch (error) {
      Alert.alert(t("disbursementError"), (error as Error).message);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // --- Render logic for loading, error, and no data states ---
  // (These sections remain unchanged)

  if (isLoadingPreview) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-app-text-primary">
            {t("confirmDisbursement")}
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text className="text-app-text-secondary mt-4">
            {t("loadingPreview")}
          </Text>
        </View>
      </View>
    );
  }

  if (previewError) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-app-text-primary">
            {t("confirmDisbursement")}
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-secondary text-center mb-4">
            {previewError}
          </Text>
          <TouchableOpacity
            className="bg-app-primary px-6 py-3 rounded-lg mb-2"
            onPress={loadDisbursementPreview}
          >
            <Text className="text-white font-medium">{t("retry")}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="px-6 py-3" onPress={() => router.back()}>
            <Text className="text-app-text-secondary font-medium">
              {t("goBack")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!preview) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-app-text-primary">
            {t("confirmDisbursement")}
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-app-text-secondary text-center mb-4">
            {t("noPreviewData")}
          </Text>
          <TouchableOpacity
            className="bg-app-primary px-6 py-3 rounded-lg"
            onPress={() => router.back()}
          >
            <Text className="text-white font-medium">{t("goBack")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- Main content when preview is loaded ---
  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-app-text-primary">
          {t("confirmDisbursement")}
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Site Info */}
        <View className="px-4 py-6 bg-white border-b border-app-border">
          <Text className="text-2xl font-bold text-app-text-primary mb-1">
            {currentSiteName}
          </Text>
          <Text className="text-app-text-secondary">
            {t("disbursementConfirmation")}
          </Text>
        </View>

        {/* Summary Cards */}
        <View className="px-4 py-6 ">
          <View className="space-y-4 gap-4 mb-6">
            {/* Total Amount Card */}
            <View className="bg-app-surface rounded-2xl p-6 border border-app-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-app-text-secondary text-sm mb-1">
                    {t("totalAmountToDisburse")}
                  </Text>
                  <Text className="text-3xl font-bold text-app-primary">
                    {DisbursementService.formatCurrency(selectedTotalAmount)}
                  </Text>
                </View>
                <View className="bg-app-primary-light rounded-full p-3">
                  <DollarSign size={24} color="#4CAF50" />
                </View>
              </View>
            </View>

            {/* Users Count Card */}
            <View className="bg-app-surface rounded-2xl p-6 border border-app-border">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-app-text-secondary text-sm mb-1">
                    {t("totalUsers")}
                  </Text>
                  <Text className="text-3xl font-bold text-app-text-primary">
                    {selectedUsersCount}
                  </Text>
                  <Text className="text-app-text-secondary text-sm mt-1">
                    {t("usersWillReceiveFunds")}
                  </Text>
                </View>
                <View className="bg-app-info-light rounded-full p-3">
                  <Users size={24} color="#2196F3" />
                </View>
              </View>
            </View>
          </View>

          {/* Users List */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-app-text-primary">
                {t("recipientUsers")}
              </Text>
              <TouchableOpacity onPress={handleToggleSelectAll}>
                <Text className="text-app-primary font-semibold">
                  {selectedUserIds.length === eligibleUsers.length
                    ? t("deselectAll")
                    : t("selectAll")}
                </Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-3 gap-2">
              {eligibleUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  className="bg-app-surface rounded-xl p-4 border border-app-border flex-row items-center"
                  onPress={() => handleToggleUserSelection(user.id)}
                >
                  <CustomCheckbox
                    value={selectedUserIds.includes(user.id)}
                    onValueChange={() => handleToggleUserSelection(user.id)}
                  />
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-app-text-primary mb-1">
                      {user.user_name}
                    </Text>
                    <Text className="text-app-text-secondary text-sm">
                      {user.user_phone}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-app-primary font-bold text-lg text-right">
                      {DisbursementService.formatCurrency(
                        user.net_disbursement_amount
                      )}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 py-6 bg-white border-t border-app-border">
        <View className="space-y-3">
          <TouchableOpacity
            className={`py-4 rounded-xl flex-row items-center justify-center ${
              isCreatingDisbursement || selectedUserIds.length === 0
                ? "bg-app-primary-disabled"
                : "bg-app-primary"
            }`}
            onPress={handleConfirmDisbursement}
            disabled={isCreatingDisbursement || selectedUserIds.length === 0}
          >
            {isCreatingDisbursement ? (
              <ActivityIndicator size="small" color="white" className="mr-2" />
            ) : (
              <CheckCircle size={20} color="white" className="mr-2" />
            )}
            <Text className="text-white font-semibold text-lg">
              {isCreatingDisbursement ? t("processing") : t("confirmDisburse")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 rounded-xl border border-app-border flex-row items-center justify-center"
            onPress={handleCancel}
            disabled={isCreatingDisbursement}
          >
            <Text className="text-app-text-primary font-semibold text-lg">
              {t("cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
