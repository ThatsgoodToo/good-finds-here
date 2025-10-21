import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get user's subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subError || !subscription) {
      return new Response(
        JSON.stringify({
          hasSubscription: false,
          status: 'none'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Check if subscription should be marked as expiring soon
    if (daysRemaining <= 7 && daysRemaining > 0 && subscription.status === 'active') {
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'expiring_soon' })
        .eq('id', subscription.id);
      
      subscription.status = 'expiring_soon';
    }

    // Check if subscription has expired
    if (daysRemaining <= 0 && subscription.status !== 'expired') {
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id);
      
      await supabaseClient
        .from('profiles')
        .update({ subscription_status: 'expired' })
        .eq('id', user.id);
      
      subscription.status = 'expired';
    }

    return new Response(
      JSON.stringify({
        hasSubscription: true,
        subscription: {
          type: subscription.subscription_type,
          status: subscription.status,
          startDate: subscription.start_date,
          endDate: subscription.end_date,
          daysRemaining: Math.max(0, daysRemaining),
          promoCode: subscription.promo_code
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in check-subscription:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});