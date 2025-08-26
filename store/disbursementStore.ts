// store/disbursementStore.ts
import { create } from "zustand";
import { DisbursementService } from "../services/disbursementService";
import {
  CreateDisbursementRequest,
  CreateDisbursementResponse,
  DisbursementState,
} from "../types/disbursement";

export const useDisbursementStore = create<DisbursementState>((set, get) => ({
  // Initial state
  preview: null,
  lastDisbursementResult: null,
  isLoadingPreview: false,
  isCreatingDisbursement: false,
  previewError: null,
  createError: null,

  // Actions
  getDisbursementPreview: async (siteId: number) => {
    set({
      isLoadingPreview: true,
      previewError: null,
    });

    try {
      const preview = await DisbursementService.getDisbursementPreview(siteId);
      set({
        preview: preview,
        isLoadingPreview: false,
        previewError: null,
      });
      return preview;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load disbursement preview";
      set({
        preview: null,
        isLoadingPreview: false,
        previewError: errorMessage,
      });

      // Re-throw error for toast handling in component
      throw error;
    }
  },

  createDisbursement: async (
    request: CreateDisbursementRequest
  ): Promise<CreateDisbursementResponse | null> => {
    set({
      isCreatingDisbursement: true,
      createError: null,
      lastDisbursementResult: null,
    });

    try {
      // Validate request before sending
      const validation =
        DisbursementService.validateDisbursementRequest(request);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const result = await DisbursementService.createDisbursement(request);

      set({
        lastDisbursementResult: result,
        isCreatingDisbursement: false,
        createError: null,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create disbursement";
      set({
        lastDisbursementResult: null,
        isCreatingDisbursement: false,
        createError: errorMessage,
      });

      // Re-throw error for toast handling in component
      throw error;
    }
  },

  clearErrors: () => {
    set({
      previewError: null,
      createError: null,
    });
  },

  clearPreview: () => {
    set({
      preview: null,
      previewError: null,
    });
  },

  clearLastResult: () => {
    set({
      lastDisbursementResult: null,
      createError: null,
    });
  },
}));

// Selectors for better performance and cleaner component code
export const useDisbursementPreview = () =>
  useDisbursementStore((state) => state.preview);
export const useDisbursementPreviewLoading = () =>
  useDisbursementStore((state) => state.isLoadingPreview);
export const useDisbursementPreviewError = () =>
  useDisbursementStore((state) => state.previewError);

export const useDisbursementResult = () =>
  useDisbursementStore((state) => state.lastDisbursementResult);
export const useDisbursementCreating = () =>
  useDisbursementStore((state) => state.isCreatingDisbursement);
export const useDisbursementCreateError = () =>
  useDisbursementStore((state) => state.createError);

// Action selectors
export const useDisbursementActions = () =>
  useDisbursementStore((state) => ({
    getDisbursementPreview: state.getDisbursementPreview,
    createDisbursement: state.createDisbursement,
    clearErrors: state.clearErrors,
    clearPreview: state.clearPreview,
    clearLastResult: state.clearLastResult,
  }));

// Computed selectors
export const useDisbursementSummary = () => {
  const preview = useDisbursementPreview();
  if (!preview) return null;

  return {
    siteName: preview.site_name,
    totalUsers: preview.summary.total_users_eligible,
    totalAmount: preview.summary.total_net_disbursement_amount,
    generatedAt: preview.generated_at,
    eligibleUserIds: DisbursementService.getEligibleUserIds(preview),
  };
};

export const useCanDisburse = () => {
  const preview = useDisbursementPreview();
  const isCreating = useDisbursementCreating();

  if (!preview || isCreating) return false;

  return (
    preview.summary.total_users_eligible > 0 &&
    parseFloat(preview.summary.total_net_disbursement_amount) > 0
  );
};
