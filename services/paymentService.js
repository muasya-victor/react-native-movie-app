// services/paymentService.js
import { apiRequest } from "./api";

export const paymentService = {
  /**
   * Get disbursement preview for a specific site
   * @param {number} siteId - The site ID
   * @returns {Promise<Object>} API response with disbursement data
   */
  getDisbursementPreview: async (siteId) => {
    return await apiRequest(
      "GET",
      `/disbursements/disbursement-preview/?site_id=${siteId}`
    );
  },

  /**
   * Process disbursement for a site
   * @param {number} siteId - The site ID
   * @param {Array} userIds - Array of user IDs to disburse payments to
   * @returns {Promise<Object>} API response
   */
  processDisbursement: async (siteId, userIds = []) => {
    return await apiRequest("POST", "/disbursements/process-disbursement/", {
      site_id: siteId,
      user_ids: userIds,
    });
  },

  /**
   * Get MyPay remittance data
   * @param {number} siteId - The site ID
   * @returns {Promise<Object>} API response with remittance data
   */
  getMyPayData: async (siteId) => {
    return await apiRequest(
      "GET",
      `/payments/mypay-summary/?site_id=${siteId}`
    );
  },

  /**
   * Process MyPay payment
   * @param {number} siteId - The site ID
   * @param {number} amount - Amount to pay
   * @returns {Promise<Object>} API response
   */
  processMyPayPayment: async (siteId, amount) => {
    return await apiRequest("POST", "/payments/process-mypay/", {
      site_id: siteId,
      amount: amount,
    });
  },

  /**
   * Get payment history/reports
   * @param {number} siteId - The site ID
   * @param {Object} filters - Filter options (date range, type, etc.)
   * @returns {Promise<Object>} API response with payment history
   */
  getPaymentReports: async (siteId, filters = {}) => {
    const queryParams = new URLSearchParams({
      site_id: siteId,
      ...filters,
    }).toString();

    return await apiRequest("GET", `/payments/reports/?${queryParams}`);
  },

  /**
   * Get worker payment details
   * @param {number} siteId - The site ID
   * @param {number} workerId - The worker ID (optional)
   * @returns {Promise<Object>} API response with worker payment data
   */
  getWorkerPayments: async (siteId, workerId = null) => {
    const endpoint = workerId
      ? `/payments/workers/${workerId}/?site_id=${siteId}`
      : `/payments/workers/?site_id=${siteId}`;

    return await apiRequest("GET", endpoint);
  },
};
