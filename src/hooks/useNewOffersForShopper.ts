import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CategoryType } from "@/components/ProductCard";

export interface NewOffer {
  id: string;
  title: string;
  vendor: string;
  vendorId: string;
  image: string;
  price: string | null;
  type: CategoryType;
  discount?: string;
  isNew?: boolean;
  matchedInterests?: string[];
}

export const useNewOffersForShopper = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["new-offers", userId],
    queryFn: async () => {
      if (!userId) return [];

      const allOffers: NewOffer[] = [];
      const seenIds = new Set<string>();

      // Get user interests
      const { data: profile } = await supabase
        .from("profiles")
        .select("interests")
        .eq("id", userId)
        .maybeSingle();

      const userInterests = profile?.interests || [];

      // Get saved vendor IDs
      const { data: savedVendors } = await supabase
        .from("user_saves")
        .select("target_id")
        .eq("user_id", userId)
        .eq("save_type", "vendor");

      const savedVendorIds = savedVendors?.map(s => s.target_id) || [];

      // 1. Get new listings from saved vendors (last 30 days)
      if (savedVendorIds.length > 0) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: newListings } = await supabase
          .from("listings")
          .select(`
            id,
            title,
            image_url,
            price,
            listing_type,
            vendor_id,
            created_at
          `)
          .in("vendor_id", savedVendorIds)
          .eq("status", "active")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(10);

        if (newListings) {
          for (const listing of newListings) {
            if (seenIds.has(listing.id)) continue;
            seenIds.add(listing.id);

            // Get vendor name
            const { data: vendorProfile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", listing.vendor_id)
              .maybeSingle();

            // Check for active coupon
            const { data: coupon } = await supabase
              .from("coupons")
              .select("discount_type, discount_value")
              .eq("listing_id", listing.id)
              .eq("active_status", true)
              .gte("end_date", new Date().toISOString())
              .lte("start_date", new Date().toISOString())
              .maybeSingle();

            let discount: string | undefined;
            if (coupon) {
              discount = coupon.discount_type === "percentage"
                ? `${coupon.discount_value}% OFF`
                : `$${coupon.discount_value} OFF`;
            }

            allOffers.push({
              id: listing.id,
              title: listing.title,
              vendor: vendorProfile?.display_name || "Vendor",
              vendorId: listing.vendor_id,
              image: listing.image_url || "",
              price: listing.price ? `$${listing.price}` : null,
              type: listing.listing_type as CategoryType,
              discount,
              isNew: true,
            });
          }
        }
      }

      // 2. Get listings matching user interests
      if (userInterests.length > 0) {
        const { data: matchedListings } = await supabase
          .from("listings")
          .select(`
            id,
            title,
            image_url,
            price,
            listing_type,
            vendor_id,
            categories,
            tags
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(20);

        if (matchedListings) {
          for (const listing of matchedListings) {
            if (seenIds.has(listing.id)) continue;

            // Check if listing matches interests
            const matchedInterests: string[] = [];
            
            if (listing.categories) {
              for (const interest of userInterests) {
                if (listing.categories.some((cat: string) => 
                  cat.toLowerCase().includes(interest.toLowerCase()) ||
                  interest.toLowerCase().includes(cat.toLowerCase())
                )) {
                  matchedInterests.push(interest);
                }
              }
            }

            if (listing.tags) {
              for (const interest of userInterests) {
                if (listing.tags.some((tag: string) => 
                  tag.toLowerCase().includes(interest.toLowerCase()) ||
                  interest.toLowerCase().includes(tag.toLowerCase())
                )) {
                  if (!matchedInterests.includes(interest)) {
                    matchedInterests.push(interest);
                  }
                }
              }
            }

            if (matchedInterests.length === 0) continue;
            seenIds.add(listing.id);

            // Get vendor name
            const { data: vendorProfile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", listing.vendor_id)
              .maybeSingle();

            // Check for active coupon
            const { data: coupon } = await supabase
              .from("coupons")
              .select("discount_type, discount_value")
              .eq("listing_id", listing.id)
              .eq("active_status", true)
              .gte("end_date", new Date().toISOString())
              .lte("start_date", new Date().toISOString())
              .maybeSingle();

            let discount: string | undefined;
            if (coupon) {
              discount = coupon.discount_type === "percentage"
                ? `${coupon.discount_value}% OFF`
                : `$${coupon.discount_value} OFF`;
            }

            allOffers.push({
              id: listing.id,
              title: listing.title,
              vendor: vendorProfile?.display_name || "Vendor",
              vendorId: listing.vendor_id,
              image: listing.image_url || "",
              price: listing.price ? `$${listing.price}` : null,
              type: listing.listing_type as CategoryType,
              discount,
              matchedInterests: matchedInterests.slice(0, 2),
            });
          }
        }
      }

      // 3. Get popular listings with active coupons (for users without interests)
      if (allOffers.length < 6) {
        const { data: popularWithCoupons } = await supabase
          .from("coupons")
          .select(`
            listing_id,
            discount_type,
            discount_value
          `)
          .eq("active_status", true)
          .gte("end_date", new Date().toISOString())
          .lte("start_date", new Date().toISOString())
          .limit(10);

        if (popularWithCoupons) {
          for (const coupon of popularWithCoupons) {
            if (!coupon.listing_id || seenIds.has(coupon.listing_id)) continue;

            const { data: listing } = await supabase
              .from("listings")
              .select(`
                id,
                title,
                image_url,
                price,
                listing_type,
                vendor_id
              `)
              .eq("id", coupon.listing_id)
              .eq("status", "active")
              .maybeSingle();

            if (!listing) continue;
            seenIds.add(listing.id);

            // Get vendor name
            const { data: vendorProfile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", listing.vendor_id)
              .maybeSingle();

            const discount = coupon.discount_type === "percentage"
              ? `${coupon.discount_value}% OFF`
              : `$${coupon.discount_value} OFF`;

            allOffers.push({
              id: listing.id,
              title: listing.title,
              vendor: vendorProfile?.display_name || "Vendor",
              vendorId: listing.vendor_id,
              image: listing.image_url || "",
              price: listing.price ? `$${listing.price}` : null,
              type: listing.listing_type as CategoryType,
              discount,
            });

            if (allOffers.length >= 12) break;
          }
        }
      }

      return allOffers.slice(0, 12);
    },
    enabled: !!userId,
  });
};
