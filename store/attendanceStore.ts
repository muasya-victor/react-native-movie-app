// store/attendanceStore.ts
import { create } from "zustand";
import {
  AttendanceService,
  AttendanceRecord,
  AttendanceRecordWithDetails,
  BulkAttendanceRequest,
} from "../services/attendanceService";

export interface User {
  id: number;
  name: string;
  email?: string;
}

export interface AttendanceFormData extends AttendanceRecord {
  user_name?: string;
}

export interface SelectedUserRecord {
  user_id: number;
  is_present: boolean;
  user_name?: string;
}

export interface AttendanceState {
  // Loading states
  isLoading: boolean;
  isSubmitting: boolean;

  // Form data
  selectedSite: number | null;
  selectedDate: string;

  // Fetched attendance records from API (read-only)
  attendanceRecords: AttendanceRecordWithDetails[];

  // Selected users for bulk operations (this is what gets posted)
  selectedUsers: SelectedUserRecord[];

  // Feedback states
  error: string | null;
  validationErrors: string[];
  successMessage: string | null;

  // Available users for selection
  availableUsers: User[];
}

export interface AttendanceActions {
  // Form actions
  setSite: (siteId: number) => void;
  setDate: (date: string) => void;
  setAvailableUsers: (users: User[]) => void;

  // Selection management
  addUserToSelection: (user: User) => void;
  removeUserFromSelection: (userId: number) => void;
  toggleUserSelection: (user: User) => void;
  toggleSelectedUserAttendance: (userId: number) => void;
  updateSelectedUserAttendance: (userId: number, isPresent: boolean) => void;
  clearSelectedUsers: () => void;

  // Bulk selection operations
  selectAllUsers: (users: User[]) => void;
  markAllSelectedPresent: () => void;
  markAllSelectedAbsent: () => void;

  // API actions
  fetchAttendanceForDate: (siteId: number, date: string) => Promise<void>;
  submitBulkAttendance: () => Promise<void>;

  // State management
  clearError: () => void;
  clearSuccess: () => void;
  resetForm: () => void;
  setLoading: (loading: boolean) => void;
}

type AttendanceStore = AttendanceState & AttendanceActions;

