// components/Disbursement/DisbursementSuccess.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, Home } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTranslation } from "@/hooks/useTranslation";
import { DisbursementService } from "../../services/disbursementService";
import { useDisbursementStore } from "../../store/disbursementStore";
import translations from "./translations2.json";

export default function DisbursementSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { t } = useTranslation(translations);
  const { lastDisbursementResult } = useDisbursementStore();

  // Get data from params or store
  const disbursementData = lastDisbursementResult?.data;

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  const handleViewTransactions = () => {
    router.replace("/(tabs)/transactions");
  };

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <ScrollView className="flex-1">
        {/* Success Header */}
        <View className="px-4 py-12 items-center bg-white">
          <View className="bg-green-100 rounded-full p-4 mb-4">
            <CheckCircle2 size={48} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-app-text-primary mb-2 text-center">
            {t("disbursementSuccessful")}
          </Text>
          <Text className="text-app-text-secondary text-center">
            {t("disbursementCompletedMessage")}
          </Text>
        </View>

        {/* Disbursement Summary */}
        <View className="px-4 py-6">
          <View className="bg-app-surface rounded-2xl p-6 border border-app-border mb-6">
            <Text className="text-lg font-semibold text-app-text-primary mb-4">
              {t("disbursementSummary")}
            </Text>

            <View className="space-y-4">
              {/* Disbursement ID */}
              <View className="flex-row justify-between items-center">
                <Text className="text-app-text-secondary">
                  {t("disbursementId")}
                </Text>
                <Text className="text-app-text-primary font-semibold">
                  {disbursementData.id}
                </Text>
              </View>

              {/* Site Name */}
              <View className="flex-row justify-between items-center">
                <Text className="text-app-text-secondary">{t("site")}</Text>
                <Text className="text-app-text-primary font-semibold">
                  {disbursementData.site_name}
                </Text>
              </View>

              {/* Total Amount */}
              <View className="flex-row justify-between items-center">
                <Text className="text-app-text-secondary">
                  {t("totalAmountDisbursed")}
                </Text>
                <Text className="text-app-primary font-bold text-xl">
                  {DisbursementService.formatCurrency(
                    disbursementData.total_amount_disbursed
                  )}
                </Text>
              </View>

              {/* Users Count */}
              <View className="flex-row justify-between items-center">
                <Text className="text-app-text-secondary">
                  {t("usersReceived")}
                </Text>
                <Text className="text-app-text-primary font-semibold">
                  {disbursementData.total_users_disbursed} {t("users")}
                </Text>
              </View>

              {/* Disbursed By */}
              {disbursementData.disbursed_by_name && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-app-text-secondary">
                    {t("disbursedBy")}
                  </Text>
                  <Text className="text-app-text-primary font-semibold">
                    {disbursementData.disbursed_by_name}
                  </Text>
                </View>
              )}

              {/* Date & Time */}
              <View className="flex-row justify-between items-center">
                <Text className="text-app-text-secondary">{t("dateTime")}</Text>
                <Text className="text-app-text-primary font-semibold">
                  {formatDate(disbursementData.disbursement_time)}
                </Text>
              </View>
            </View>
          </View>

          {/* Recipient Details */}
          {disbursementData.disbursement_details &&
            disbursementData.disbursement_details.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-app-text-primary mb-4">
                  {t("recipientDetails")}
                </Text>
                <View className="space-y-3">
                  {disbursementData.disbursement_details.map(
                    (detail, index) => (
                      <View
                        key={detail.id || index}
                        className="bg-app-surface rounded-xl p-4 border border-app-border"
                      >
                        <View className="flex-row items-start justify-between mb-3">
                          <View className="flex-1">
                            <Text className="text-base font-semibold text-app-text-primary mb-1">
                              {detail.user_name}
                            </Text>
                            <Text className="text-app-text-secondary text-sm mb-1">
                              {detail.user_phone}
                            </Text>
                            {detail.user_email && (
                              <Text className="text-app-text-secondary text-sm">
                                {detail.user_email}
                              </Text>
                            )}
                          </View>
                          <View className="bg-app-primary-light rounded-full px-3 py-1">
                            <Text className="text-app-primary font-semibold text-sm">
                              #{detail.in_favor_of_user}
                            </Text>
                          </View>
                        </View>

                        <View className="space-y-2">
                          <View className="flex-row justify-between items-center">
                            <Text className="text-app-text-secondary text-sm">
                              {t("amountReceived")}
                            </Text>
                            <Text className="text-app-primary font-bold text-lg">
                              {DisbursementService.formatCurrency(
                                detail.amount
                              )}
                            </Text>
                          </View>

                          <View className="flex-row justify-between items-center">
                            <Text className="text-app-text-secondary text-sm">
                              {t("walletBalanceBefore")}
                            </Text>
                            <Text className="text-app-text-primary font-medium">
                              {DisbursementService.formatCurrency(
                                detail.wallet_balance_before
                              )}
                            </Text>
                          </View>

                          <View className="flex-row justify-between items-center">
                            <Text className="text-app-text-secondary text-sm">
                              {t("walletBalanceAfter")}
                            </Text>
                            <Text className="text-app-primary font-medium">
                              {DisbursementService.formatCurrency(
                                detail.wallet_balance_after
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 py-6 bg-white border-t border-app-border">
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-app-primary py-4 rounded-xl flex-row items-center justify-center"
            onPress={handleGoHome}
          >
            <Home size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold text-lg ml-2">
              {t("goToHome")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
