import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

export interface VendorSharedOffer {
  id: string;
  coupon_id: string;
  vendor_id: string;
  vendor_name: string;
  shared_at: string;
  shared_ago: string;
  viewed: boolean;
  code: string;
  discount: string;
  discount_type: string;
  discount_value: number;
  end_date: string;
  listing_id: string | null;
  listing_title: string;
  listing_image: string;
  listing_price: number | null;
  listing_type: string;
}

export const useVendorSharedOffers = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["vendor-shared-offers", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: shares, error } = await supabase
        .from("coupon_shares")
        .select(`
          *,
          coupons!inner (
            id,
            code,
            discount_type,
            discount_value,
            end_date,
            start_date,
            active_status,
            listing_id
          ),
          vendor_profiles!inner (
            user_id,
            business_name
          ),
          listings (
            id,
            title,
            image_url,
            price,
            listing_type
          )
        `)
        .eq("shopper_id", userId)
        .eq("coupons.active_status", true)
        .lte("coupons.start_date", new Date().toISOString())
        .gte("coupons.end_date", new Date().toISOString())
        .order("shared_at", { ascending: false });

      if (error) throw error;

      // Format the offers for display
      return (shares || []).map((share: any) => {
        const coupon = share.coupons;
        const vendor = share.vendor_profiles;
        const listing = share.listings;

        // Format discount
        const discount = coupon.discount_type === "percentage"
          ? `${coupon.discount_value}% OFF`
          : `$${coupon.discount_value} OFF`;

        // Calculate time ago
        const shared_ago = formatDistanceToNow(new Date(share.shared_at), { addSuffix: true });

        return {
          id: share.id,
          coupon_id: coupon.id,
          vendor_id: vendor.user_id,
          vendor_name: vendor.business_name || "Local Vendor",
          shared_at: share.shared_at,
          shared_ago,
          viewed: share.viewed,
          code: coupon.code,
          discount,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          end_date: coupon.end_date,
          listing_id: coupon.listing_id,
          listing_title: listing?.title || "Vendor Offer",
          listing_image: listing?.image_url || "/placeholder.svg",
          listing_price: listing?.price,
          listing_type: listing?.listing_type || "product",
        } as VendorSharedOffer;
      });
    },
    enabled: !!userId,
  });

  const markAsViewed = useMutation({
    mutationFn: async (shareId: string) => {
      const { error } = await supabase
        .from("coupon_shares")
        .update({ 
          viewed: true, 
          viewed_at: new Date().toISOString() 
        })
        .eq("id", shareId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-shared-offers", userId] });
    },
  });

  return {
    ...query,
    markAsViewed: markAsViewed.mutate,
    isMarkingViewed: markAsViewed.isPending,
  };
};
