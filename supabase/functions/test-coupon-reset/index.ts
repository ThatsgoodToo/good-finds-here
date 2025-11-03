import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestResetRequest {
  listing_id: string;
  coupon_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { listing_id, coupon_id }: TestResetRequest = await req.json();

    console.log(`Testing reset for listing ${listing_id}, coupon ${coupon_id}`);

    // Verify ownership
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("vendor_id, reset_cycle, resets_at, title")
      .eq("id", listing_id)
      .single();

    if (listingError || !listing) {
      return new Response(JSON.stringify({ error: "Listing not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (listing.vendor_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden: Not your listing" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get coupon details
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("code, used_count, max_uses")
      .eq("id", coupon_id)
      .single();

    if (couponError || !coupon) {
      return new Response(JSON.stringify({ error: "Coupon not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reset the coupon
    const { error: resetError } = await supabase
      .from("coupons")
      .update({
        used_count: 0,
        active_status: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", coupon_id);

    if (resetError) throw resetError;

    // Calculate new reset date
    let newResetsAt: Date;
    const now = new Date();
    
    switch (listing.reset_cycle) {
      case "daily":
        newResetsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        break;
      case "weekly":
        newResetsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case "monthly":
        newResetsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        newResetsAt = now;
    }

    // Update listing reset date
    const { error: listingUpdateError } = await supabase
      .from("listings")
      .update({
        resets_at: newResetsAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", listing_id);

    if (listingUpdateError) throw listingUpdateError;

    // Get vendor email for test notification
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, display_name")
      .eq("id", user.id)
      .single();

    let emailsSent = 0;

    // Send test email to vendor
    if (profile?.email) {
      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: {
          to: profile.email,
          subject: "[TEST] Coupon Reset Triggered Successfully",
          html: `
            <h2>Test Reset Complete ✅</h2>
            <p>Hi ${profile.display_name || "there"},</p>
            <p>Your test reset was successful for:</p>
            <ul>
              <li><strong>Listing:</strong> ${listing.title}</li>
              <li><strong>Coupon:</strong> ${coupon.code}</li>
              <li><strong>Previous Usage:</strong> ${coupon.used_count} / ${coupon.max_uses || "unlimited"}</li>
              <li><strong>New Usage:</strong> 0 / ${coupon.max_uses || "unlimited"}</li>
              <li><strong>Next Reset:</strong> ${newResetsAt.toLocaleDateString()} at ${newResetsAt.toLocaleTimeString()}</li>
            </ul>
            <p>This was a test reset. Users who saved this listing would normally receive emails.</p>
          `,
        },
      });

      if (!emailError) emailsSent++;
    }

    console.log(`Reset test complete. Coupon ${coupon.code} reset to 0 uses. Next reset: ${newResetsAt.toISOString()}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Coupon reset successfully",
        data: {
          coupon_code: coupon.code,
          previous_used_count: coupon.used_count,
          new_used_count: 0,
          next_reset_at: newResetsAt.toISOString(),
          emails_sent: emailsSent,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in test coupon reset:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
