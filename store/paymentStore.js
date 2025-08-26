// store/paymentStore.js
import { create } from "zustand";
import { paymentService } from "../services/paymentService";

export const usePaymentStore = create((set, get) => ({
  // State
  disbursementData: null,
  myPayData: null,
  paymentReports: [],
  workerPayments: [],

  // Loading states
  isLoadingDisbursement: false,
  isLoadingMyPay: false,
  isLoadingReports: false,
  isLoadingWorkers: false,
  isProcessingPayment: false,

  // Error states
  disbursementError: null,
  myPayError: null,
  reportsError: null,
  workersError: null,
  paymentError: null,

  // Actions
  /**
   * Fetch disbursement preview data
   */
  fetchDisbursementPreview: async (siteId) => {
    set({ isLoadingDisbursement: true, disbursementError: null });

    try {
      const response = await paymentService.getDisbursementPreview(siteId);

      if (response.success) {
        set({
          disbursementData: response.data,
          isLoadingDisbursement: false,
        });
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch disbursement data");
      }
    } catch (error) {
      set({
        disbursementError: error.message,
        isLoadingDisbursement: false,
      });
      throw error;
    }
  },

  /**
   * Process disbursement
   */
  processDisbursement: async (siteId, userIds = []) => {
    set({ isProcessingPayment: true, paymentError: null });

    try {
      const response = await paymentService.processDisbursement(
        siteId,
        userIds
      );

      if (response.success) {
        set({ isProcessingPayment: false });

        // Refresh disbursement data after successful processing
        get().fetchDisbursementPreview(siteId);

        return response.data;
      } else {
        throw new Error(response.error || "Failed to process disbursement");
      }
    } catch (error) {
      set({
        paymentError: error.message,
        isProcessingPayment: false,
      });
      throw error;
    }
  },

  /**
   * Fetch MyPay data
   */
  fetchMyPayData: async (siteId) => {
    set({ isLoadingMyPay: true, myPayError: null });

    try {
      const response = await paymentService.getMyPayData(siteId);

      if (response.success) {
        set({
          myPayData: response.data,
          isLoadingMyPay: false,
        });
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch MyPay data");
      }
    } catch (error) {
      set({
        myPayError: error.message,
        isLoadingMyPay: false,
      });
      throw error;
    }
  },

  /**
   * Process MyPay payment
   */
  processMyPayPayment: async (siteId, amount) => {
    set({ isProcessingPayment: true, paymentError: null });

    try {
      const response = await paymentService.processMyPayPayment(siteId, amount);

      if (response.success) {
        set({ isProcessingPayment: false });

        // Refresh MyPay data after successful processing
        get().fetchMyPayData(siteId);

        return response.data;
      } else {
        throw new Error(response.error || "Failed to process MyPay payment");
      }
    } catch (error) {
      set({
        paymentError: error.message,
        isProcessingPayment: false,
      });
      throw error;
    }
  },

  /**
   * Fetch payment reports
   */
  fetchPaymentReports: async (siteId, filters = {}) => {
    set({ isLoadingReports: true, reportsError: null });

    try {
      const response = await paymentService.getPaymentReports(siteId, filters);

      if (response.success) {
        set({
          paymentReports: response.data,
          isLoadingReports: false,
        });
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch payment reports");
      }
    } catch (error) {
      set({
        reportsError: error.message,
        isLoadingReports: false,
      });
      throw error;
    }
  },

  /**
   * Fetch worker payments
   */
  fetchWorkerPayments: async (siteId, workerId = null) => {
    set({ isLoadingWorkers: true, workersError: null });

    try {
      const response = await paymentService.getWorkerPayments(siteId, workerId);

      if (response.success) {
        set({
          workerPayments: response.data,
          isLoadingWorkers: false,
        });
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch worker payments");
      }
    } catch (error) {
      set({
        workersError: error.message,
        isLoadingWorkers: false,
      });
      throw error;
    }
  },

  /**
   * Clear all errors
   */
  clearErrors: () => {
    set({
      disbursementError: null,
      myPayError: null,
      reportsError: null,
      workersError: null,
      paymentError: null,
    });
  },

  /**
   * Reset store to initial state
   */
  resetStore: () => {
    set({
      disbursementData: null,
      myPayData: null,
      paymentReports: [],
      workerPayments: [],
      isLoadingDisbursement: false,
      isLoadingMyPay: false,
      isLoadingReports: false,
      isLoadingWorkers: false,
      isProcessingPayment: false,
      disbursementError: null,
      myPayError: null,
      reportsError: null,
      workersError: null,
      paymentError: null,
    });
  },
}));
