// components/withdrawal/WithdrawalRequestFAB.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSiteStore } from "../../store/siteStore";
import { useWithdrawalRequestStore } from "../../store/withdrawalRequestStore";
// Import your translation hook if available
// import { useTranslation } from "../../hooks/useTranslation";

interface WithdrawalRequestFABProps {
  onSuccess?: () => void;
  disabled?: boolean;
}

export default function WithdrawalRequestFAB({
  onSuccess,
  disabled = false,
}: WithdrawalRequestFABProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Stores
  const { selectedSite } = useSiteStore();
  const { createWithdrawalRequest, isCreating, error, clearError } =
    useWithdrawalRequestStore();

  // Translation hook (if available)
  const t = (key: string, fallback?: string) => {
    // You can implement this based on your translation system
    // For now, return the fallback or key
    return fallback || key;
  };

  const handleOpenModal = () => {
    if (!selectedSite) {
      Alert.alert(
        t("noSiteSelected", "No Site Selected"),
        t(
          "noSiteSelectedMessage",
          "Please select a site before requesting a withdrawal."
        ),
        [{ text: t("ok", "OK") }]
      );
      return;
    }

    clearError();
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setAmount("");
    clearError();
  };

  const validateAmount = (amountString: string): boolean => {
    const numAmount = parseFloat(amountString);

    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(
        t("invalidAmount", "Invalid Amount"),
        t(
          "invalidAmountMessage",
          "Please enter a valid amount greater than 0."
        ),
        [{ text: t("ok", "OK") }]
      );
      return false;
    }

    if (numAmount < 1) {
      Alert.alert(
        t("minimumAmount", "Minimum Amount"),
        t("minimumAmountMessage", "Minimum withdrawal amount is KES 1."),
        [{ text: t("ok", "OK") }]
      );
      return false;
    }

    // You can add maximum amount validation here if needed
    if (numAmount > 1000000) {
      Alert.alert(
        t("maximumAmount", "Maximum Amount"),
        t(
          "maximumAmountMessage",
          "Maximum withdrawal amount is KES 1,000,000."
        ),
        [{ text: t("ok", "OK") }]
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!selectedSite) {
      Alert.alert(
        t("error", "Error"),
        t("noSiteError", "No site selected. Please select a site first."),
        [{ text: t("ok", "OK") }]
      );
      return;
    }

    const trimmedAmount = amount.trim();
    if (!trimmedAmount) {
      Alert.alert(
        t("error", "Error"),
        t("amountRequired", "Amount is required."),
        [{ text: t("ok", "OK") }]
      );
      return;
    }

    if (!validateAmount(trimmedAmount)) {
      return;
    }

    const numericAmount = parseFloat(trimmedAmount);

    // Show confirmation dialog
    Alert.alert(
      t("confirmWithdrawal", "Confirm Withdrawal"),
      t(
        "confirmWithdrawalMessage",
        `Are you sure you want to request a withdrawal of KES ${numericAmount.toLocaleString()} from ${
          selectedSite.name
        }?`
      ),
      [
        {
          text: t("cancel", "Cancel"),
          style: "cancel",
        },
        {
          text: t("confirm", "Confirm"),
          onPress: async () => {
            try {
              setIsValidating(true);

              await createWithdrawalRequest({
                site_id: selectedSite.id,
                amount: numericAmount,
              });

              // Success
              handleCloseModal();

              Alert.alert(
                t("success", "Success"),
                t(
                  "withdrawalRequestSuccess",
                  `Withdrawal request for KES ${numericAmount.toLocaleString()} has been submitted successfully. You will be notified once it's processed.`
                ),
                [
                  {
                    text: t("ok", "OK"),
                    onPress: () => {
                      // Call success callback if provided
                      onSuccess?.();
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert(
                t("error", "Error"),
                error.message ||
                  t(
                    "withdrawalRequestError",
                    "Failed to submit withdrawal request. Please try again."
                  ),
                [{ text: t("ok", "OK") }]
              );
            } finally {
              setIsValidating(false);
            }
          },
        },
      ]
    );
  };

  const formatAmountInput = (text: string) => {
    // Remove any non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, "");

    // Ensure only one decimal point
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }

    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmountInput(text);
    setAmount(formatted);
  };

  if (disabled) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-app-primary rounded-full shadow-lg items-center justify-center elevation-8"
        onPress={handleOpenModal}
        activeOpacity={0.8}
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Withdrawal Request Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl px-6 py-6">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-app-text-primary">
                  {t("newWithdrawalRequest", "New Withdrawal Request")}
                </Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  className="p-2"
                  disabled={isCreating || isValidating}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Site Information */}
              {selectedSite && (
                <View className="mb-6 p-4 bg-app-surface rounded-lg">
                  <Text className="text-sm text-app-text-secondary mb-1">
                    {t("selectedSite", "Selected Site")}
                  </Text>
                  <Text className="text-base font-semibold text-app-text-primary">
                    {selectedSite.name}
                  </Text>
                  <Text className="text-sm text-app-text-secondary">
                    {selectedSite.location}
                  </Text>
                </View>
              )}

              {/* Amount Input */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-app-text-primary mb-3">
                  {t("withdrawalAmount", "Withdrawal Amount")}
                </Text>
                <View className="flex-row items-center border border-app-border rounded-lg px-4 py-4 bg-white">
                  <Text className="text-base font-medium text-app-text-secondary mr-2">
                    KES
                  </Text>
                  <TextInput
                    value={amount}
                    onChangeText={handleAmountChange}
                    placeholder={t("enterAmount", "Enter amount")}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    className="flex-1 text-base text-app-text-primary font-medium"
                    autoFocus
                    editable={!isCreating && !isValidating}
                  />
                </View>

                {/* Amount Preview */}
                {amount && !isNaN(parseFloat(amount)) && (
                  <Text className="text-sm text-app-text-secondary mt-2">
                    {t("requestAmount", "Request Amount")}: KES{" "}
                    {parseFloat(amount).toLocaleString()}
                  </Text>
                )}
              </View>

              {/* Error Message */}
              {error && (
                <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <Text className="text-red-600 text-sm">{error}</Text>
                </View>
              )}

              {/* Disclaimer */}
              <View className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <View className="flex-row items-start">
                  <Ionicons
                    name="information-circle"
                    size={16}
                    color="#F59E0B"
                    className="mr-2 mt-0.5"
                  />
                  <Text className="text-sm text-yellow-800 flex-1">
                    {t(
                      "withdrawalDisclaimer",
                      "Withdrawal requests are subject to approval by site managers. Processing may take 1-3 business days."
                    )}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className="flex-1 py-4 bg-app-surface border border-app-border rounded-lg"
                  onPress={handleCloseModal}
                  disabled={isCreating || isValidating}
                >
                  <Text className="text-center text-app-text-secondary font-semibold">
                    {t("cancel", "Cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 py-4 rounded-lg ${
                    isCreating || isValidating || !amount.trim()
                      ? "bg-gray-300"
                      : "bg-app-primary"
                  }`}
                  onPress={handleSubmit}
                  disabled={isCreating || isValidating || !amount.trim()}
                >
                  {isCreating || isValidating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-center text-white font-semibold">
                      {t("submitRequest", "Submit Request")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}
