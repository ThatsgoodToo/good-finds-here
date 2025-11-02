import { useState, useEffect, useMemo } from "react";
import type { VendorApplication } from "./useAdminApplications";

export const useApplicationFilters = (applications: VendorApplication[]) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [filteredApplications, setFilteredApplications] = useState<VendorApplication[]>([]);

  useEffect(() => {
    let filtered = applications;

    if (activeFilter !== "all") {
      filtered = filtered.filter((app) => app.status === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.profiles?.full_name?.toLowerCase().includes(query) ||
          app.profiles?.email?.toLowerCase().includes(query) ||
          app.business_type?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, activeFilter, searchQuery]);

  const stats = useMemo(() => ({
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  }), [applications]);

  return {
    filteredApplications,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    stats,
  };
};
