import { apiRequest } from "./api";
import translations from "./translations.json";

// TypeScript Interfaces
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  staff_number: string | null;
}

interface SiteMember {
  id: number;
  user: User;
  site: number;
}

interface SiteManager {
  id: number;
  user: User;
  site: number;
}

interface Site {
  id: number;
  name: string;
  image: string | null;
  location: string;
  auto_execute_accruals: boolean;
  loan_interest_rate: number;
  daily_wage_rate: string;
  created_at: string;
  members: SiteMember[];
  managers: SiteManager[];
}

interface Worker {
  id: number;
  name: string;
  email: string;
  staff_number: string;
  status: string;
  role: 'Manager' | 'Member';
}

interface PhoneNumberInput {
  phone_code: string;
  phone_number: string;
  first_name: string;
  last_name: string;
}

interface AddMembersRequest {
  user_ids: number[];
  phone_numbers: PhoneNumberInput[];
}

interface AddManagersRequest {
  user_ids: number[];
  phone_numbers: PhoneNumberInput[];
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    key?: string;
    originalError?: any;
  };
  status?: number;
}

interface SiteServiceResponse<T = any> {
  success: boolean;
  data?: T;
  site?: Site;
  error?: {
    message: string;
    key?: string;
    originalError?: any;
  };
}

// Translation helper
const getErrorMessage = (key: string, defaultMessage: string, currentLanguage: string = "en"): string => {
  return (
    translations[currentLanguage]?.[key] ||
    translations["en"]?.[key] ||
    defaultMessage
  );
};

class SiteService {
  private static instance: SiteService | null = null;
  private currentLanguage: string = "en";

  static getInstance(): SiteService {
    if (!SiteService.instance) {
      SiteService.instance = new SiteService();
    }
    return SiteService.instance;
  }

  /**
   * Set current language for error messages
   * Call this method when language changes in your app
   */
  setLanguage(language: string): void {
    this.currentLanguage = language || "en";
  }

  /**
   * Get translated error message with current language
   */
  private getTranslatedError(key: string, defaultMessage: string): string {
    return getErrorMessage(key, defaultMessage, this.currentLanguage);
  }

