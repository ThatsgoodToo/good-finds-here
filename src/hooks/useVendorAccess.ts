import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type VendorAccessStatus = "loading" | "approved" | "pending" | "rejected" | "no-application";

export const useVendorAccess = () => {
  const { user, roles } = useAuth();
  const [status, setStatus] = useState<VendorAccessStatus>("loading");

  useEffect(() => {
    const checkVendorAccess = async () => {
      if (!user) {
        setStatus("no-application");
        return;
      }

      // If user already has vendor role, they're approved
      if (roles.includes("vendor")) {
        setStatus("approved");
        return;
      }

      // Check application status
      try {
        const { data: applicationStatus, error } = await supabase
          .rpc("get_vendor_application_status", { _user_id: user.id });

        if (error) {
          console.error("Error checking application status:", error);
          setStatus("no-application");
          return;
        }

        if (!applicationStatus) {
          setStatus("no-application");
        } else if (applicationStatus === "pending") {
          setStatus("pending");
        } else if (applicationStatus === "rejected") {
          setStatus("rejected");
        } else if (applicationStatus === "approved") {
          // Approved but no vendor role yet (edge case)
          setStatus("approved");
        } else {
          setStatus("no-application");
        }
      } catch (error) {
        console.error("Error in useVendorAccess:", error);
        setStatus("no-application");
      }
    };

    checkVendorAccess();
  }, [user, roles]);

  return {
    status,
    isLoading: status === "loading",
    isApproved: status === "approved",
    isPending: status === "pending",
    isRejected: status === "rejected",
    hasNoApplication: status === "no-application",
  };
};
