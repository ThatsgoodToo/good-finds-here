import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusUpdateRequest {
  application_id: string;
  new_status: "pending" | "approved" | "rejected";
  admin_notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin user
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

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { application_id, new_status, admin_notes }: StatusUpdateRequest = await req.json();

    console.log(`Processing status update: ${application_id} -> ${new_status}`);

    // Get application details
    const { data: application, error: appError } = await supabase
      .from("vendor_applications")
      .select("*, profiles!inner(email, full_name, display_name)")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      console.error("Application not found:", appError);
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (new_status === "approved") {
      // 1. Update application status
      const { error: updateError } = await supabase
        .from("vendor_applications")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: admin_notes || null,
        })
        .eq("id", application_id);

      if (updateError) throw updateError;

      // 2. Create vendor_profiles record
      const { error: profileError } = await supabase
        .from("vendor_profiles")
        .insert({
          user_id: application.user_id,
          application_id: application.id,
          website: application.website || "",
          social_media_links: application.social_media_links,
          city: application.city || "",
          state_region: application.state_region || "",
          country: application.country || "",
          phone_number: application.phone_number,
          business_type: application.business_type || "",
          business_type_other: application.business_type_other,
          business_description: application.business_description || "",
          products_services: application.products_services,
          inventory_type: application.inventory_type,
          shipping_options: application.shipping_options,
          pickup_address: application.pickup_address,
          area_of_expertise: application.area_of_expertise || [],
          business_duration: application.business_duration || "",
          craft_development: application.craft_development,
          certifications_awards: application.certifications_awards,
          creativity_style: application.creativity_style,
          inspiration: application.inspiration,
          brand_uniqueness: application.brand_uniqueness,
          sustainable_methods: application.sustainable_methods,
          pricing_style: application.pricing_style,
          exclusive_offers: application.exclusive_offers,
          promotion_social_channels: application.promotion_social_channels,
          future_website: application.future_website,
          subscription_type: application.subscription_type,
          status: "active",
          subscription_status: "active",
          profile_views: 0,
          clicks_to_website: 0,
        });

      if (profileError) {
        console.error("Error creating vendor profile:", profileError);
        throw profileError;
      }

      // 3. Add vendor role to user_roles
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: application.user_id,
          role: "vendor",
        });

      if (roleError && !roleError.message?.includes("duplicate")) {
        console.error("Error adding vendor role:", roleError);
        throw roleError;
      }

      // 4. Send approval email
      const userEmail = application.profiles.email;
      const userName = application.profiles.full_name || application.profiles.display_name || "there";

      try {
        await resend.emails.send({
          from: "That's Good Too <welcome@resend.dev>",
          to: [userEmail],
          subject: "🎉 Your Vendor Application Has Been Approved!",
          html: generateApprovalEmail(userName, application),
        });
        console.log("Approval email sent to:", userEmail);
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }

      console.log(`Application ${application_id} approved successfully`);
    } else if (new_status === "rejected") {
      // 1. Update application status
      const { error: updateError } = await supabase
        .from("vendor_applications")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: admin_notes || null,
        })
        .eq("id", application_id);

      if (updateError) throw updateError;

      // 2. Send rejection email
      const userEmail = application.profiles.email;
      const userName = application.profiles.full_name || application.profiles.display_name || "there";

      try {
        await resend.emails.send({
          from: "That's Good Too <welcome@resend.dev>",
          to: [userEmail],
          subject: "Update on Your Vendor Application",
          html: generateRejectionEmail(userName, admin_notes),
        });
        console.log("Rejection email sent to:", userEmail);
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }

      console.log(`Application ${application_id} rejected`);
    } else if (new_status === "pending") {
      // Set back to pending
      const { error: updateError } = await supabase
        .from("vendor_applications")
        .update({
          status: "pending",
          admin_notes: admin_notes || null,
        })
        .eq("id", application_id);

      if (updateError) throw updateError;

      console.log(`Application ${application_id} set back to pending`);
    }

    return new Response(
      JSON.stringify({ success: true, message: `Application ${new_status}` }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error updating vendor status:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

function generateApprovalEmail(userName: string, application: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #16a34a;
      font-size: 28px;
      margin: 0;
    }
    .content p {
      margin: 15px 0;
    }
    .highlight {
      background: #f0fdf4;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #16a34a;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background: #16a34a;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You're Approved!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Congratulations! Your vendor application has been approved. You now have full access to the That's Good Too vendor platform.</p>
      
      <div class="highlight">
        <strong>✅ You Can Now:</strong><br>
        <ul>
          <li>Create up to 5 listings (products, services, experiences)</li>
          <li>Manage your vendor profile and business information</li>
          <li>Create promotional coupons and special offers</li>
          <li>View analytics and follower insights</li>
          <li>Share exclusive deals with your followers</li>
        </ul>
      </div>
      
      <p><strong>Your Subscription:</strong></p>
      <ul>
        <li><strong>Type:</strong> ${application.subscription_type || "Standard"}</li>
        <li><strong>Monthly Fee:</strong> $5/month</li>
        ${application.promo_code ? `<li><strong>Promo Code:</strong> ${application.promo_code} (Applied)</li>` : ""}
      </ul>
      
      <div style="text-align: center;">
        <a href="https://thatsgoodtoo.lovable.app/dashboard/vendor" class="button">
          Go to Vendor Dashboard
        </a>
      </div>
      
      <p>Ready to get started? Log in and create your first listing to showcase your products, services, or experiences to our community!</p>
      
      <p>If you have any questions or need help getting started, reach out to us at <a href="mailto:connect@thatsgoodtoo.shop">connect@thatsgoodtoo.shop</a>.</p>
      
      <p>Welcome to the That's Good Too community!</p>
      <p><strong>The That's Good Too Team</strong></p>
    </div>
    
    <div class="footer">
      <p>That's Good Too - Supporting Local Goods & Independent Artists</p>
      <p>You received this email because your vendor application was approved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateRejectionEmail(userName: string, adminNotes?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #374151;
      font-size: 24px;
      margin: 0;
    }
    .content p {
      margin: 15px 0;
    }
    .info-box {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #6b7280;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Update on Your Vendor Application</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Thank you for your interest in becoming a vendor on That's Good Too.</p>
      
      <p>After careful review, we're unable to approve your application at this time.</p>
      
      ${adminNotes ? `
      <div class="info-box">
        <strong>Feedback:</strong><br>
        ${adminNotes}
      </div>
      ` : ""}
      
      <p>We appreciate your interest in our platform and encourage you to reach out if you have questions or would like to discuss your application further.</p>
      
      <p>You're welcome to reapply in the future once you've had a chance to address any feedback provided.</p>
      
      <p>Contact us at <a href="mailto:connect@thatsgoodtoo.shop">connect@thatsgoodtoo.shop</a> if you have any questions.</p>
      
      <p>Best regards,</p>
      <p><strong>The That's Good Too Team</strong></p>
    </div>
    
    <div class="footer">
      <p>That's Good Too - Supporting Local Goods & Independent Artists</p>
      <p>You received this email regarding your vendor application.</p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(handler);
