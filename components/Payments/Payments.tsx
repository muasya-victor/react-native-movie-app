// components/Payments/Payments.tsx
import { useRouter } from "expo-router";
import {
  ArrowRight,
  ChevronDown,
  Clock,
  DollarSign,
  Users,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
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
import AppleStyleHeader from "../common/AppleStyleHeader";
import translations from "./translations.json";

interface PaymentsProps {
  siteId?: number; // Optional prop for site ID, fallback to store
}

export default function Payments({ siteId }: PaymentsProps) {
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
    clearErrors,
    clearPreview,
  } = useDisbursementStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Get the site ID from props or store
  const currentSiteId = siteId || selectedSite?.id;
  const currentSiteName = selectedSite?.name || `Site ${currentSiteId}`;

  // Load disbursement preview on component mount
  useEffect(() => {
    if (currentSiteId) {
      loadDisbursementPreview();
    }
  }, [currentSiteId]);

  const loadDisbursementPreview = async () => {
    if (!currentSiteId) return;

    try {
      await getDisbursementPreview(currentSiteId);
    } catch (error) {
      // Error is handled in store and will show toast in UI
      console.error("Failed to load disbursement preview:", error);
    }
  };

  const handleRefresh = async () => {
    if (!currentSiteId) return;

    setRefreshing(true);
    try {
      clearErrors();
      await getDisbursementPreview(currentSiteId);
    } catch (error) {
      // Handle error with toast notification following the app pattern
      Alert.alert(t("disbursementError"), (error as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisburse = async () => {
    if (!currentSiteId || !preview) return;
    router.push("/(tabs)/disbursements/confirmation-page");

    // Confirm disbursement action
    // Alert.alert(
    //   t("confirmDisbursement"),
    //   `${t("confirmDisbursementMessage")
    //     .replace(
    //       "{{amount}}",
    //       DisbursementService.formatCurrency(
    //         preview.summary.total_net_disbursement_amount
    //       )
    //     )
    //     .replace(
    //       "{{userCount}}",
    //       preview.summary?.total_users_eligible.toString()
    //     )}`,
    //   [
    //     {
    //       text: t("cancel"),
    //       style: "cancel",
    //     },
    //     {
    //       text: t("disburse"),
    //       style: "default",
    //       onPress: processDisbursement,
    //     },
    //   ]
    // );
  };

  const processDisbursement = async () => {
    if (!currentSiteId || !preview) return;

    try {
      const eligibleUserIds = DisbursementService.getEligibleUserIds(preview);

      const request = {
        site_id: currentSiteId,
        user_ids: eligibleUserIds,
      };

      const result = await createDisbursement(request);

      if (result) {
        // Show success toast
        Alert.alert(t("disbursementSuccess"));

        // Navigate to disbursement result screen
        router.push({
          pathname: "/disbursement-result",
          params: {
            disbursementId: result.id.toString(),
            totalAmount: result.total_amount_disbursed,
            userCount: result.total_users_disbursed,
          },
        });
      }
    } catch (error) {
      // Error is handled in store and will show toast
      Alert.alert(t("disbursementError"), (error as Error).message);
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // No site selected state
  if (!currentSiteId) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Header */}
        {/* <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-2xl text-app-text-primary">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-semibold text-app-text-primary">
            {t("title")}
          </Text>
        </View> */}
        <AppleStyleHeader title={t("title")} />

        {/* No Site Selected */}
        <View className="flex-1 items-center justify-center px-4">
          <View className="bg-app-surface rounded-2xl p-8 w-full max-w-sm items-center">
            <View className="bg-app-warning-light rounded-full p-4 mb-4">
              <Users size={32} color="#F59E0B" />
            </View>
            <Text className="text-lg font-semibold text-app-text-primary mb-2 text-center">
              {t("noSiteSelected")}
            </Text>
            <Text className="text-app-text-secondary text-center mb-6">
              {t("selectSite")}
            </Text>
            <TouchableOpacity
              className="bg-app-primary px-6 py-3 rounded-lg"
              onPress={() => router.push("/sites")}
            >
              <Text className="text-white font-medium">{t("selectSite")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Error state
  if (previewError && !isLoadingPreview) {
    return (
      <View className="flex-1 bg-app-background">
        <StatusBar barStyle="dark-content" backgroundColor="white" />

        {/* Header */}
        <AppleStyleHeader title={t("title")} />

        {/* Error State */}
        <View className="flex-1 items-center justify-center px-4">
          <View className="bg-app-surface rounded-2xl p-8 w-full max-w-sm items-center">
            <View className="bg-app-danger-light rounded-full p-4 mb-4">
              <Text className="text-2xl">⚠️</Text>
            </View>
            <Text className="text-lg font-semibold text-app-text-primary mb-2 text-center">
              {t("errorLoadingPreview")}
            </Text>
            <Text className="text-app-text-secondary text-center mb-6">
              {previewError}
            </Text>
            <TouchableOpacity
              className="bg-app-primary px-6 py-3 rounded-lg"
              onPress={loadDisbursementPreview}
            >
              <Text className="text-white font-medium">{t("retry")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Main content
  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <AppleStyleHeader title={t("title")} />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4CAF50"]}
            title={t("pullToRefresh")}
          />
        }
      >
        {/* Site Info Header */}
        <View className="px-4 py-6 bg-white border-b border-app-border">
          <Text className="text-xl font-bold text-app-text-primary mb-1">
            {currentSiteName}
          </Text>
          <Text className="text-app-text-secondary">
            {t("siteDisbursement")}
          </Text>
        </View>

        {/* Loading State */}
        {isLoadingPreview && !preview ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text className="text-app-text-secondary mt-4">
              {t("loadingPreview")}
            </Text>
          </View>
        ) : preview ? (
          <>
            {/* Summary Cards */}
            <View className="px-4 py-6">
              <View className="space-y-6 gap-4">
                {/* Total Amount to Disburse Card */}
                <View className="bg-app-surface rounded-2xl p-6 border border-app-border">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-app-text-secondary text-sm mb-1">
                        {t("totalAmount")} (Total Wages Earned)
                      </Text>
                      <Text className="text-3xl font-bold text-app-primary">
                        {DisbursementService.formatCurrency(
                          preview.summary.total_pending_accrued_balance
                        )}
                      </Text>
                    </View>
                    <View className="bg-app-primary-light rounded-full p-3">
                      <DollarSign size={24} color="#4CAF50" />
                    </View>
                  </View>
                </View>

                {/* Eligible Users Card - Clickable */}
                <TouchableOpacity
                  onPress={() => setShowUserDetails(true)}
                  className="bg-app-surface rounded-2xl p-6 border border-app-border"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-app-text-secondary text-sm mb-1">
                        {t("eligibleUsers")}
                      </Text>
                      <Text className="text-3xl font-bold text-app-text-primary">
                        {preview.summary.total_users_eligible}
                      </Text>
                      <Text className="text-app-text-secondary text-xs mt-1">
                        {t("usersEligibleText")}
                      </Text>
                    </View>
                    <View className="bg-app-primary-light rounded-full p-3">
                      <Users size={24} color="#4CAF50" />
                    </View>
                  </View>
                  <View className="flex-row items-center justify-center mt-3 pt-3 border-t border-app-border/30">
                    <Text className="text-app-primary text-sm font-medium mr-2">
                      Tap to view user details
                    </Text>
                    <ChevronDown size={16} color="#4CAF50" />
                  </View>
                </TouchableOpacity>

                {/* Outstanding Loans Card */}
                <View className="bg-app-surface rounded-2xl p-6 border border-app-border">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-app-text-primary text-lg font-semibold">
                      Outstanding Loans
                    </Text>
                    <Clock size={20} color="#666" />
                  </View>
                  <View className="space-y-3">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-app-text-secondary">
                        Food Loans
                      </Text>
                      <Text className="text-app-text-primary font-semibold">
                        {DisbursementService.formatCurrency(
                          preview.summary.total_outstanding_food_loan
                        )}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-app-text-secondary">
                        Normal Loans
                      </Text>
                      <Text className="text-app-text-primary font-semibold">
                        {DisbursementService.formatCurrency(
                          preview.summary.total_outstanding_normal_loan_amount
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Disburse Button */}
            <View className="px-4 pb-8">
              <TouchableOpacity
                className={`rounded-2xl p-4 flex-row items-center justify-center ${
                  isCreatingDisbursement ||
                  preview.summary.total_users_eligible === 0
                    ? "bg-app-text-secondary"
                    : "bg-app-primary"
                }`}
                onPress={handleDisburse}
                disabled={
                  isCreatingDisbursement ||
                  preview.summary.total_users_eligible === 0
                }
              >
                {isCreatingDisbursement ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-semibold text-lg ml-3">
                      {t("disbursing")}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-semibold text-lg">
                      {t("disburse")}
                    </Text>
                    <ArrowRight size={20} color="white" className="ml-2" />
                  </>
                )}
              </TouchableOpacity>

              {preview.summary.total_users_eligible === 0 && (
                <Text className="text-app-text-secondary text-center mt-3 text-sm">
                  {t("noUsersEligible")}
                </Text>
              )}
            </View>
          </>
        ) : (
          /* No Data State */
          <View className="flex-1 items-center justify-center py-20">
            <View className="bg-app-surface rounded-2xl p-8 mx-4 items-center">
              <View className="bg-app-primary-light rounded-full p-4 mb-4">
                <DollarSign size={32} color="#4CAF50" />
              </View>
              <Text className="text-lg font-semibold text-app-text-primary mb-2 text-center">
                {t("noDisbursementData")}
              </Text>
              <Text className="text-app-text-secondary text-center">
                {t("refreshToLoad")}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* User Details Modal */}
      <Modal
        visible={showUserDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUserDetails(false)}
      >
        <View className="flex-1 bg-app-background">
          <StatusBar barStyle="dark-content" backgroundColor="white" />

          {/* Modal Header */}
          <View className="px-4 pt-12 pb-4 flex-row items-center justify-between border-b border-app-border bg-white">
            <Text className="text-xl font-semibold text-app-text-primary">
              Eligible Users ({preview?.summary.total_users_eligible})
            </Text>
            <TouchableOpacity
              onPress={() => setShowUserDetails(false)}
              className="bg-app-surface rounded-full p-2"
            >
              <X size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Users List */}
          <ScrollView className="flex-1 px-4 py-6">
            <View className="space-y-4">
              {preview?.summary.users.map((user, index) => (
                <View
                  key={user.id}
                  className="bg-app-surface rounded-2xl p-6 border border-app-border"
                >
                  <View className="flex-row items-start justify-between mb-4">
                    <View className="flex-1">
                      <Text className="text-lg font-semibold text-app-text-primary mb-1">
                        {user.user_name}
                      </Text>
                      <Text className="text-app-text-secondary text-sm mb-1">
                        {user.user_phone}
                      </Text>
                      {user.user_email && (
                        <Text className="text-app-text-secondary text-sm">
                          {user.user_email}
                        </Text>
                      )}
                    </View>
                    <View className="bg-app-primary-light rounded-full px-3 py-1">
                      <Text className="text-app-primary font-semibold text-sm">
                        #{user.id}
                      </Text>
                    </View>
                  </View>

                  <View className="space-y-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-app-text-secondary">
                        Wages Earned
                      </Text>
                      <Text className="text-app-text-primary font-semibold">
                        {DisbursementService.formatCurrency(
                          user.expected_accrual_amount
                        )}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-app-text-secondary">
                        Food Loans
                      </Text>
                      <Text className="text-app-text-primary">
                        -
                        {DisbursementService.formatCurrency(
                          user.outstanding_food_loan
                        )}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-app-text-secondary">
                        Normal Loans
                      </Text>
                      <Text className="text-app-text-primary">
                        -
                        {DisbursementService.formatCurrency(
                          user.outstanding_normal_loan_amount
                        )}
                      </Text>
                    </View>

                    <View className="h-px bg-app-border my-2"></View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-app-text-primary font-semibold">
                        Amount to Receive
                      </Text>
                      <Text className="text-app-primary font-bold text-lg">
                        {DisbursementService.formatCurrency(
                          user.net_disbursement_amount
                        )}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
