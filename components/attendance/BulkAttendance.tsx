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

import SiteSelectorComponent from "@/components/SiteSelector/SiteSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { AttendanceService } from "@/services/attendanceService";
import { siteService, Worker } from "@/services/siteService";
import useFetch from "@/services/useFetch";
import { useSiteStore } from "@/store/siteStore";
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

interface SelectedUser {
  user_id: number;
  user_name: string;
  is_present: boolean;
}

interface AttendanceRecord {
  user_id: number;
  is_present: boolean;
  user_name?: string;
  date?: string;
}

interface BulkAttendanceProps {}

export default function BulkAttendance({}: BulkAttendanceProps) {
  const router = useRouter();
  const { t } = useTranslation(translations);
  const { selectedSite, setSelectedSite } = useSiteStore();

  // State management
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    dateSelection: true,
    summary: true,
    selectedList: true,
    membersList: true,
  });

  // Fetch all sites for site selector
  const {
    data: sitesResponse,
    loading: sitesLoading,
    error: sitesError,
    refetch: refetchSites,
  } = useFetch(
    async () => {
      return await siteService.getSites();
    },
    true
  );

  const sites = sitesResponse?.data || [];

  // Fetch site workers using the siteService
  const {
    data: workersResponse,
    loading: workersLoading,
    error: workersError,
    refetch: refetchWorkers,
  } = useFetch(
    async () => {
      if (!selectedSite?.id) {
        throw new Error("No site selected");
      }
      return await siteService.getWorkers();
    },
    !!selectedSite?.id
  );

  const workers = selectedSite?.members || [];

  console.log('wokerssss----',workersResponse);
  

  // Handle site selection from site selector
  const handleSiteSelect = (site: any) => {
    setSelectedSite(site);
    // Clear selected users and attendance records when site changes
    setSelectedUsers([]);
    setAttendanceRecords([]);
    // setAttendanceError(null);
    setSuccessMessage(null);
  };

  // Fetch attendance records when site or date changes
  useEffect(() => {
    if (selectedSite?.id && selectedDate) {
      fetchAttendanceForDate();
    }
  }, [selectedSite?.id, selectedDate]);

  // Auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  console.log('|||||||||||||||||||| my selected site',selectedSite);
  

  const fetchAttendanceForDate = async () => {
    if (!selectedSite?.id) return;

    setAttendanceLoading(true);
    setAttendanceError(null);
    
    try {
      const response = await AttendanceService.fetchAttendanceForDate(
        selectedSite.id,
        selectedDate
      );
      
      if (response.success) {
        setAttendanceRecords(response.data || []);
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || "Failed to fetch attendance";
        setAttendanceError(errorMessage);
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceError("Failed to fetch attendance records");
      setAttendanceRecords([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleRefresh = async () => {
    setAttendanceError(null);
    await Promise.all([
      // refetchWorkers(),
      fetchAttendanceForDate(),
    ]);
  };

  const toggleUserSelection = (worker: Worker) => {
    const userId = worker.id;
    const isSelected = selectedUsers.some((user) => user.user_id === userId);

    if (isSelected) {
      setSelectedUsers(prev => prev.filter(user => user.user_id !== userId));
    } else {
      const existingRecord = attendanceRecords.find(record => record.user_id === userId);
      const defaultPresent = existingRecord ? existingRecord.is_present : true;
      
      setSelectedUsers(prev => [
        ...prev,
        {
          user_id: userId,
          user_name: worker.name,
          is_present: defaultPresent,
        }
      ]);
    }
  };

  const toggleSelectedUserAttendance = (userId: number) => {
    setSelectedUsers(prev =>
      prev.map(user =>
        user.user_id === userId
          ? { ...user, is_present: !user.is_present }
          : user
      )
    );
  };

  const removeUserFromSelection = (userId: number) => {
    setSelectedUsers(prev => prev.filter(user => user.user_id !== userId));
  };

  const selectAllUsers = (availableWorkers: Worker[]) => {
    const newSelectedUsers: SelectedUser[] = availableWorkers.map(worker => {
      const existingRecord = attendanceRecords.find(record => record.user_id === worker.id);
      return {
        user_id: worker.id,
        user_name: worker.name,
        is_present: existingRecord ? existingRecord.is_present : true,
      };
    });
    setSelectedUsers(newSelectedUsers);
  };

  const markAllSelectedPresent = () => {
    setSelectedUsers(prev =>
      prev.map(user => ({ ...user, is_present: true }))
    );
  };

  const markAllSelectedAbsent = () => {
    setSelectedUsers(prev =>
      prev.map(user => ({ ...user, is_present: false }))
    );
  };

  const clearSelectedUsers = () => {
    setSelectedUsers([]);
  };

  const handleSubmit = async () => {
    if (!selectedSite?.id) {
      Alert.alert(t("error"), t("noSiteSelected"));
      return;
    }

    if (selectedUsers.length === 0) {
      Alert.alert(t("error"), "Please select at least one user");
      return;
    }

    setIsSubmitting(true);
    try {
      const attendanceData = selectedUsers.map(user => ({
        user_id: user.user_id,
        is_present: user.is_present,
      }));

      const payload = AttendanceService.formatBulkAttendancePayload(
        selectedSite.id,
        selectedDate,
        attendanceData
      );

      // Validate payload
      const validation = AttendanceService.validateBulkAttendancePayload(payload);
      if (!validation.isValid) {
        Alert.alert(t("error"), validation.errors.join("\n"));
        return;
      }

      const response = await AttendanceService.markBulkAttendance(payload);

      if (response.success) {
        setSuccessMessage(
          `Attendance marked successfully for ${selectedUsers.length} users on ${formatDisplayDate(selectedDate)}`
        );
        setSelectedUsers([]);
        await fetchAttendanceForDate(); // Refresh attendance records
        showToast("Attendance submitted successfully!");
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : response.error?.message || "Failed to submit attendance";
        Alert.alert(t("error"), errorMessage);
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      Alert.alert(t("error"), "Failed to submit attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
              onPress={() => setSelectedDate(getDateHelper("today"))}
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
              onPress={() => setSelectedDate(getDateHelper("yesterday"))}
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
              !attendanceLoading && (
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
            <View className="flex-row gap-2 mb-4">
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

  const renderUserItem = ({ item: worker }: { item: Worker }) => {
    const isSelected = isUserSelected(worker.id);
    const existingStatus = getUserExistingAttendance(worker.id);

    return (
      <TouchableOpacity
        onPress={() => toggleUserSelection(worker)}
        className={`p-4 rounded-lg mb-3 flex-row items-center shadow-sm ${
          isSelected
            ? "bg-app-primary-light border border-app-primary"
            : "bg-app-surface"
        }`}
      >
        <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-app-surface-variant">
          <Text className="font-bold text-lg text-app-primary">
            {worker.name}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-app-text-primary flext items-center gap-2">
            {worker?.user.first_name}
            -
            {worker?.user.last_name}
          </Text>
          {worker.staff_number && (
            <Text className="text-sm text-app-text-secondary">
              {worker?.user.staff_number}
            </Text>
          )}
          <Text className="text-xs text-app-text-tertiary mt-1">
            {worker?.user.role}
          </Text>

          {/* Show existing attendance status */}
          {existingStatus !== null && (
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
            isSelected
              ? "bg-app-primary border-app-primary"
              : "border-app-border"
          }`}
        >
          {isSelected && (
            <Text className="text-white text-xs">✓</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMembersList = () => {
    return (
      <View className="mb-6">
        <View className="flex-row items-center justify-between">
          {renderSectionHeader(
            t("selectMembers") || "Select Members",
            "membersList",
            workers.length
          )}
          {workers.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                selectAllUsers(workers);
                showToast(
                  `${workers.length} users selected`
                );
              }}
              className="mb-3 py-2 px-3 bg-app-surface-variant rounded-lg"
            >
              <Text className="text-app-text-secondary font-medium">
                {t("selectAll") || "Select All"} ({workers.length})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {sectionsExpanded.membersList && (
          <>
            {workersLoading || attendanceLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text className="text-app-text-secondary mt-2">
                  {workersLoading ? "Loading workers..." : "Loading attendance..."}
                </Text>
              </View>
            ) : workersError ? (
              <View className="py-8 items-center">
                <Text className="text-app-danger text-center mb-4">
                  {workersError.message || "Failed to load workers"}
                </Text>
                <TouchableOpacity
                  onPress={refetchWorkers}
                  className="bg-app-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Retry</Text>
                </TouchableOpacity>
              </View>
            ) : workers.length === 0 ? (
              <View className="py-8 items-center">
                <Text className="text-app-text-secondary text-center">
                  {t("noUsersFound") || "No workers found for this site"}
                </Text>
                <TouchableOpacity
                  onPress={handleRefresh}
                  className="mt-4 bg-app-primary px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-medium">Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {attendanceError && (
                  <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Text className="text-red-800 font-medium text-sm mb-1">
                      Error loading attendance data
                    </Text>
                    <Text className="text-red-700 text-xs">
                      {attendanceError}
                    </Text>
                    <TouchableOpacity
                      onPress={fetchAttendanceForDate}
                      className="mt-2 self-start"
                    >
                      <Text className="text-red-800 underline text-sm">
                        Retry
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <FlatList
                  data={workers}
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

  // Show site selector if no site is selected
  if (!selectedSite) {
    return (
      <SiteSelectorComponent
        sites={sites}
        isLoading={sitesLoading}
        error={sitesError?.message || null}
        onSiteSelect={handleSiteSelect}
        onRetry={refetchSites}
      />
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {showCalendar && (
        <CalendarPicker
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
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
            {selectedSite.name}
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
      {(attendanceError || workersError) && !workersLoading && (
        <View className="m-4 p-4 bg-red-100 rounded-lg border border-red-400">
          <Text className="text-red-800 font-medium mb-2">
            {attendanceError || workersError?.message || "An error occurred"}
          </Text>
          <TouchableOpacity 
            onPress={handleRefresh} 
            className="mt-2 self-start"
          >
            <Text className="text-red-800 underline text-sm">
              {t("retry") || "Retry"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={workersLoading || attendanceLoading} 
            onRefresh={handleRefresh} 
          />
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