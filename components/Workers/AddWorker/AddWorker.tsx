import { useTranslation } from "@/hooks/useTranslation";
import { siteService } from "@/services/siteService";
import { useSiteStore } from "@/store/siteStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import translations from "./translations.json";

type WorkerRole = "member" | "manager";

export default function AddWorkerComponent() {
  const router = useRouter();
  const { t } = useTranslation(translations);

  // Zustand store
  const {
    selectedSite,
    addMembers,
    addManagers,
    isAddingMembers,
    isAddingManagers,
    siteError,
    clearSiteError,
  } = useSiteStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [role, setRole] = useState<WorkerRole>("member");

  const validateForm = () => {
    if (!selectedSite) {
      Alert.alert(t("error"), t("noSiteSelected") || "No site selected");
      return false;
    }
    if (!firstName.trim()) {
      Alert.alert(t("error"), t("pleaseEnterFirstName"));
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert(t("error"), t("pleaseEnterLastName"));
      return false;
    }
    if (!phoneNumber.trim()) {
      Alert.alert(t("error"), t("pleaseEnterPhoneNumber"));
      return false;
    }

    // Clean phone number and validate
    const cleanPhoneNumber = phoneNumber
      .replace(/\s+/g, "")
      .replace(/^\+254/, "");
    const phoneRegex = /^7\d{8}$/; // Kenyan mobile format
    if (!phoneRegex.test(cleanPhoneNumber)) {
      Alert.alert(
        t("error"),
        t("invalidPhoneNumber") || "Invalid phone number format"
      );
      return false;
    }
    return true;
  };

  const handleAddWorker = async () => {
    if (!validateForm() || !selectedSite) return;

    // Clear any previous errors
    clearSiteError();

    try {
      // Clean and format phone number
      const cleanPhoneNumber = phoneNumber
        .replace(/\s+/g, "")
        .replace(/^\+254/, "");

      // Create phone number input
      const phoneNumberInput = siteService.createPhoneNumberInput(
        "+254",
        cleanPhoneNumber,
        firstName.trim(),
        lastName.trim()
      );

      let success = false;

      if (role === "member") {
        const request = siteService.createAddMembersRequest(
          [],
          [phoneNumberInput]
        );
        success = await addMembers(selectedSite.id, request);
      } else {
        const request = siteService.createAddManagersRequest(
          [],
          [phoneNumberInput]
        );
        success = await addManagers(selectedSite.id, request);
      }

      if (success) {
        Alert.alert(
          t("success"),
          t("workerAdded") ||
            `${role === "member" ? "Member" : "Manager"} added successfully`,
          [
            {
              text: t("ok"),
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        // Error is already set in the store
        Alert.alert(t("error"), siteError || `Failed to add ${role}`);
      }
    } catch (error) {
      console.error("Error adding worker:", error);
      Alert.alert(
        t("error"),
        t("unexpectedError") || "An unexpected error occurred"
      );
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const isFormValid =
    firstName.trim() && lastName.trim() && phoneNumber.trim() && selectedSite;
  const isSubmitting = isAddingMembers || isAddingManagers;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View className="px-6 pt-14 pb-6 bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleCancel}
            className="w-8 h-8 justify-center items-center"
          >
            <Text className="text-2xl text-gray-700">✕</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            {t("title") || "Add Worker"}
          </Text>
          <View className="w-8 h-8" />
        </View>

        {/* Site Info */}
        {selectedSite && (
          <View className="mt-4 px-3 py-2 bg-blue-50 rounded-lg">
            <Text className="text-sm text-blue-700">
              {t("addingToSite") || "Adding to site"}: {selectedSite.name}
            </Text>
          </View>
        )}

        {!selectedSite && (
          <View className="mt-4 px-3 py-2 bg-red-50 rounded-lg">
            <Text className="text-sm text-red-700">
              {t("noSiteSelected") || "No site selected"}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: 24,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Role Selection */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {t("role") || "Role"}
          </Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                role === "member"
                  ? "bg-blue-50 border-blue-500"
                  : "bg-gray-50 border-gray-200"
              }`}
              onPress={() => setRole("member")}
            >
              <Text
                className={`text-center font-medium ${
                  role === "member" ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {t("member") || "Member"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                role === "manager"
                  ? "bg-green-50 border-green-500"
                  : "bg-gray-50 border-gray-200"
              }`}
              onPress={() => setRole("manager")}
            >
              <Text
                className={`text-center font-medium ${
                  role === "manager" ? "text-green-700" : "text-gray-700"
                }`}
              >
                {t("manager") || "Manager"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* First Name */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {t("firstName")}
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
            placeholder={t("enterFirstName")}
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isSubmitting}
            style={{
              fontSize: 16,
              fontFamily: "System",
            }}
          />
        </View>

        {/* Last Name */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {t("lastName")}
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-gray-900"
            placeholder={t("enterLastName")}
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isSubmitting}
            style={{
              fontSize: 16,
              fontFamily: "System",
            }}
          />
        </View>

        {/* Phone Number */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            {t("phoneNumber")}
          </Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl">
            <View className="px-4 py-4 border-r border-gray-200">
              <Text className="text-base text-gray-600">+254</Text>
            </View>
            <TextInput
              className="flex-1 px-4 py-4 text-base text-gray-900"
              placeholder="712345678"
              placeholderTextColor="#9CA3AF"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!isSubmitting}
              style={{
                fontSize: 16,
                fontFamily: "System",
              }}
            />
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            {t("phoneNumberHint") || "Enter phone number without country code"}
          </Text>
        </View>

        {/* Error Display */}
        {siteError && (
          <View className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <Text className="text-red-700 text-sm">{siteError}</Text>
            <TouchableOpacity onPress={clearSiteError} className="mt-2">
              <Text className="text-red-500 text-xs underline">
                {t("dismiss") || "Dismiss"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 pb-8 bg-white border-t border-gray-100">
        <View className="flex-row space-x-4 gap-4">
          {/* Cancel Button */}
          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-xl py-4 active:scale-95"
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Text className="text-gray-700 text-center text-lg font-semibold">
              {t("cancel")}
            </Text>
          </TouchableOpacity>

          {/* Add Worker Button */}
          <TouchableOpacity
            className={`flex-1 rounded-xl py-4 active:scale-95 ${
              isFormValid && !isSubmitting
                ? role === "manager"
                  ? "bg-green-500 shadow-lg"
                  : "bg-blue-500 shadow-lg"
                : "bg-gray-300"
            }`}
            onPress={handleAddWorker}
            disabled={!isFormValid || isSubmitting}
            style={{
              shadowColor: isFormValid
                ? role === "manager"
                  ? "#10b981"
                  : "#3b82f6"
                : "transparent",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text className="text-white text-center text-lg font-semibold">
              {isSubmitting
                ? "..."
                : role === "manager"
                ? t("addManager") || "Add Manager"
                : t("addMember") || "Add Member"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
