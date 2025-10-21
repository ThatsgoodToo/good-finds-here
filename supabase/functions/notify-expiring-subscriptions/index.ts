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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Find subscriptions expiring in 7 days that haven't been notified
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const eightDaysFromNow = new Date();
    eightDaysFromNow.setDate(eightDaysFromNow.getDate() + 8);

    const { data: expiringSubscriptions, error } = await supabaseClient
      .from('subscriptions')
      .select('*, profiles(email, display_name)')
      .eq('status', 'active')
      .eq('notified_expiring', false)
      .gte('end_date', sevenDaysFromNow.toISOString())
      .lt('end_date', eightDaysFromNow.toISOString());

    if (error) {
      console.error('Error fetching expiring subscriptions:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const notifiedCount = expiringSubscriptions?.length || 0;
    const notifiedUsers = [];

    // Update subscriptions to expiring_soon status and mark as notified
    if (expiringSubscriptions && expiringSubscriptions.length > 0) {
      for (const subscription of expiringSubscriptions) {
        // Update subscription status
        await supabaseClient
          .from('subscriptions')
          .update({
            status: 'expiring_soon',
            notified_expiring: true
          })
          .eq('id', subscription.id);

        // Update profile status
        await supabaseClient
          .from('profiles')
          .update({ subscription_status: 'expiring_soon' })
          .eq('id', subscription.user_id);

        notifiedUsers.push({
          userId: subscription.user_id,
          email: subscription.profiles?.email,
          type: subscription.subscription_type,
          endDate: subscription.end_date
        });

        console.log(`Marked subscription ${subscription.id} as expiring soon for user ${subscription.user_id}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifiedCount,
        notifiedUsers
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in notify-expiring-subscriptions:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});