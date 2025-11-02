import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface VendorCoupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  start_date: string;
  end_date: string;
  active_status: boolean;
  is_recurring: boolean;
  listing_id: string | null;
}

export const useVendorCoupons = () => {
  const [coupons, setCoupons] = useState<VendorCoupon[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setCoupons([]);
        return;
      }

      const response = await supabase.functions.invoke('manage-coupons', {
        body: { action: 'list', vendor_id: session.user.id }
      });

      if (response.error) throw response.error;

      const allCoupons = response.data?.coupons || [];
      
      // Sort by quantity available (descending), then by end_date (ascending)
      const sorted = allCoupons.sort((a: VendorCoupon, b: VendorCoupon) => {
        // Calculate remaining uses
        const aRemaining = a.max_uses ? a.max_uses - a.used_count : Infinity;
        const bRemaining = b.max_uses ? b.max_uses - b.used_count : Infinity;
        
        // Sort by remaining quantity (descending)
        if (aRemaining !== bRemaining) {
          return bRemaining - aRemaining;
        }
        
        // If same quantity, sort by end_date (ascending - soonest expiration first)
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      });

      setCoupons(sorted);
    } catch (error) {
      console.error("Error loading coupons:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  return { coupons, loading, refresh: loadCoupons };
};
