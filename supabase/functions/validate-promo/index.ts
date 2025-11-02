import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const validatePromoSchema = z.object({
  promoCode: z.string()
    .trim()
    .min(1, 'Promo code is required')
    .max(50, 'Promo code too long')
    .transform(val => val.toUpperCase()),
  subscriptionType: z.string().optional(),
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();

    // Validate and sanitize input
    const { promoCode: normalizedCode, subscriptionType } = validatePromoSchema.parse(body);

    // Check if valid promo code
    if (normalizedCode !== 'THATSGOODTOO25') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid promo code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already redeemed this code
    const { data: existingRedemption } = await supabaseClient
      .from('promo_redemptions')
      .select('id')
      .eq('promo_code', normalizedCode)
      .eq('user_id', user.id)
      .single();

    if (existingRedemption) {
      return new Response(
        JSON.stringify({ valid: false, error: 'You have already redeemed this promo code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check total redemptions count
    const { count } = await supabaseClient
      .from('promo_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('promo_code', normalizedCode);

    const MAX_CLAIMS = 500;
    const remainingClaims = MAX_CLAIMS - (count || 0);

    if (remainingClaims <= 0) {
      return new Response(
        JSON.stringify({ valid: false, error: 'This promo code has reached its claim limit' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If creating subscription (not just validating)
    if (subscriptionType) {
      // Calculate end date (1 year for founding member)
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      // Create subscription
      const { data: subscription, error: subError } = await supabaseClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          subscription_type: 'founding_member',
          promo_code: normalizedCode,
          end_date: endDate.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (subError) {
        console.error('Subscription creation error:', subError);
        return new Response(
          JSON.stringify({ valid: false, error: 'Failed to create subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Record redemption
      const { error: redemptionError } = await supabaseClient
        .from('promo_redemptions')
        .insert({
          promo_code: normalizedCode,
          user_id: user.id,
          subscription_id: subscription.id
        });

      if (redemptionError) {
        console.error('Redemption record error:', redemptionError);
      }

      // Update profile status
      await supabaseClient
        .from('profiles')
        .update({ subscription_status: 'founding_member' })
        .eq('id', user.id);

      return new Response(
        JSON.stringify({
          valid: true,
          subscriptionCreated: true,
          remainingClaims: remainingClaims - 1,
          endDate: endDate.toISOString()
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Just validation
    return new Response(
      JSON.stringify({
        valid: true,
        remainingClaims
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in validate-promo:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});