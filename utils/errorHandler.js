// utils/errorHandler.js
import Toast from "react-native-toast-message";

/**
 * Enhanced error handler that standardizes errors and shows toast notifications
 * Replaces the standardizeError function with comprehensive error handling and toast display
 * @param {Object} error - The error object from axios/API response
 * @returns {Object} - Standardized error object
 */
export const handleErrorWithToast = (error) => {
  const status = error.response?.status || 500;
  let standardizedError;

  // For 500+ errors, return a standardized JSON error object
  if (status >= 500) {
    standardizedError = {
      error: "Internal Server Error",
      message: "An unexpected server error occurred. Please try again later.",
      status: status,
      code: "SERVER_ERROR",
      timestamp: new Date().toISOString(),
    };

    // Show simple toast for server errors
    Toast.show({
      type: "error",
      text1: "Server Error",
      text2: "An unexpected server error occurred. Please try again later.",
      position: "bottom",
      visibilityTime: 4000,
    });

    return standardizedError;
  }

  // For 404 errors, return a standardized JSON error object
  if (status === 404) {
    standardizedError = {
      error: "Not Found",
      message:
        "The requested resource was not found. Please check the URL and try again.",
      status: status,
      code: "NOT_FOUND",
      timestamp: new Date().toISOString(),
    };

    Toast.show({
      type: "error",
      text1: "Not Found",
      text2: "The requested resource was not found.",
      position: "bottom",
      visibilityTime: 4000,
    });

    return standardizedError;
  }

  // For 401 errors
  if (status === 401) {
    standardizedError = {
      error: "Unauthorized",
      message: "Your session has expired. Please login again.",
      status: status,
      code: "UNAUTHORIZED",
      timestamp: new Date().toISOString(),
    };
    console.log("401 Unauthorized ");

    Toast.show({
      type: "error",
      text1: "Unauthorized",
      text2: "Your session has expired. Please login again.",
      position: "bottom",
      visibilityTime: 4000,
    });

    return standardizedError;
  }

  // For other errors, get the original error data
  const errorData = error.response?.data || {
    error: "Request Failed",
    message: error.message || "An unknown error occurred",
    status: status,
    code: "REQUEST_ERROR",
    timestamp: new Date().toISOString(),
  };

  // Handle Django validation errors
  if (errorData && typeof errorData === "object") {
    // Handle field validation errors (Django style)
    const fieldErrors = {};
    let hasFieldErrors = false;

    // Check for field-specific errors
    Object.keys(errorData).forEach((key) => {
      // Skip non-field error keys
      if (
        ![
          "detail",
          "message",
          "error",
          "non_field_errors",
          "status",
          "code",
          "timestamp",
        ].includes(key)
      ) {
        if (
          Array.isArray(errorData[key]) ||
          typeof errorData[key] === "string"
        ) {
          fieldErrors[key] = errorData[key];
          hasFieldErrors = true;
        }
      }
    });

    // Display field validation errors one by one
    if (hasFieldErrors) {
      let delay = 0;

      Object.keys(fieldErrors).forEach((fieldName) => {
        const fieldMessages = Array.isArray(fieldErrors[fieldName])
          ? fieldErrors[fieldName]
          : [fieldErrors[fieldName]];

        fieldMessages.forEach((message) => {
          setTimeout(() => {
            Toast.show({
              type: "error",
              text1: "Validation Error",
              text2: `${fieldName}: ${message}`,
              position: "bottom",
              visibilityTime: 4000,
            });
          }, delay);
          delay += 1500; // 1.5 second delay between toasts
        });
      });
    }

    // Handle non-field errors
    if (
      errorData.non_field_errors &&
      Array.isArray(errorData.non_field_errors)
    ) {
      let delay = hasFieldErrors ? Object.keys(fieldErrors).length * 1500 : 0;

      errorData.non_field_errors.forEach((message) => {
        setTimeout(() => {
          Toast.show({
            type: "error",
            text1: "Validation Error",
            text2: message,
            position: "bottom",
            visibilityTime: 4000,
          });
        }, delay);
        delay += 1500;
      });
    }

    // If no field errors or non_field_errors, check for detail/message
    if (!hasFieldErrors && !errorData.non_field_errors) {
      let errorMessage = "";
      let errorTitle = "Error";

      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error && typeof errorData.error === "string") {
        errorMessage = errorData.error;
      }

      // Set appropriate error titles based on status
      switch (status) {
        case 400:
          errorTitle = "Bad Request";
          if (!errorMessage)
            errorMessage =
              "Invalid request. Please check your input and try again.";
          break;
        case 403:
          errorTitle = "Forbidden";
          if (!errorMessage)
            errorMessage = "You do not have permission to perform this action.";
          break;
        case 409:
          errorTitle = "Conflict";
          if (!errorMessage)
            errorMessage =
              "A conflict occurred. The resource may already exist.";
          break;
        case 422:
          errorTitle = "Validation Error";
          if (!errorMessage) errorMessage = "The submitted data is invalid.";
          break;
        case 429:
          errorTitle = "Too Many Requests";
          if (!errorMessage)
            errorMessage =
              "Too many requests. Please wait a moment and try again.";
          break;
        default:
          if (!errorMessage) errorMessage = "An unexpected error occurred.";
      }

      if (errorMessage) {
        Toast.show({
          type: "error",
          text1: errorTitle,
          text2: errorMessage,
          position: "bottom",
          visibilityTime: 4000,
        });
      }
    }
  }

  return errorData;
};
