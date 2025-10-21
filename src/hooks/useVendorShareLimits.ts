import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ShareLimits {
  sharesUsed: number;
  sharesRemaining: number;
  maxShares: number;
  loading: boolean;
}

export const useVendorShareLimits = () => {
  const [limits, setLimits] = useState<ShareLimits>({
    sharesUsed: 0,
    sharesRemaining: 20,
    maxShares: 20,
    loading: true,
  });

  useEffect(() => {
    loadShareLimits();
  }, []);

  const loadShareLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLimits({ sharesUsed: 0, sharesRemaining: 20, maxShares: 20, loading: false });
        return;
      }

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("coupon_shares")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", user.id)
        .gte("shared_at", startOfMonth.toISOString());

      if (error) throw error;

      const used = count || 0;
      const maxShares = 20;

      setLimits({
        sharesUsed: used,
        sharesRemaining: Math.max(0, maxShares - used),
        maxShares,
        loading: false,
      });
    } catch (error) {
      console.error("Error loading share limits:", error);
      setLimits({ sharesUsed: 0, sharesRemaining: 20, maxShares: 20, loading: false });
    }
  };

  return { ...limits, refresh: loadShareLimits };
};
