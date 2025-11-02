import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export interface PendingCouponData {
  code?: string;
  discount_type?: string;
  discount_value?: number;
  max_uses?: number;
  start_date?: Date;
  end_date?: Date;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  couponId?: string;
}

export interface CouponOperationResult {
  success: boolean;
  error?: string;
}

export const attachExistingCoupon = async (
  supabase: SupabaseClient<Database>,
  couponId: string,
  listingId: string,
  userId: string
): Promise<CouponOperationResult> => {
  // Verify the coupon belongs to this vendor
  const { data: coupon, error: fetchError } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", couponId)
    .eq("vendor_id", userId)
    .maybeSingle();

  if (fetchError || !coupon) {
    return { 
      success: false, 
      error: "Coupon not found or you don't have permission to use it" 
    };
  }

  // Check if another listing already has this coupon
  if (coupon.listing_id && coupon.listing_id !== listingId) {
    return { 
      success: false, 
      error: "This coupon is already attached to another listing" 
    };
  }

  // Update coupon to attach to listing
  const { error: updateError } = await supabase
    .from("coupons")
    .update({ listing_id: listingId })
    .eq("id", couponId);

  if (updateError) {
    return { success: false, error: "Failed to attach coupon" };
  }

  return { success: true };
};

export const createNewCoupon = async (
  supabase: SupabaseClient<Database>,
  couponData: PendingCouponData,
  listingId: string,
  vendorId: string
): Promise<CouponOperationResult> => {
  if (!couponData.code || !couponData.discount_type || !couponData.discount_value) {
    return { success: false, error: "Missing required coupon data" };
  }

  const { error } = await supabase.from("coupons").insert({
    vendor_id: vendorId,
    listing_id: listingId,
    code: couponData.code,
    discount_type: couponData.discount_type,
    discount_value: couponData.discount_value,
    max_uses: couponData.max_uses || null,
    start_date: couponData.start_date?.toISOString() || new Date().toISOString(),
    end_date: couponData.end_date?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_recurring: couponData.is_recurring || false,
    recurrence_pattern: couponData.recurrence_pattern || null,
    active_status: true,
    used_count: 0
  });

  if (error) {
    return { success: false, error: "Failed to create coupon" };
  }

  return { success: true };
};

export const detachCoupon = async (
  supabase: SupabaseClient<Database>,
  couponId: string,
  userId: string
): Promise<CouponOperationResult> => {
  const { error } = await supabase
    .from("coupons")
    .update({ listing_id: null })
    .eq("id", couponId)
    .eq("vendor_id", userId);

  if (error) {
    return { success: false, error: "Failed to detach coupon" };
  }

  return { success: true };
};