  async getSites(): Promise<SiteServiceResponse<Site[]>> {
    try {
      const response = await apiRequest('GET', '/sites');

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: {
            message: response.error?.message || this.getTranslatedError(
              "failedToFetchSite",
              "Failed to fetch sites"
            )
          },
          data: null
        };
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      return {
        success: false,
        error: {
          message: this.getTranslatedError(
            "failedToFetchSite",
            "Failed to fetch site data"
          )
        },
        data: null
      };
    }
  }

  /**
   * Fetch the current site data
   */
  async getCurrentSite(): Promise<SiteServiceResponse<Site>> {
    try {
      const response = await apiRequest("GET", "/sites/current-site/");

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: {
          message: this.getTranslatedError(
            "failedToFetchSite",
            "Failed to fetch site data"
          ),
          originalError: response.error,
        },
      };
    } catch (error: any) {
      console.error("Error fetching current site:", error);

      // Determine error type for better messaging
      let errorKey = "unexpectedError";
      let errorMessage = this.getTranslatedError(
        "unexpectedError",
        "An unexpected error occurred"
      );

      if (
        error?.code === "NETWORK_ERROR" ||
        error?.message?.includes("Network")
      ) {
        errorKey = "networkError";
        errorMessage = this.getTranslatedError(
          "networkError",
          "Network connection error"
        );
      } else if (
        error?.code === "TIMEOUT" ||
        error?.message?.includes("timeout")
      ) {
        errorKey = "connectionTimeout";
        errorMessage = this.getTranslatedError(
          "connectionTimeout",
          "Connection timeout - please try again"
        );
      } else if (error?.response?.status === 401) {
        errorKey = "authenticationFailed";
        errorMessage = this.getTranslatedError(
          "authenticationFailed",
          "Authentication failed - please login again"
        );
      } else if (error?.response?.status === 403) {
        errorKey = "accessDenied";
        errorMessage = this.getTranslatedError(
          "accessDenied",
          "Access denied - insufficient permissions"
        );
      } else if (error?.response?.status === 404) {
        errorKey = "siteNotFound";
        errorMessage = this.getTranslatedError(
          "siteNotFound",
          "Site not found"
        );
      } else if (error?.response?.status >= 500) {
        errorKey = "serverError";
        errorMessage = this.getTranslatedError(
          "serverError",
          "Server error occurred"
        );
      } else if (error?.response?.status === 429) {
        errorKey = "rateLimitExceeded";
        errorMessage = this.getTranslatedError(
          "rateLimitExceeded",
          "Too many requests - please wait"
        );
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: {
          message: errorMessage,
          key: errorKey,
          originalError: error,
        },
      };
    }
  }

  /**
   * Add members to a specific site
   */
  async addMembers(siteId: number, request: AddMembersRequest): Promise<SiteServiceResponse>  {
    try {
      const response = await apiRequest("POST", `/sites/${siteId}/add-members/`, request);

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: {
          message: this.getTranslatedError(
            "failedToAddMembers",
            "Failed to add members to site"
          ),
          originalError: response.error,
        },
      };
    } catch (error: any) {
      console.error("Error adding members:", error);

      return {
        success: false,
        error: {
          message: this.getTranslatedError(
            "errorAddingMembers",
            "Error adding members to site"
          ),
          key: "errorAddingMembers",
          originalError: error,
        },
      };
    }
  }

  /**
   * Add managers to a specific site
   */
  async addManagers(siteId: number, request: AddManagersRequest): Promise<SiteServiceResponse> {
    try {
      const response = await apiRequest("POST", `/sites/${siteId}/add-managers/`, request);

      if (response.success) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: {
          message: this.getTranslatedError(
            "failedToAddManagers",
            "Failed to add managers to site"
          ),
          originalError: response.error,
        },
      };
    } catch (error: any) {
      console.error("Error adding managers:", error);

      return {
        success: false,
        error: {
          message: this.getTranslatedError(
            "errorAddingManagers",
            "Error adding managers to site"
          ),
          key: "errorAddingManagers",
          originalError: error,
        },
      };
    }
  }

  /**
   * Transform site members and managers into a unified workers array
   */
  transformSiteDataToWorkers(site: Site): Worker[] {
    try {
      if (!site || (!site.members && !site.managers)) {
        return [];
      }

      const workers: Worker[] = [];

      // Add managers
      site.managers?.forEach((manager) => {
        if (manager?.user) {
          workers.push({
            id: manager.user.id,
            name:
              `${manager.user.first_name || ""} ${
                manager.user.last_name || ""
              }`.trim() || "Unknown",
            email: manager.user.email || "",
            staff_number: manager.user.staff_number || "",
            status: "Active", // Default to active, you can add logic here
            role: "Manager",
          });
        }
      });

      // Add members
      site.members?.forEach((member) => {
        if (member?.user) {
          // Avoid duplicates if a user is both manager and member
          const existingWorker = workers.find((w) => w.id === member.user.id);
          if (!existingWorker) {
            workers.push({
              id: member.user.id,
              name:
                `${member.user.first_name || ""} ${
                  member.user.last_name || ""
                }`.trim() || "Unknown",
              email: member.user.email || "",
              staff_number: member.user.staff_number || "",
              status: "Active", // Default to active, you can add logic here
              role: "Member",
            });
          }
        }
      });

      return workers.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error("Error transforming site data to workers:", error);
      return [];
    }
  }

  /**
   * Get all workers (members + managers) for the current site
   */
  async getWorkers(): Promise<SiteServiceResponse<Worker[]>> {
    try {
      const siteResponse = await this.getCurrentSite();

      if (!siteResponse.success || !siteResponse.data) {
        return {
          success: false,
          error: {
            message:
              siteResponse.error?.message ||
              this.getTranslatedError(
                "failedToFetchSite",
                "Failed to fetch site data"
              ),
            originalError: siteResponse.error,
          },
        };
      }

      const workers = this.transformSiteDataToWorkers(siteResponse.data);

      if (
        workers.length === 0 &&
        (siteResponse.data.members?.length > 0 ||
          siteResponse.data.managers?.length > 0)
      ) {
        return {
          success: false,
          error: {
            message: this.getTranslatedError(
              "failedToProcessWorkers",
              "Failed to process workers data"
            ),
            key: "failedToProcessWorkers",
          },
        };
      }

      return {
        success: true,
        data: workers,
        site: siteResponse.data,
      };
    } catch (error: any) {
      console.error("Error getting workers:", error);
      return {
        success: false,
        error: {
          message: this.getTranslatedError(
            "errorGettingWorkers",
            "Error getting workers data"
          ),
          key: "errorGettingWorkers",
          originalError: error,
        },
      };
    }
  }

  /**
   * Validate site data structure
   */
  validateSiteData(site: Site): boolean {
    if (!site) return false;

    const requiredFields: (keyof Site)[] = ["id", "name"];
    return requiredFields.every(
      (field) => site[field] !== undefined && site[field] !== null
    );
  }

  /**
   * Get loading message for current operation
   */
  getLoadingMessage(operation: string): string {
    const loadingKeys: Record<string, string> = {
      fetchSite: "fetchingCurrentSite",
      loadWorkers: "loadingWorkers",
      processData: "processingData",
      retry: "retrying",
      addMembers: "addingMembers",
      addManagers: "addingManagers",
    };

    const key = loadingKeys[operation] || "processingData";
    return this.getTranslatedError(key, "Loading...");
  }

  /**
   * Helper method to create phone number input
   */
  createPhoneNumberInput(
    phoneCode: string,
    phoneNumber: string,
    firstName: string,
    lastName: string
  ): PhoneNumberInput {
    return {
      phone_code: phoneCode,
      phone_number: phoneNumber,
      first_name: firstName,
      last_name: lastName,
    };
  }

  /**
   * Helper method to create add members request
   */
  createAddMembersRequest(
    userIds: number[] = [],
    phoneNumbers: PhoneNumberInput[] = []
  ): AddMembersRequest {
    return {
      user_ids: userIds,
      phone_numbers: phoneNumbers,
    };
  }

  /**
   * Helper method to create add managers request
   */
  createAddManagersRequest(
    userIds: number[] = [],
    phoneNumbers: PhoneNumberInput[] = []
  ): AddManagersRequest {
    return {
      user_ids: userIds,
      phone_numbers: phoneNumbers,
    };
  }
}

// Export the singleton instance
export const siteService = SiteService.getInstance();

// Export types for use in other files
export type {
  Site,
  SiteMember,
  SiteManager,
  User,
  Worker,
  PhoneNumberInput,
  AddMembersRequest,
  AddManagersRequest,
  SiteServiceResponse,
  ApiResponse,
};
