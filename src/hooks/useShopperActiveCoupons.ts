import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface ShopperActiveCoupon {
  id: string;
  code: string;
  discount: string;
  expires: string;
  listing_id: string;
  listing_title: string;
  listing_image: string;
  vendor_id: string;
  vendor_name: string;
  vendor_website: string | null;
  discount_type: string;
  discount_value: number;
  end_date: string;
}

export const useShopperActiveCoupons = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["shopper-active-coupons", userId],
    queryFn: async () => {
      if (!userId) return [];

      // Get saved listing IDs
      const { data: savedListings } = await supabase
        .from("user_saves")
        .select("target_id")
        .eq("user_id", userId)
        .eq("save_type", "listing");

      const savedListingIds = savedListings?.map(s => s.target_id) || [];

      // Get saved vendor IDs
      const { data: savedVendors } = await supabase
        .from("user_saves")
        .select("target_id")
        .eq("user_id", userId)
        .eq("save_type", "vendor");

      const savedVendorIds = savedVendors?.map(s => s.target_id) || [];

      if (savedListingIds.length === 0 && savedVendorIds.length === 0) {
        return [];
      }

      // Query coupons from saved listings and vendors
      const now = new Date().toISOString();
      
      // Build OR condition for saved items
      const filters = [];
      if (savedListingIds.length > 0) {
        filters.push(`listing_id.in.(${savedListingIds.join(",")})`);
      }
      if (savedVendorIds.length > 0) {
        filters.push(`vendor_id.in.(${savedVendorIds.join(",")})`);
      }

      if (filters.length === 0) {
        return [];
      }

      const { data: coupons, error } = await supabase
        .from("coupons")
        .select(`
          *,
          listings:listing_id (
            id,
            title,
            image_url
          ),
          vendor_profiles:vendor_id (
            user_id,
            business_name,
            website
          )
        `)
        .or(filters.join(","))
        .eq("active_status", true)
        .lte("start_date", now)
        .gte("end_date", now)
        .order("created_at", { ascending: false });

      if (error) {
        console.error('[useShopperActiveCoupons] Query failed:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      // Format coupons for display
      return (coupons || []).map((coupon: any) => {
        const listing = coupon.listings;
        const vendor = coupon.vendor_profiles;

        // Format discount
        const discount = coupon.discount_type === "percentage"
          ? `${coupon.discount_value}% OFF`
          : `$${coupon.discount_value} OFF`;

        // Format expiration date
        const expires = format(new Date(coupon.end_date), "MMM dd, yyyy");

        return {
          id: coupon.id,
          code: coupon.code,
          discount,
          expires,
          listing_id: listing?.id || "",
          listing_title: listing?.title || "Unknown Listing",
          listing_image: listing?.image_url || "/placeholder.svg",
          vendor_id: coupon.vendor_id,
          vendor_name: vendor?.business_name || "Local Vendor",
          vendor_website: vendor?.website || null,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          end_date: coupon.end_date,
        } as ShopperActiveCoupon;
      });
    },
    enabled: !!userId,
  });
};
