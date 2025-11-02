import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Coupon = Database['public']['Tables']['coupons']['Row'];

export const useListingCoupons = (userId: string | undefined, listingId?: string) => {
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [activeCouponDetails, setActiveCouponDetails] = useState<Coupon | null>(null);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [loadingActiveCoupon, setLoadingActiveCoupon] = useState(false);
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [noActiveCoupons, setNoActiveCoupons] = useState(false);

  // Fetch all vendor's active coupons for selection
  const fetchAvailableCoupons = useCallback(async () => {
    if (!userId) return;
    
    setLoadingCoupons(true);
    try {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('vendor_id', userId)
        .eq('active_status', true)
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAvailableCoupons(coupons || []);
      setNoActiveCoupons(!coupons || coupons.length === 0);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load available coupons');
    } finally {
      setLoadingCoupons(false);
    }
  }, [userId]);

  // Fetch active coupon for a specific listing
  const fetchActiveCoupon = useCallback(async () => {
    if (!listingId) return;
    
    setLoadingActiveCoupon(true);
    try {
      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('listing_id', listingId)
        .eq('active_status', true)
        .gte('end_date', new Date().toISOString())
        .maybeSingle();

      if (error) throw error;

      if (coupons) {
        setActiveCouponDetails(coupons);
        setHasActiveCoupon(true);
      } else {
        setActiveCouponDetails(null);
        setHasActiveCoupon(false);
      }
    } catch (error) {
      console.error('Error fetching active coupon:', error);
      setActiveCouponDetails(null);
      setHasActiveCoupon(false);
    } finally {
      setLoadingActiveCoupon(false);
    }
  }, [listingId]);

  // Remove active coupon from listing
  const removeActiveCoupon = useCallback(async () => {
    if (!activeCouponDetails?.id) return;

    try {
      const { error } = await supabase
        .from('coupons')
        .update({ listing_id: null })
        .eq('id', activeCouponDetails.id);

      if (error) throw error;

      setActiveCouponDetails(null);
      setHasActiveCoupon(false);
      toast.success('Coupon removed from listing');
      
      // Refresh available coupons
      await fetchAvailableCoupons();
    } catch (error) {
      console.error('Error removing coupon:', error);
      toast.error('Failed to remove coupon');
    }
  }, [activeCouponDetails?.id, fetchAvailableCoupons]);

  return {
    availableCoupons,
    activeCouponDetails,
    loadingCoupons,
    loadingActiveCoupon,
    hasActiveCoupon,
    noActiveCoupons,
    fetchAvailableCoupons,
    fetchActiveCoupon,
    removeActiveCoupon,
    setActiveCouponDetails,
    setHasActiveCoupon,
  };
};
