// services/withdrawalRequestService.ts
import { apiRequest } from "./api";

// Types for withdrawal request system
export interface WithdrawalRequest {
  id: number;
  request_reference: string;
  user_email: string;
  user_name: string;
  site: number;
  site_name: string;
  site_location: string;
  amount: string;
  status: "Pending" | "Approved" | "Rejected" | "Processed";
  requested_at: string;
  approved_rejected_by_email: string | null;
  approved_rejected_by_name: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  manager_provided_phone: string | null;
  withdrawal_id: number | null;
  withdrawal_reference: string | null;
  wallet_balance_at_request: string;
}

export interface CreateWithdrawalRequestPayload {
  site_id: number;
  amount: number;
}

export interface ApproveWithdrawalPayload {
  manager_provided_phone: string;
}

export interface RejectWithdrawalPayload {
  rejection_reason: string;
}

export interface WithdrawalRequestListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WithdrawalRequest[];
}

export interface WithdrawalStatistics {
  period_days: number;
  total_requests: number;
  total_amount_requested: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  processed_requests: number;
  average_request_amount: number;
  approval_rate: number;
}

export interface ApprovalResponse {
  message: string;
  request_reference: string;
  withdrawal_reference: string;
  amount: number;
  phone_number: string;
}

export interface RejectionResponse {
  message: string;
  request_reference: string;
  rejection_reason: string;
}

export class WithdrawalRequestService {
  /**
   * Create a new withdrawal request
   */
  static async createWithdrawalRequest(
    payload: CreateWithdrawalRequestPayload
  ): Promise<WithdrawalRequest> {
    const response = await apiRequest(
      "POST",
      "/withdrawals/requests/",
      payload
    );

    if (!response.success) {
      throw new Error(
        response.error?.site_id?.[0] ||
          response.error?.amount?.[0] ||
          response.error?.non_field_errors?.[0] ||
          response.error?.detail ||
          "Failed to create withdrawal request"
      );
    }

    return response.data;
  }

  /**
   * Get user's own withdrawal requests
   */
  static async getMyWithdrawalRequests(): Promise<WithdrawalRequest[]> {
    const response = await apiRequest(
      "GET",
      "/withdrawals/requests/my-requests/"
    );

    if (!response.success) {
      throw new Error(
        response.error?.detail || "Failed to fetch withdrawal requests"
      );
    }

    return response.data;
  }

  /**
   * Get withdrawal requests for manager (for sites they manage)
   */
  static async getManagerWithdrawalRequests(params?: {
    site_id?: number;
    status?: string;
    page?: number;
  }): Promise<WithdrawalRequestListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.site_id)
      queryParams.append("site_id", params.site_id.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());

    const endpoint = `/withdrawals/requests/manager-requests/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiRequest("GET", endpoint);

    if (!response.success) {
      throw new Error(
        response.error?.detail || "Failed to fetch manager withdrawal requests"
      );
    }

    return response.data;
  }

  /**
   * Get pending withdrawal requests (role-based)
   */
  static async getPendingWithdrawalRequests(): Promise<WithdrawalRequestListResponse> {
    const response = await apiRequest("GET", "/withdrawals/requests/pending/");

    if (!response.success) {
      throw new Error(
        response.error?.detail || "Failed to fetch pending withdrawal requests"
      );
    }

    return response.data;
  }

  /**
   * Approve a withdrawal request (manager only)
   */
  static async approveWithdrawalRequest(
    requestId: number,
    payload: ApproveWithdrawalPayload
  ): Promise<ApprovalResponse> {
    const response = await apiRequest(
      "POST",
      `/withdrawals/requests/${requestId}/approve/`,
      payload
    );

    if (!response.success) {
      throw new Error(
        response.error?.manager_provided_phone?.[0] ||
          response.error?.detail ||
          "Failed to approve withdrawal request"
      );
    }

    return response.data;
  }

  /**
   * Reject a withdrawal request (manager only)
   */
  static async rejectWithdrawalRequest(
    requestId: number,
    payload: RejectWithdrawalPayload
  ): Promise<RejectionResponse> {
    const response = await apiRequest(
      "POST",
      `/withdrawals/requests/${requestId}/reject/`,
      payload
    );

    if (!response.success) {
      throw new Error(
        response.error?.rejection_reason?.[0] ||
          response.error?.detail ||
          "Failed to reject withdrawal request"
      );
    }

    return response.data;
  }

  /**
   * Get withdrawal request statistics (manager/admin only)
   */
  static async getWithdrawalStatistics(params?: {
    site_id?: number;
    days?: number;
  }): Promise<WithdrawalStatistics> {
    const queryParams = new URLSearchParams();

    if (params?.site_id)
      queryParams.append("site_id", params.site_id.toString());
    if (params?.days) queryParams.append("days", params.days.toString());

    const endpoint = `/withdrawals/requests/statistics/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiRequest("GET", endpoint);

    if (!response.success) {
      throw new Error(
        response.error?.detail || "Failed to fetch withdrawal statistics"
      );
    }

    return response.data;
  }

  /**
   * Get all withdrawal requests with filtering (admin/manager)
   */
  static async getWithdrawalRequests(params?: {
    status?: string;
    site?: number;
    search?: string;
    page?: number;
  }): Promise<WithdrawalRequestListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status) queryParams.append("status", params.status);
    if (params?.site) queryParams.append("site", params.site.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());

    const endpoint = `/withdrawals/requests/${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await apiRequest("GET", endpoint);

    if (!response.success) {
      throw new Error(
        response.error?.detail || "Failed to fetch withdrawal requests"
      );
    }

    return response.data;
  }

  /**
   * Utility method to format currency
   */
  static formatCurrency(amount: string | number): string {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
    }).format(numAmount);
  }

  /**
   * Utility method to format date
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Validate phone number for Kenyan format
   */
  static validateKenyanPhone(phone: string): boolean {
    const kenyanPhoneRegex = /^(\+254|0)?[17]\d{8}$/;
    return kenyanPhoneRegex.test(phone.replace(/\s/g, ""));
  }

  /**
   * Format phone number to Kenyan standard
   */
  static formatKenyanPhone(phone: string): string {
    const cleaned = phone.replace(/\s/g, "");

    return cleaned;
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status: string): string {
    switch (status) {
      case "Pending":
        return "#FFA500"; // Orange
      case "Approved":
        return "#4CAF50"; // Green
      case "Processed":
        return "#2196F3"; // Blue
      case "Rejected":
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Gray
    }
  }

  /**
   * Get status icon for UI
   */
  static getStatusIcon(status: string): string {
    switch (status) {
      case "Pending":
        return "⏳";
      case "Approved":
        return "✅";
      case "Processed":
        return "💰";
      case "Rejected":
        return "❌";
      default:
        return "❓";
    }
  }
}
