// types/disbursement.ts

export interface DisbursementUser {
  id: number;
  user_email: string;
  user_name: string;
  user_phone: string;
  pending_accrued_balance: string;
  expected_accrual_amount: number;
  outstanding_food_loan: string;
  outstanding_normal_loan_amount: string;
  net_disbursement_amount: number;
}

export interface DisbursementSummary {
  total_users_eligible: number;
  total_pending_accrued_balance: string;
  total_expected_accrual_amount: string;
  total_outstanding_food_loan: string;
  total_outstanding_normal_loan_amount: string;
  total_net_disbursement_amount: string;
  users: DisbursementUser[];
}

export interface DisbursementPreview {
  site_id: number;
  site_name: string;
  summary: DisbursementSummary;
  generated_at: string;
}

export interface CreateDisbursementRequest {
  site_id: number;
  user_ids: number[];
}

export interface DisbursementDetail {
  id: number;
  in_favor_of_user: number;
  user_email: string;
  user_name: string;
  user_phone: string;
  amount: string;
  wallet_balance_before: string;
  wallet_balance_after: string;
}

export interface CreateDisbursementResponse {
  data: {
    id: number;
    disbursed_by: number;
    disbursed_by_email: string;
    disbursed_by_name: string;
    total_amount_disbursed: string;
    disbursement_time: string;
    site: number;
    site_name: string;
    total_users_disbursed: string;
    disbursement_details: DisbursementDetail[];
  };
}

export interface DisbursementState {
  // Data
  preview: DisbursementPreview | null;
  lastDisbursementResult: CreateDisbursementResponse | null;

  // Loading states
  isLoadingPreview: boolean;
  isCreatingDisbursement: boolean;

  // Error states
  previewError: string | null;
  createError: string | null;

  // Actions
  getDisbursementPreview: (siteId: number) => Promise<void>;
  createDisbursement: (
    request: CreateDisbursementRequest
  ) => Promise<CreateDisbursementResponse | null>;
  clearErrors: () => void;
  clearPreview: () => void;
  clearLastResult: () => void;
}
