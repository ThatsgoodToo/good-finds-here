import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const shareCouponSchema = z.object({
  coupon_id: z.string().uuid('Invalid coupon ID format'),
  shopper_id: z.string().uuid('Invalid shopper ID format'),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is a vendor
    const { data: role } = await supabaseClient.rpc('get_user_role', {
      _user_id: user.id
    });

    if (role !== 'vendor') {
      return new Response(
        JSON.stringify({ error: 'Only vendors can share coupons' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();

    // Validate and sanitize input
    const { coupon_id, shopper_id } = shareCouponSchema.parse(body);

    // Check monthly share limit (20 shares per vendor per month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: shareCount, error: countError } = await supabaseClient
      .from('coupon_shares')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', user.id)
      .gte('shared_at', startOfMonth.toISOString());

    if (countError) {
      console.error("Error counting shares:", countError);
      throw new Error('Failed to check share limit');
    }

    if (shareCount !== null && shareCount >= 20) {
      return new Response(
        JSON.stringify({ error: 'Monthly share limit reached (20 shares per month)' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify coupon exists and belongs to vendor
    const { data: coupon, error: couponError } = await supabaseClient
      .from('coupons')
      .select('id, code, vendor_id, active_status, end_date')
      .eq('id', coupon_id)
      .single();

    if (couponError || !coupon) {
      console.error("Coupon error:", couponError);
      return new Response(
        JSON.stringify({ error: 'Coupon not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (coupon.vendor_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You can only share your own coupons' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!coupon.active_status) {
      return new Response(
        JSON.stringify({ error: 'Cannot share inactive coupon' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new Date(coupon.end_date) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Cannot share expired coupon' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify shopper exists
    const { data: shopper, error: shopperError } = await supabaseClient
      .from('profiles')
      .select('id, display_name')
      .eq('id', shopper_id)
      .single();

    if (shopperError || !shopper) {
      console.error("Shopper error:", shopperError);
      return new Response(
        JSON.stringify({ error: 'Shopper not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already shared to this shopper (prevent duplicates within 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const { data: existingShare } = await supabaseClient
      .from('coupon_shares')
      .select('id')
      .eq('coupon_id', coupon_id)
      .eq('shopper_id', shopper_id)
      .gte('shared_at', oneDayAgo.toISOString())
      .maybeSingle();

    if (existingShare) {
      return new Response(
        JSON.stringify({ error: 'Coupon already shared with this shopper recently' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create share record
    const { data: share, error: shareError } = await supabaseClient
      .from('coupon_shares')
      .insert({
        coupon_id,
        vendor_id: user.id,
        shopper_id,
      })
      .select()
      .single();

    if (shareError) {
      console.error("Share error:", shareError);
      throw new Error('Failed to share coupon');
    }

    console.log(`Coupon ${coupon.code} shared with shopper ${shopper_id} by vendor ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        share_id: share.id,
        coupon_code: coupon.code,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in share-coupon function:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
