// services/attendanceService.ts
import { apiRequest } from "./api";

export interface AttendanceRecord {
  user_id: number;
  is_present: boolean;
}

export interface AttendanceRecordWithDetails extends AttendanceRecord {
  id?: number;
  user_name?: string;
  date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BulkAttendanceRequest {
  site: number;
  date: string; // Format: YYYY-MM-DD
  attendance_data: AttendanceRecord[];
}

export interface AttendanceListResponse {
  success: boolean;
  data?: AttendanceRecordWithDetails[];
  error?: any;
  status: number;
}

export interface BulkAttendanceResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class AttendanceService {
  /**
   * Fetch attendance records for a specific site and date
   * @param siteId - Site identifier
   * @param date - Date string (YYYY-MM-DD)
   * @returns Promise with attendance records
   */
  static async fetchAttendanceForDate(
    siteId: number,
    date: string
  ): Promise<AttendanceListResponse> {
    try {
      console.log(`Fetching attendance for site ${siteId} on ${date}`);

      const response = await apiRequest(
        "GET",
        `/attendance/list/?site=${siteId}&date=${date}`,
        null,
        {
          "Content-Type": "application/json",
        }
      );

      console.log(
        "Fetch attendance response:",
        JSON.stringify(response, null, 2)
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: Array.isArray(response.data) ? response.data : [response.data],
          status: response.status,
        };
      }

      return {
        success: false,
        data: [],
        error: response.error,
        status: response.status,
      };
    } catch (error) {
      console.error("Fetch attendance failed:", error);
      return {
        success: false,
        data: [],
        error: "Failed to fetch attendance records",
        status: 500,
      };
    }
  }

  /**
   * Mark attendance for multiple users in bulk
   * @param payload - Bulk attendance request data
   * @returns Promise with API response
   */
  static async markBulkAttendance(payload: BulkAttendanceRequest): Promise<{
    success: boolean;
    data?: any;
    error?: any;
    status: number;
  }> {
    try {
      console.log(
        "Sending bulk attendance payload:",
        JSON.stringify(payload, null, 2)
      );

      const response = await apiRequest(
        "POST",
        "/attendance/bulk-mark/",
        payload,
        {
          "Content-Type": "application/json",
        }
      );

      console.log(
        "Bulk attendance response:",
        JSON.stringify(response, null, 2)
      );
      return response;
    } catch (error) {
      console.error("Bulk attendance marking failed:", error);
      return {
        success: false,
        error: "Failed to mark bulk attendance",
        status: 500,
      };
    }
  }

  /**
   * Helper method to format attendance data for a single date
   * @param siteId - Site identifier
   * @param date - Date string (YYYY-MM-DD)
   * @param attendanceRecords - Array of attendance records
   * @returns Formatted bulk attendance request
   */
  static formatBulkAttendancePayload(
    siteId: number,
    date: string,
    attendanceRecords: AttendanceRecord[]
  ): BulkAttendanceRequest {
    return {
      site: siteId,
      date,
      attendance_data: attendanceRecords,
    };
  }

  /**
   * Validate attendance data before submission
   * @param payload - Bulk attendance request data
   * @returns Validation result with errors if any
   */
  static validateBulkAttendancePayload(payload: BulkAttendanceRequest): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate site
    if (!payload.site || payload.site <= 0) {
      errors.push("Valid site ID is required");
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!payload.date || !dateRegex.test(payload.date)) {
      errors.push("Date must be in YYYY-MM-DD format");
    }

    // Validate date is not in the future
    const today = new Date().toISOString().split("T")[0];
    if (payload.date > today) {
      errors.push("Cannot mark attendance for future dates");
    }

    // Validate attendance data
    if (!payload.attendance_data || !Array.isArray(payload.attendance_data)) {
      errors.push("Attendance data is required and must be an array");
    } else if (payload.attendance_data.length === 0) {
      errors.push("At least one attendance record is required");
    } else {
      // Check for duplicate user IDs
      const userIds = payload.attendance_data.map((record) => record.user_id);
      const uniqueUserIds = new Set(userIds);
      if (userIds.length !== uniqueUserIds.size) {
        errors.push("Duplicate user IDs found in attendance data");
      }

      // Validate each record
      payload.attendance_data.forEach((record, index) => {
        if (!record.user_id || record.user_id <= 0) {
          errors.push(`Invalid user_id in record ${index + 1}`);
        }
        if (typeof record.is_present !== "boolean") {
          errors.push(`is_present must be boolean in record ${index + 1}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Helper method to format date to YYYY-MM-DD
   * @param date - Date object or string
   * @returns Formatted date string
   */
  static formatDate(date: Date | string): string {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }
    return date;
  }
}