export const useAttendanceStore = create<AttendanceStore>((set, get) => ({
  // Initial state
  isLoading: false,
  isSubmitting: false,
  selectedSite: null,
  selectedDate: new Date().toISOString().split("T")[0], // Today's date
  attendanceRecords: [],
  selectedUsers: [],
  error: null,
  validationErrors: [],
  successMessage: null,
  availableUsers: [],

  // Form actions
  setSite: (siteId: number) => {
    set({ selectedSite: siteId, error: null });
  },

  setDate: (date: string) => {
    set({ selectedDate: date, error: null });

    // Clear selected users when date changes
    set({ selectedUsers: [] });
  },

  setAvailableUsers: (users: User[]) => {
    set({ availableUsers: users });
  },

  // Selection management
  addUserToSelection: (user: User) => {
    const { selectedUsers, attendanceRecords } = get();

    // Check if user already selected
    const userExists = selectedUsers.some(
      (record) => record.user_id === user.id
    );
    if (userExists) {
      set({ error: "User is already selected" });
      return;
    }

    // Check if user has existing attendance record
    const existingRecord = attendanceRecords.find(
      (record) => record.user_id === user.id
    );

    const newSelectedUser: SelectedUserRecord = {
      user_id: user.id,
      user_name: user.name,
      // Use existing attendance status or default to present
      is_present: existingRecord?.is_present ?? true,
    };

    set({
      selectedUsers: [...selectedUsers, newSelectedUser],
      error: null,
    });
  },

  removeUserFromSelection: (userId: number) => {
    const { selectedUsers } = get();
    set({
      selectedUsers: selectedUsers.filter((user) => user.user_id !== userId),
      error: null,
    });
  },

  toggleUserSelection: (user: User) => {
    const { selectedUsers } = get();
    const isSelected = selectedUsers.some(
      (selected) => selected.user_id === user.id
    );

    if (isSelected) {
      get().removeUserFromSelection(user.id);
    } else {
      get().addUserToSelection(user);
    }
  },

  toggleSelectedUserAttendance: (userId: number) => {
    const { selectedUsers } = get();
    set({
      selectedUsers: selectedUsers.map((user) =>
        user.user_id === userId
          ? { ...user, is_present: !user.is_present }
          : user
      ),
    });
  },

  updateSelectedUserAttendance: (userId: number, isPresent: boolean) => {
    const { selectedUsers } = get();
    set({
      selectedUsers: selectedUsers.map((user) =>
        user.user_id === userId ? { ...user, is_present: isPresent } : user
      ),
    });
  },

  clearSelectedUsers: () => {
    set({ selectedUsers: [], error: null });
  },

  // Bulk selection operations
  selectAllUsers: (users: User[]) => {
    const { attendanceRecords } = get();

    const selectedUsers: SelectedUserRecord[] = users.map((user) => {
      const existingRecord = attendanceRecords.find(
        (record) => record.user_id === user.id
      );

      return {
        user_id: user.id,
        user_name: user.name,
        is_present: existingRecord?.is_present ?? true,
      };
    });

    set({ selectedUsers, error: null });
  },

  markAllSelectedPresent: () => {
    const { selectedUsers } = get();
    set({
      selectedUsers: selectedUsers.map((user) => ({
        ...user,
        is_present: true,
      })),
    });
  },

  markAllSelectedAbsent: () => {
    const { selectedUsers } = get();
    set({
      selectedUsers: selectedUsers.map((user) => ({
        ...user,
        is_present: false,
      })),
    });
  },

  // API actions
  fetchAttendanceForDate: async (siteId: number, date: string) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await AttendanceService.fetchAttendanceForDate(
        siteId,
        date
      );

      if (response.success) {
        set({
          attendanceRecords: response.data || [],
          isLoading: false,
        });
      } else {
        set({
          attendanceRecords: [],
          error:
            typeof response.error === "string"
              ? response.error
              : "Failed to fetch attendance records",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Fetch attendance error:", error);
      set({
        attendanceRecords: [],
        error: "An unexpected error occurred while fetching attendance",
        isLoading: false,
      });
    }
  },

  submitBulkAttendance: async () => {
    const { selectedSite, selectedDate, selectedUsers } = get();

    // Clear previous states
    set({
      isSubmitting: true,
      error: null,
      validationErrors: [],
      successMessage: null,
    });

    try {
      // Validate required fields
      if (!selectedSite) {
        set({
          error: "Please select a site",
          isSubmitting: false,
          validationErrors: ["Site selection is required"],
        });
        return;
      }

      if (selectedSite <= 0) {
        set({
          error: "Invalid site selected",
          isSubmitting: false,
          validationErrors: ["Please select a valid site"],
        });
        return;
      }

      if (!selectedDate) {
        set({
          error: "Please select a date",
          isSubmitting: false,
          validationErrors: ["Date selection is required"],
        });
        return;
      }

      if (selectedUsers.length === 0) {
        set({
          error: "Please select at least one user for attendance",
          isSubmitting: false,
          validationErrors: ["At least one user selection is required"],
        });
        return;
      }

      // Prepare payload using only selected users
      const payload: BulkAttendanceRequest =
        AttendanceService.formatBulkAttendancePayload(
          selectedSite,
          selectedDate,
          selectedUsers.map((user) => ({
            user_id: user.user_id,
            is_present: user.is_present,
          }))
        );

      // Validate payload
      const validation =
        AttendanceService.validateBulkAttendancePayload(payload);
      if (!validation.isValid) {
        set({
          error: "Please fix the following errors",
          validationErrors: validation.errors,
          isSubmitting: false,
        });
        return;
      }

      // Submit attendance
      const response = await AttendanceService.markBulkAttendance(payload);

      if (response.success) {
        const presentCount = selectedUsers.filter(
          (user) => user.is_present
        ).length;
        const absentCount = selectedUsers.length - presentCount;

        set({
          successMessage: `Attendance marked successfully! ${presentCount} present, ${absentCount} absent`,
          isSubmitting: false,
        });

        // Refresh attendance records after successful submission
        await get().fetchAttendanceForDate(selectedSite, selectedDate);

        // Clear selected users after successful submission
        set({ selectedUsers: [] });
      } else {
        let errorMessage = "Failed to mark attendance";

        if (response.error) {
          if (typeof response.error === "string") {
            errorMessage = response.error;
          } else if (response.error.detail) {
            errorMessage = response.error.detail;
          } else if (response.error.message) {
            errorMessage = response.error.message;
          } else {
            errorMessage = JSON.stringify(response.error);
          }
        }

        set({
          error: errorMessage,
          isSubmitting: false,
        });
      }
    } catch (error) {
      console.error("Submit bulk attendance error:", error);
      set({
        error: "An unexpected error occurred while marking attendance",
        isSubmitting: false,
      });
    }
  },

  // State management
  clearError: () => {
    set({ error: null, validationErrors: [] });
  },

  clearSuccess: () => {
    set({ successMessage: null });
  },

  resetForm: () => {
    set({
      selectedSite: null,
      selectedDate: new Date().toISOString().split("T")[0],
      attendanceRecords: [],
      selectedUsers: [],
      error: null,
      validationErrors: [],
      successMessage: null,
      isSubmitting: false,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));
