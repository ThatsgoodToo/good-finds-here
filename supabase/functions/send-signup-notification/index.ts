import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignupNotificationRequest {
  user_id: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, role }: SignupNotificationRequest = await req.json();
    console.log(`Processing signup notification for user ${user_id} with role ${role}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    // Fetch subscription data
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch vendor application if vendor role
    let vendorApplication = null;
    if (role === "vendor" || profile.role === "vendor") {
      const { data: vendorApp } = await supabase
        .from("vendor_applications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      vendorApplication = vendorApp;
    }

    // Send admin notification email
    const adminEmailHtml = generateEmailHtml(profile, subscription, vendorApplication);
    const adminSubject = `New ${role === "vendor" ? "Vendor" : "Shopper"} Signup: ${profile.full_name || profile.display_name || "Unknown"}`;

    const adminEmailResponse = await resend.emails.send({
      from: "That's Good Too <onboarding@resend.dev>",
      to: ["connect@thatsgoodtoo.shop"],
      subject: adminSubject,
      html: adminEmailHtml,
    });

    console.log("Admin notification sent successfully:", adminEmailResponse);

    // Send user confirmation email
    const isVendor = role === "vendor" || profile.role === "vendor";
    const userEmailHtml = generateUserConfirmationHtml(profile, subscription, vendorApplication, isVendor);
    const userSubject = isVendor 
      ? "Your Vendor Application Has Been Received 🏪"
      : "Welcome to That's Good Too! 🎉";

    try {
      const userEmailResponse = await resend.emails.send({
        from: "That's Good Too <welcome@resend.dev>",
        to: [profile.email],
        subject: userSubject,
        html: userEmailHtml,
      });
      console.log("User confirmation sent successfully:", userEmailResponse);
    } catch (userEmailError) {
      // Log but don't fail - user account is still created
      console.error("User confirmation failed (non-critical):", userEmailError);
    }

    // Create platform notification for vendor applications
    if (isVendor) {
      try {
        await supabase.from("notifications").insert({
          user_id: profile.id,
          title: "Application Received",
          message: "Your vendor application has been received and is pending review. We'll notify you once it's been reviewed (typically within 5 business days).",
          type: "info",
          link: "/dashboard/vendor"
        });
        console.log("Platform notification created for vendor application");
      } catch (notifError) {
        console.error("Failed to create platform notification:", notifError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, emailId: adminEmailResponse.data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-signup-notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

function generateEmailHtml(profile: any, subscription: any, vendorApplication: any): string {
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  });

  const role = profile.role === "vendor" ? "Vendor" : "Shopper";
  const applicationStatus = vendorApplication?.status || "N/A";
  const subscriptionType = subscription?.subscription_type || "None";

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
          background: #eff6ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          text-align: center;
        }
        .header h1 {
          color: #2563eb;
          margin: 0 0 10px 0;
        }
        .info-box {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
          margin: 20px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #1e40af;
        }
        .value {
          color: #374151;
        }
        .button {
          display: inline-block;
          background: #2563eb;
          color: white !important;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 New ${role} Signup</h1>
          <p style="margin: 0; color: #6b7280;">${timestamp}</p>
        </div>

        <div class="info-box">
          <div class="info-row">
            <span class="label">Display Name:</span>
            <span class="value">${profile.display_name || "Not provided"}</span>
          </div>
          <div class="info-row">
            <span class="label">User ID:</span>
            <span class="value">${profile.id}</span>
          </div>
          <div class="info-row">
            <span class="label">Role:</span>
            <span class="value">${role}</span>
          </div>
          ${vendorApplication ? `
          <div class="info-row">
            <span class="label">Application Status:</span>
            <span class="value">${applicationStatus.toUpperCase()}</span>
          </div>
          ` : ""}
          ${subscription ? `
          <div class="info-row">
            <span class="label">Subscription Type:</span>
            <span class="value">${subscriptionType}</span>
          </div>
          ` : ""}
        </div>

        <p style="color: #374151;">A new user has signed up for your platform. To view complete details and manage this application, please access the admin dashboard.</p>

        <div style="text-align: center;">
          <a href="https://good-finds-here.lovable.app/admin/dashboard" class="button">
            View Full Details in Admin Dashboard →
          </a>
        </div>

        <div class="footer">
          <p><strong>Security Notice:</strong> This email contains minimal user information. Full details are available only through the authenticated admin dashboard with proper access controls.</p>
          <p style="margin-top: 10px; color: #9ca3af;">That's Good Too - Admin Notification System</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateUserConfirmationHtml(
  profile: any,
  subscription: any,
  vendorApplication: any,
  isVendor: boolean
): string {
  if (isVendor) {
    return generateVendorConfirmationHtml(profile, vendorApplication);
  } else {
    return generateShopperWelcomeHtml(profile, subscription);
  }
}

function generateShopperWelcomeHtml(profile: any, subscription: any): string {
  const userName = profile.full_name || profile.display_name || "there";
  const trialEndDate = subscription?.end_date 
    ? new Date(subscription.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : "";
  const hasPromo = subscription?.promo_code && subscription.promo_code !== "DUAL_ROLE";

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
      color: #2563eb;
      font-size: 28px;
      margin: 0;
    }
    .content p {
      margin: 15px 0;
    }
    .highlight {
      background: #eff6ff;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background: #2563eb;
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
      <h1>🎉 Welcome to That's Good Too!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Your account has been successfully created! We're excited to have you join our community of local goods enthusiasts.</p>
      
      ${subscription?.subscription_type === "trial" ? `
      <div class="highlight">
        <strong>🎁 Your 15-Day Free Trial</strong><br>
        Your trial starts now and ends on <strong>${trialEndDate}</strong>. Enjoy full access to discover amazing local vendors, products, and experiences!
      </div>
      ` : ""}
      
      ${hasPromo ? `
      <div class="highlight">
        <strong>✨ Promo Code Applied</strong><br>
        Your promo code <strong>${subscription.promo_code}</strong> has been activated! You now have founding member access.
      </div>
      ` : ""}
      
      <p><strong>What you can do now:</strong></p>
      <ul>
        <li>Browse local vendors and their unique offerings</li>
        <li>Discover products, services, and experiences</li>
        <li>Follow your favorite vendors</li>
        <li>Save items to your favorites</li>
        <li>Get exclusive coupons and deals</li>
      </ul>
      
      <p>If you have any questions, feel free to reach out to us at <a href="mailto:connect@thatsgoodtoo.shop">connect@thatsgoodtoo.shop</a>.</p>
      
      <p>Happy discovering!</p>
      <p><strong>The That's Good Too Team</strong></p>
    </div>
    
    <div class="footer">
      <p>That's Good Too - Supporting Local Goods & Independent Artists</p>
      <p>You received this email because you created an account on That's Good Too.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateVendorConfirmationHtml(profile: any, vendorApplication: any): string {
  const userName = profile.full_name || profile.display_name || "there";
  const businessType = vendorApplication?.business_type || "Not specified";
  const location = vendorApplication?.city 
    ? `${vendorApplication.city}, ${vendorApplication.state_region}`
    : "Not specified";
  const submittedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
      color: #2563eb;
      font-size: 28px;
      margin: 0;
    }
    .content p {
      margin: 15px 0;
    }
    .highlight {
      background: #eff6ff;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
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
      <h1>🏪 Application Received!</h1>
    </div>
    
    <div class="content">
      <p>Hi ${userName},</p>
      
      <p>Thank you for applying to become a vendor on That's Good Too! We've successfully received your application.</p>
      
      <div class="highlight">
        <strong>📋 What Happens Next</strong><br>
        Your application will be personally reviewed by our team within <strong>5 business days</strong>. We take the time to review each application individually to ensure we maintain the quality and authenticity of our platform.
      </div>
      
      <p><strong>Review Process:</strong></p>
      <ul>
        <li>A real person will review your application (no automated decisions)</li>
        <li>We'll assess your business fit with our community</li>
        <li>You'll receive an email with our decision</li>
        <li>If approved, you'll get instructions to set up your vendor profile</li>
      </ul>
      
      <p><strong>Application Details:</strong></p>
      <ul>
        <li><strong>Business Type:</strong> ${businessType}</li>
        <li><strong>Location:</strong> ${location}</li>
        <li><strong>Submitted:</strong> ${submittedDate}</li>
      </ul>
      
      <p>While you wait, feel free to explore the platform and see what other vendors are doing!</p>
      
      <p>If you have any questions about your application or the vendor program, please contact us at <a href="mailto:connect@thatsgoodtoo.shop">connect@thatsgoodtoo.shop</a>.</p>
      
      <p>We appreciate your interest in That's Good Too!</p>
      <p><strong>The That's Good Too Team</strong></p>
    </div>
    
    <div class="footer">
      <p>That's Good Too - Supporting Local Goods & Independent Artists</p>
      <p>You received this email because you submitted a vendor application.</p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(handler);
