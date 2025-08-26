// services/disbursementService.ts
import { apiRequest } from "./api";
import {
  DisbursementPreview,
  CreateDisbursementRequest,
  CreateDisbursementResponse,
} from "../types/disbursement";

export class DisbursementService {
  /**
   * Get disbursement preview for a specific site
   * @param siteId - The site ID to get disbursement preview for
   * @returns Promise<DisbursementPreview>
   */
  static async getDisbursementPreview(
    siteId: number
  ): Promise<DisbursementPreview> {
    const response = await apiRequest(
      "GET",
      `/disbursements/disbursement-preview/?site_id=${siteId}`
    );

    if (!response.success) {
      throw new Error(
        response.error?.message ||
          response.error?.detail ||
          "Failed to fetch disbursement preview"
      );
    }

    return response.data;
  }

  /**
   * Create a new disbursement
   * @param request - CreateDisbursementRequest object containing site_id and user_ids
   * @returns Promise<CreateDisbursementResponse>
   */
  static async createDisbursement(
    request: CreateDisbursementRequest
  ): Promise<CreateDisbursementResponse> {
    // Client-side validation
    if (!request.site_id) {
      throw new Error("Site ID is required");
    }

    if (!request.user_ids || request.user_ids.length === 0) {
      throw new Error("At least one user must be selected for disbursement");
    }

    const response = await apiRequest(
      "POST",
      "/disbursements/create-disbursement/",
      request,
      {
        "Content-Type": "application/json",
      }
    );

    if (!response.success) {
      throw new Error(
        response.error?.message ||
          response.error?.detail ||
          response.error?.non_field_errors?.[0] ||
          "Failed to create disbursement"
      );
    }

    return response.data;
  }

  /**
   * Helper method to validate disbursement request
   * @param request - CreateDisbursementRequest to validate
   * @returns Object with isValid boolean and error message
   */
  static validateDisbursementRequest(request: CreateDisbursementRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (!request.site_id) {
      return { isValid: false, error: "Site ID is required" };
    }

    if (!request.user_ids || request.user_ids.length === 0) {
      return { isValid: false, error: "At least one user must be selected" };
    }

    // Check for valid user IDs
    const hasInvalidIds = request.user_ids.some((id) => !id || id <= 0);
    if (hasInvalidIds) {
      return {
        isValid: false,
        error: "All user IDs must be valid positive numbers",
      };
    }

    return { isValid: true };
  }

  /**
   * Helper method to format currency amounts
   * @param amount - Amount as string or number
   * @returns Formatted currency string
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
   * Helper method to get eligible user IDs from preview
   * @param preview - DisbursementPreview object
   * @returns Array of eligible user IDs
   */
  static getEligibleUserIds(preview: DisbursementPreview): number[] {
    return preview.summary.users
      .filter((user) => user.net_disbursement_amount > 0)
      .map((user) => user.id);
  }
}
