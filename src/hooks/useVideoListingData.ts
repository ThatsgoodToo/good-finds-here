import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Listing = Database['public']['Tables']['listings']['Row'];
type Coupon = Database['public']['Tables']['coupons']['Row'];

type VendorInfo = {
  id: string;
  name: string;
  business_name: string;
  logo: string;
  website: string;
  location: string;
  verified: boolean;
  shipping_options: string[] | null;
  clicks_to_website?: number;
};

export const useVideoListingData = (listingId: string | undefined) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [moreFromVendor, setMoreFromVendor] = useState<Listing[]>([]);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [highFivesCount, setHighFivesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!listingId) return;
      setLoading(true);

      const listingData = await loadListing(listingId);
      if (listingData) {
        setListing(listingData);
        await loadVendorInfo(listingData);
        await loadCoupon(listingId);
        await loadRelatedContent(listingData, listingId);
        await loadHighFives(listingId);
      }

      setLoading(false);
    };

    loadData();
  }, [listingId]);

  const loadListing = async (id: string) => {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data;
  };

  const loadVendorInfo = async (listingData: Listing) => {
    const { data: vendorProfile } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", listingData.vendor_id)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", listingData.vendor_id)
      .maybeSingle();

    if (vendorProfile || profile) {
      setVendor({
        id: listingData.vendor_id,
        name: vendorProfile?.business_name || profile?.display_name || "Vendor",
        business_name: vendorProfile?.business_name || profile?.display_name || "Vendor",
        logo: profile?.avatar_url || "",
        website: vendorProfile?.website || listingData.website_url || "",
        location: vendorProfile 
          ? `${vendorProfile.city}, ${vendorProfile.state_region}` 
          : listingData.location || "",
        verified: vendorProfile?.status === "active",
        shipping_options: vendorProfile?.shipping_options || [],
      });
    }
  };

  const loadCoupon = async (id: string) => {
    const { data: couponData } = await supabase
      .from("coupons")
      .select("*")
      .eq("listing_id", id)
      .eq("active_status", true)
      .gte("end_date", new Date().toISOString())
      .lte("start_date", new Date().toISOString())
      .maybeSingle();

    setActiveCoupon(couponData);
  };

  const loadRelatedContent = async (listingData: Listing, currentId: string) => {
    // Load more from vendor
    const { data: moreListings } = await supabase
      .from("listings")
      .select("*")
      .eq("vendor_id", listingData.vendor_id)
      .eq("status", "active")
      .neq("id", currentId)
      .limit(3);

    setMoreFromVendor(moreListings || []);

    // Load related listings based on categories
    if (listingData.categories && listingData.categories.length > 0) {
      const { data: related } = await supabase
        .from("listings")
        .select("*")
        .neq("id", currentId)
        .eq("status", "active")
        .overlaps("categories", listingData.categories)
        .limit(6);

      setRelatedListings(related || []);
    }
  };

  const loadHighFives = async (id: string) => {
    const { count } = await supabase
      .from("user_saves")
      .select("*", { count: "exact", head: true })
      .eq("save_type", "listing")
      .eq("target_id", id);

    setHighFivesCount(count || 0);
  };

  return {
    listing,
    vendor,
    activeCoupon,
    moreFromVendor,
    relatedListings,
    highFivesCount,
    loading,
  };
};
