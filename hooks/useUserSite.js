// hooks/useUserSite.ts
import { useEffect } from "react";
import { useSiteStore } from "../store/siteStore";

export const useUserSite = (autoFetch = true) => {
  const {
    selectedSite,
    fetchCurrentSite,
    isLoadingSite,
    siteError, // Make sure siteError is destructured
    clearSiteError,
  } = useSiteStore();

  useEffect(() => {
    // Only fetch if autoFetch is true, no site is selected, not currently loading,
    // AND there isn't an existing error that would prevent fetching.
    if (autoFetch && !selectedSite && !isLoadingSite && !siteError) {
      fetchCurrentSite();
    }
  }, [autoFetch, selectedSite, isLoadingSite, siteError, fetchCurrentSite]); // <-- Add siteError to the dependency array

  const refetchSite = () => {
    // When retrying, you might want to clear any existing error first
    clearSiteError();
    fetchCurrentSite(true); // Force refresh
  };

  const hasNoSiteAssigned = !selectedSite && !isLoadingSite && siteError;
  const isNoSiteError =
    siteError?.includes("not found") ||
    siteError?.includes("No site") ||
    siteError?.includes("404");

  return {
    selectedSite,
    isLoadingSite,
    siteError,
    hasNoSiteAssigned: hasNoSiteAssigned && isNoSiteError,
    refetchSite,
    clearSiteError,
  };
};