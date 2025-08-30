import { useRouter } from "expo-router";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Trash2,
  Users,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

import { useTranslation } from "@/hooks/useTranslation";
import { useAttendanceStore, User } from "../../store/attendanceStore";
import { useSiteStore } from "../../store/siteStore";
import translations from "./translations.json";

const CalendarPicker = ({
  selectedDate,
  onDateSelect,
  onClose,
}: {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [selectedDateObj, setSelectedDateObj] = useState(
    new Date(selectedDate)
  );
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + direction,
        1
      )
    );
  };

  const handleDateSelect = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    setSelectedDateObj(date);
    onDateSelect(dateString);
    onClose();
  };

  const isToday = (date: Date) =>
    new Date().toDateString() === date.toDateString();
  const isSelected = (date: Date) =>
    selectedDateObj.toDateString() === date.toDateString();
  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Modal visible={true} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white m-4 rounded-2xl p-6 w-11/12 max-w-md">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-app-text-primary">
              Select Date
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text className="text-app-primary text-lg font-medium">Done</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between items-center mb-4">
            <TouchableOpacity
              onPress={() => navigateMonth(-1)}
              className="p-2 rounded-lg bg-app-surface"
            >
              <Text className="text-app-text-primary text-lg">‹</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-app-text-primary">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity
              onPress={() => navigateMonth(1)}
              className="p-2 rounded-lg bg-app-surface"
            >
              <Text className="text-app-text-primary text-lg">›</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <View key={index} className="flex-1 items-center py-2">
                <Text className="text-app-text-secondary font-medium">
                  {day}
                </Text>
              </View>
            ))}
          </View>
          <View className="flex-row flex-wrap">
            {days.map((date, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  date && !isFutureDate(date) && handleDateSelect(date)
                }
                disabled={!date || isFutureDate(date)}
                className={`w-1/7 aspect-square items-center justify-center ${
                  !date
                    ? ""
                    : isSelected(date)
                    ? "bg-app-primary rounded-lg"
                    : isToday(date)
                    ? "bg-app-primary-light rounded-lg"
                    : isFutureDate(date)
                    ? "opacity-30"
                    : ""
                }`}
                style={{ width: "14.28%" }}
              >
                {date && (
                  <Text
                    className={`text-base ${
                      isSelected(date)
                        ? "text-white font-bold"
                        : isToday(date)
                        ? "text-app-primary font-semibold"
                        : isFutureDate(date)
                        ? "text-app-text-tertiary"
                        : "text-app-text-primary"
                    }`}
                  >
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface BulkAttendanceProps {
  siteId?: number;
}

export default function BulkAttendance({ siteId }: BulkAttendanceProps) {
  const router = useRouter();
  const { t } = useTranslation(translations);
  const {
    selectedSite,
    isLoadingSite,
    siteError,
    fetchCurrentSite,
    getActiveWorkers,
  } = useSiteStore();
  const {
    isLoading,
    isSubmitting,
    selectedDate,
    attendanceRecords,
    selectedUsers,
    error,
    validationErrors,
    successMessage,
    setSite,
    setDate,
    toggleUserSelection,
    toggleSelectedUserAttendance,
    removeUserFromSelection,
    selectAllUsers,
    markAllSelectedPresent,
    markAllSelectedAbsent,
    clearSelectedUsers,
    clearError,
    clearSuccess,
    fetchAttendanceForDate,
    submitBulkAttendance,
  } = useAttendanceStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    dateSelection: true,
    summary: true,
    selectedList: true,
    membersList: true,
  });

  const activeWorkers = getActiveWorkers();
  const currentSiteId = siteId || selectedSite?.id;
  const currentSiteName = selectedSite?.name || `Site ${currentSiteId}`;

  // Initialize site and fetch data
  useEffect(() => {
    if (currentSiteId) {
      setSite(currentSiteId);
      if (!selectedSite || selectedSite.id !== currentSiteId) {
        fetchCurrentSite(true);
      }
    }
  }, [currentSiteId, setSite, fetchCurrentSite]);

  // Fetch attendance when site or date changes
  useEffect(() => {
    if (currentSiteId && selectedDate) {
      setInitialLoadComplete(false);
      fetchAttendanceForDate(currentSiteId, selectedDate).then(() => {
        setInitialLoadComplete(true);
      });
    }
  }, [currentSiteId, selectedDate, fetchAttendanceForDate]);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => clearSuccess(), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, clearSuccess]);

  const handleRefresh = async () => {
    if (!currentSiteId) return;
    setRefreshing(true);
    try {
      clearError();
      await fetchCurrentSite(true);
      await fetchAttendanceForDate(currentSiteId, selectedDate);
    } catch (err) {
      console.error("Failed to refresh site data:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentSiteId) {
      Alert.alert(t("error"), t("noSiteSelected"));
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert(t("error"), "Please select at least one user");
      return;
    }

    await submitBulkAttendance();
  };

  const toggleSection = (section: keyof typeof sectionsExpanded) =>
    setSectionsExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

  const getDateHelper = (type: "today" | "yesterday"): string => {
    const d = new Date();
    if (type === "yesterday") d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  };

  const formatDisplayDate = (dateString: string): string => {
    const todayStr = getDateHelper("today");
    const yesterdayStr = getDateHelper("yesterday");
    if (dateString === todayStr) return t("today") || "Today";
    if (dateString === yesterdayStr) return t("yesterday") || "Yesterday";
    return new Date(dateString).toLocaleDateString();
  };

  const isUserSelected = (userId: number): boolean =>
    selectedUsers.some((user) => user.user_id === userId);

  const getUserExistingAttendance = (userId: number): boolean | null => {
    const record = attendanceRecords.find(
      (record) => record.user_id === userId
    );
    return record ? record.is_present : null;
  };

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Toast.show({ type: "success", text1: message, visibilityTime: 2000 });
    }
  };

  const renderSectionHeader = (
    title: string,
    sectionKey: keyof typeof sectionsExpanded,
    count?: number
  ) => (
    <TouchableOpacity
      onPress={() => toggleSection(sectionKey)}
      className="flex-row items-center justify-between mb-3 py-2"
    >
      <View className="flex-row items-center">
        <Text className="text-lg font-semibold text-app-text-primary">
          {title}
        </Text>
        {count !== undefined && (
          <View className="ml-2 bg-app-primary-light px-2 py-1 rounded-full">
            <Text className="text-xs font-medium text-app-primary">
              {count}
            </Text>
          </View>
        )}
      </View>
      {sectionsExpanded[sectionKey] ? (
        <ChevronDown size={20} color="#757575" />
      ) : (
        <ChevronRight size={20} color="#757575" />
      )}
    </TouchableOpacity>
  );

  const renderDateSection = () => (
    <View className="mb-6">
      {renderSectionHeader(t("selectDate") || "Select Date", "dateSelection")}
      {sectionsExpanded.dateSelection && (
        <View>
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() => setDate(getDateHelper("today"))}
              className={`px-4 py-2 rounded-lg border ${
                selectedDate === getDateHelper("today")
                  ? "bg-app-primary border-app-primary"
                  : "bg-app-surface border-app-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedDate === getDateHelper("today")
                    ? "text-white"
                    : "text-app-text-primary"
                }`}
              >
                {t("today") || "Today"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDate(getDateHelper("yesterday"))}
              className={`px-4 py-2 rounded-lg border ${
                selectedDate === getDateHelper("yesterday")
                  ? "bg-app-primary border-app-primary"
                  : "bg-app-surface border-app-border"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedDate === getDateHelper("yesterday")
                    ? "text-white"
                    : "text-app-text-primary"
                }`}
              >
                {t("yesterday") || "Yesterday"}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => setShowCalendar(true)}
            className="flex-row items-center bg-app-surface rounded-lg px-4 py-3 border border-app-border"
          >
            <Calendar size={20} color="#757575" className="mr-3" />
            <Text className="text-app-text-primary flex-1 ml-3">
              {formatDisplayDate(selectedDate)}
            </Text>
            <Text className="text-app-text-secondary text-sm">
              {t("tapToChange") || "Tap to change"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderSummary = () => {
    const existingPresentCount = attendanceRecords.filter(
      (r) => r.is_present
    ).length;
    const existingAbsentCount = attendanceRecords.length - existingPresentCount;
    const selectedPresentCount = selectedUsers.filter(
      (u) => u.is_present
    ).length;
    const selectedAbsentCount = selectedUsers.length - selectedPresentCount;

    return (
      <View className="mb-6">
        {renderSectionHeader(
          t("attendanceSummary") || "Attendance Summary",
          "summary"
        )}
        {sectionsExpanded.summary && (
          <View className="space-y-4">
            {/* Existing Records Summary */}
            {attendanceRecords.length > 0 && (
              <View className="bg-app-surface rounded-lg p-4">
                <View className="flex-row items-center mb-3">
                  <ClipboardList size={20} color="#4CAF50" className="mr-2" />
                  <Text className="text-app-text-primary font-semibold">
                    Existing Records for {formatDisplayDate(selectedDate)}
                  </Text>
                </View>
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-green-600">
                      {existingPresentCount}
                    </Text>
                    <Text className="text-app-text-secondary text-sm">
                      {t("present") || "Present"}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-red-600">
                      {existingAbsentCount}
                    </Text>
                    <Text className="text-app-text-secondary text-sm">
                      {t("absent") || "Absent"}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-app-text-primary">
                      {attendanceRecords.length}
                    </Text>
                    <Text className="text-app-text-secondary text-sm">
                      {t("total") || "Total"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Selected Users Summary */}
            {selectedUsers.length > 0 && (
              <View className="bg-app-primary-light rounded-lg p-4 border border-app-primary">
                <View className="flex-row items-center mb-3">
                  <Users size={20} color="#4CAF50" className="mr-2" />
                  <Text className="text-app-primary font-semibold">
                    Selected for Update ({selectedUsers.length} users)
                  </Text>
                </View>
                <View className="flex-row justify-around">
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-green-600">
                      {selectedPresentCount}
                    </Text>
                    <Text className="text-app-text-secondary text-sm">
                      Will mark present
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-2xl font-bold text-red-600">
                      {selectedAbsentCount}
                    </Text>
                    <Text className="text-app-text-secondary text-sm">
                      Will mark absent
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* No data message */}
            {attendanceRecords.length === 0 &&
              selectedUsers.length === 0 &&
              initialLoadComplete && (
                <View className="bg-app-surface-variant rounded-lg p-4 items-center">
                  <ClipboardList size={24} color="#757575" className="mb-2" />
                  <Text className="text-app-text-secondary text-center">
                    No attendance records found for{" "}
                    {formatDisplayDate(selectedDate)}.
                  </Text>
                  <Text className="text-app-text-tertiary text-center text-sm mt-1">
                    Select users below to mark their attendance.
                  </Text>
                </View>
              )}
          </View>
        )}
      </View>
    );
  };

  const renderSelectedList = () => {
    if (selectedUsers.length === 0) return null;

    return (
      <View className="mb-6">
        {renderSectionHeader(
          t("selectedForUpdate") || "Selected for Update",
          "selectedList",
          selectedUsers.length
        )}
        {sectionsExpanded.selectedList && (
          <View className="bg-app-surface rounded-lg p-4">
            <View className="flex-row gap-2 mb-4 hidden">
              <TouchableOpacity
                onPress={() => {
                  markAllSelectedPresent();
                  showToast(
                    `All ${selectedUsers.length} selected users marked present`
                  );
                }}
                className="flex-1 py-2 rounded-lg border border-app-primary bg-app-primary-light flex-row items-center justify-center"
              >
                <CheckCircle size={16} color="#4CAF50" />
                <Text className="font-medium ml-2 text-app-primary">
                  {t("markAllPresent") || "Mark All Present"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  markAllSelectedAbsent();
                  showToast(
                    `All ${selectedUsers.length} selected users marked absent`
                  );
                }}
                className="flex-1 py-2 rounded-lg border border-app-danger bg-app-danger-light flex-row items-center justify-center"
              >
                <XCircle size={16} color="#f44336" />
                <Text className="font-medium ml-2 text-app-danger">
                  {t("markAllAbsent") || "Mark All Absent"}
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedUsers}
              scrollEnabled={false}
              keyExtractor={(item) => item.user_id.toString()}
              renderItem={({ item }) => {
                const isPresent = item.is_present;
                return (
                  <View className="flex-row items-center justify-between py-3 border-b border-app-border last:border-b-0">
                    <Text className="flex-1 text-app-text-primary font-medium">
                      {item.user_name}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <TouchableOpacity
                        onPress={() =>
                          toggleSelectedUserAttendance(item.user_id)
                        }
                        className={`px-3 py-2 rounded-lg ${
                          isPresent ? "bg-app-primary" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isPresent ? "text-white" : "text-app-text-secondary"
                          }`}
                        >
                          Present
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          toggleSelectedUserAttendance(item.user_id)
                        }
                        className={`px-3 py-2 rounded-lg ${
                          !isPresent ? "bg-app-danger" : "bg-gray-200"
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            !isPresent
                              ? "text-white"
                              : "text-app-text-secondary"
                          }`}
                        >
                          Absent
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeUserFromSelection(item.user_id)}
                        className="p-2"
                      >
                        <Trash2 size={20} color="#f44336" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className={`mt-4 py-3 rounded-lg flex-row items-center justify-center ${
                isSubmitting ? "bg-app-primary-light" : "bg-app-primary"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <CheckCircle size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    {t("submitAttendanceFor") || "Submit Attendance for"}{" "}
                    {selectedUsers.length} {t("members") || "members"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderUserItem = ({ item: worker }: { item: User }) => {
    const isSelected = isUserSelected(worker.id);
    const existingStatus = getUserExistingAttendance(worker.id);

    // Check if user has amount_accrued greater than 0
    const amountAccrued = parseFloat(worker.amount_accrued || "0");
    const isBlocked = amountAccrued > 0;

    return (
      <TouchableOpacity
        onPress={() => {
          if (isBlocked) {
            Alert.alert(
              "Cannot Modify Attendance",
              `${worker.name} has pending accrued amount of ${worker.amount_accrued}. Attendance cannot be modified until this is resolved.`,
              [{ text: "OK" }]
            );
            return;
          }
          toggleUserSelection(worker);
        }}
        className={`p-4 rounded-lg mb-3 flex-row items-center shadow-sm ${
          isBlocked
            ? "bg-gray-100 opacity-60"
            : isSelected
            ? "bg-app-primary-light border border-app-primary"
            : "bg-app-surface"
        }`}
      >
        {worker.image ? (
          <Image
            source={{ uri: worker.image }}
            className="w-10 h-10 rounded-full mr-3"
            resizeMode="cover"
          />
        ) : (
          <View
            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
              isBlocked ? "bg-gray-300" : "bg-app-surface-variant"
            }`}
          >
            <Text
              className={`font-bold text-lg ${
                isBlocked ? "text-gray-500" : "text-app-primary"
              }`}
            >
              {worker.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text
            className={`text-base font-medium ${
              isBlocked ? "text-gray-500" : "text-app-text-primary"
            }`}
          >
            {worker.name}
          </Text>
          {worker.staffNumber && (
            <Text
              className={`text-sm ${
                isBlocked ? "text-gray-400" : "text-app-text-secondary"
              }`}
            >
              {worker.staffNumber}
            </Text>
          )}

          {/* Show blocked status */}
          {isBlocked && (
            <View className="mt-1 bg-yellow-100 px-2 py-1 rounded">
              <Text className="text-yellow-800 text-xs font-medium">
                Blocked: Accrued amount ${worker.amount_accrued}
              </Text>
            </View>
          )}

          {/* Show existing attendance status */}
          {!isBlocked && existingStatus !== null && (
            <Text
              className={`text-sm mt-1 font-semibold ${
                existingStatus ? "text-green-600" : "text-red-600"
              }`}
            >
              {existingStatus
                ? t("alreadyMarkedPresent") || "Already marked present"
                : t("alreadyMarkedAbsent") || "Already marked absent"}
            </Text>
          )}
        </View>

        {/* Selection indicator */}
        <View
          className={`w-6 h-6 rounded-full border-2 justify-center items-center ${
            isBlocked
              ? "border-gray-400 bg-gray-200"
              : isSelected
              ? "bg-app-primary border-app-primary"
              : "border-app-border"
          }`}
        >
          {isSelected && !isBlocked && (
            <Text className="text-white text-xs">✓</Text>
          )}
          {isBlocked && <Text className="text-gray-500 text-xs">✕</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMembersList = () => {
    // Filter out users with amount_accrued > 0
    const selectableWorkers = activeWorkers.filter((worker) => {
      const amountAccrued = parseFloat(worker.amount_accrued || "0");
      return amountAccrued === 0;
    });

    const blockedWorkers = activeWorkers.filter((worker) => {
      const amountAccrued = parseFloat(worker.amount_accrued || "0");
      return amountAccrued > 0;
    });

    return (
      <View className="mb-6">
        <View className="flex-row items-center justify-between">
          {renderSectionHeader(
            t("selectMembers") || "Select Members",
            "membersList",
            activeWorkers.length
          )}
          {selectableWorkers.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                selectAllUsers(selectableWorkers);
                showToast(
                  `${selectableWorkers.length} available users selected`
                );
              }}
              className="mb-3 py-2 px-3 bg-app-surface-variant rounded-lg"
            >
              <Text className="text-app-text-secondary font-medium">
                {t("selectAll") || "Select All"} ({selectableWorkers.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {sectionsExpanded.membersList && (
          <>
            {isLoadingSite || (isLoading && !initialLoadComplete) ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text className="text-app-text-secondary mt-2">
                  Loading users...
                </Text>
              </View>
            ) : siteError ? (
              <View className="py-8 items-center">
                <Text className="text-app-danger text-center mb-4">
                  {siteError}
                </Text>
                <TouchableOpacity
                  onPress={() => fetchCurrentSite(true)}
                  className="bg-app-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : activeWorkers.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-app-text-secondary text-center">
                  {t("noUsersFound") || "No users found"}
                </Text>
              </View>
            ) : (
              <>
                {blockedWorkers.length > 0 && (
                  <View className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Text className="text-yellow-800 font-medium text-sm mb-1">
                      Notice: {blockedWorkers.length} user(s) blocked from
                      attendance modification
                    </Text>
                    <Text className="text-yellow-700 text-xs">
                      Users with pending accrued amounts cannot have their
                      attendance modified.
                    </Text>
                  </View>
                )}
                <FlatList
                  data={activeWorkers}
                  renderItem={renderUserItem}
                  keyExtractor={(item) => item.id.toString()}
                  scrollEnabled={false}
                />
              </>
            )}
          </>
        )}
      </View>
    );
  };

  if (!currentSiteId) {
    return (
      <View className="flex-1 bg-app-background items-center justify-center p-4">
        <Text className="text-app-text-secondary text-center text-lg mb-4">
          {t("noSiteSelected") || "No site selected"}
        </Text>
        <TouchableOpacity
          className="bg-app-primary px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">
            {t("goBack") || "Go Back"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {showCalendar && (
        <CalendarPicker
          selectedDate={selectedDate}
          onDateSelect={setDate}
          onClose={() => setShowCalendar(false)}
        />
      )}

      {/* Header */}
      <View className="px-4 pt-12 pb-4 flex-row items-center border-b border-app-border bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl text-app-text-primary">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-xl font-semibold text-app-text-primary">
            {t("bulkAttendance") || "Bulk Attendance"}
          </Text>
          <Text className="text-sm text-app-text-secondary">
            {currentSiteName}
          </Text>
        </View>
      </View>

      {/* Success Banner */}
      {successMessage && (
        <View className="m-4 p-4 bg-green-100 rounded-lg border border-green-400">
          <Text className="text-green-800 font-medium text-center">
            {successMessage}
          </Text>
        </View>
      )}

      {/* Error Banner */}
      {(error || validationErrors.length > 0) && (
        <View className="m-4 p-4 bg-red-100 rounded-lg border border-red-400">
          <Text className="text-red-800 font-medium mb-2">
            {error || t("validationErrors") || "Validation errors"}
          </Text>
          {validationErrors.map((err, i) => (
            <Text key={i} className="text-red-700 text-sm">
              • {err}
            </Text>
          ))}
          <TouchableOpacity onPress={clearError} className="mt-2 self-start">
            <Text className="text-red-800 underline text-sm">
              {t("dismiss") || "Dismiss"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View className="p-4">
          {renderDateSection()}
          {renderSummary()}
          {renderSelectedList()}
          {renderMembersList()}
        </View>
      </ScrollView>

      {Platform.OS === "ios" && <Toast />}
    </View>
  );
}
