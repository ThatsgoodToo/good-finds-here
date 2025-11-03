import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ShopperMetrics {
  couponsClaimed: number;
  listingsShared: number;
  vendorsFollowed: number;
  itemsSaved: number;
}

export const useShopperActivityMetrics = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["shopper-metrics", userId],
    queryFn: async (): Promise<ShopperMetrics> => {
      if (!userId) {
        return {
          couponsClaimed: 0,
          listingsShared: 0,
          vendorsFollowed: 0,
          itemsSaved: 0,
        };
      }

      // Get coupons claimed count
      const { count: couponsCount } = await supabase
        .from("coupon_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get listings shared count
      const { count: sharesCount } = await supabase
        .from("shares")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      // Get vendors followed count
      const { count: followersCount } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("shopper_id", userId);

      // Get items saved count
      const { count: savesCount } = await supabase
        .from("user_saves")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      return {
        couponsClaimed: couponsCount || 0,
        listingsShared: sharesCount || 0,
        vendorsFollowed: followersCount || 0,
        itemsSaved: savesCount || 0,
      };
    },
    enabled: !!userId,
  });
};
