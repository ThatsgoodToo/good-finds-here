import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
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

    // Format email content
    const emailHtml = generateEmailHtml(profile, subscription, vendorApplication);
    const subject = `New ${role === "vendor" ? "Vendor" : "Shopper"} Signup: ${profile.full_name || profile.display_name || "Unknown"}`;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "That's Good Too <onboarding@resend.dev>",
      to: ["connect@thatsgoodtoo.shop"],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
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

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
        h3 { color: #3b82f6; margin-top: 20px; }
        .header { background: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .field { margin: 10px 0; padding: 8px; background: #f9fafb; border-left: 3px solid #3b82f6; }
        .field strong { color: #1e40af; display: inline-block; min-width: 180px; }
        .list { margin: 5px 0; padding-left: 20px; }
        .list li { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        td:first-child { font-weight: bold; color: #1e40af; width: 200px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
        .badge-yes { background: #d1fae5; color: #065f46; }
        .badge-no { background: #fee2e2; color: #991b1b; }
        .badge-info { background: #dbeafe; color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 New ${profile.role === "vendor" ? "Vendor" : "Shopper"} Signup</h1>
        <p><strong>Timestamp:</strong> ${timestamp}</p>
        <p><strong>User ID:</strong> ${profile.id}</p>
      </div>
  `;

  // Personal Information Section
  html += `
    <div class="section">
      <h2>👤 Personal Information</h2>
      <table>
        <tr><td>Full Name</td><td>${profile.full_name || "Not provided"}</td></tr>
        <tr><td>Display Name</td><td>${profile.display_name || "Not provided"}</td></tr>
        <tr><td>Email</td><td>${profile.email}</td></tr>
        <tr><td>Role</td><td><span class="badge badge-info">${profile.role.toUpperCase()}</span></td></tr>
        <tr><td>Age Verified</td><td><span class="badge ${profile.age_verified ? "badge-yes" : "badge-no"}">${profile.age_verified ? "YES" : "NO"}</span></td></tr>
        <tr><td>Terms Accepted</td><td><span class="badge ${profile.terms_accepted ? "badge-yes" : "badge-no"}">${profile.terms_accepted ? "YES" : "NO"}</span></td></tr>
        <tr><td>Analytics Consent</td><td><span class="badge ${profile.analytics_consent ? "badge-yes" : "badge-no"}">${profile.analytics_consent ? "YES" : "NO"}</span></td></tr>
      </table>
    </div>
  `;

  // Interests (for shoppers)
  if (profile.interests && profile.interests.length > 0) {
    html += `
      <div class="section">
        <h2>💡 Interests</h2>
        <ul class="list">
          ${profile.interests.map((interest: string) => `<li>${interest}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  // Subscription Information
  if (subscription) {
    html += `
      <div class="section">
        <h2>💳 Subscription Details</h2>
        <table>
          <tr><td>Type</td><td>${subscription.subscription_type}</td></tr>
          <tr><td>Status</td><td><span class="badge badge-info">${subscription.status.toUpperCase()}</span></td></tr>
          <tr><td>Start Date</td><td>${new Date(subscription.start_date).toLocaleDateString()}</td></tr>
          <tr><td>End Date</td><td>${new Date(subscription.end_date).toLocaleDateString()}</td></tr>
          ${subscription.promo_code ? `<tr><td>Promo Code</td><td><strong>${subscription.promo_code}</strong></td></tr>` : ""}
        </table>
      </div>
    `;
  }

  // Vendor Application Details
  if (vendorApplication) {
    html += `
      <div class="section">
        <h2>🏪 Vendor Application Details</h2>
        
        <h3>Business Information</h3>
        <table>
          <tr><td>Business Type</td><td>${vendorApplication.business_type}${vendorApplication.business_type_other ? ` (${vendorApplication.business_type_other})` : ""}</td></tr>
          <tr><td>Website</td><td>${vendorApplication.website || "Not provided"}</td></tr>
          <tr><td>Phone Number</td><td>${vendorApplication.phone_number || "Not provided"}</td></tr>
          <tr><td>Location</td><td>${vendorApplication.city}, ${vendorApplication.state_region}, ${vendorApplication.country}</td></tr>
        </table>

        <h3>Business Description</h3>
        <div class="field">
          <p>${vendorApplication.business_description || "Not provided"}</p>
        </div>
        ${
          vendorApplication.products_services && vendorApplication.products_services.length > 0
            ? `
        <div class="field">
          <strong>Products/Services:</strong>
          <ul class="list">
            ${vendorApplication.products_services.map((item: string) => `<li>${item}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }
        ${
          vendorApplication.inventory_type && vendorApplication.inventory_type.length > 0
            ? `
        <div class="field">
          <strong>Inventory Type:</strong>
          <ul class="list">
            ${vendorApplication.inventory_type.map((item: string) => `<li>${item}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }
        ${
          vendorApplication.shipping_options && vendorApplication.shipping_options.length > 0
            ? `
        <div class="field">
          <strong>Shipping Options:</strong>
          <ul class="list">
            ${vendorApplication.shipping_options.map((item: string) => `<li>${item}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }
        ${
          vendorApplication.pickup_address
            ? `
        <div class="field">
          <strong>Pickup Address:</strong> ${vendorApplication.pickup_address}
        </div>`
            : ""
        }

        <h3>Expertise & Experience</h3>
        ${
          vendorApplication.area_of_expertise && vendorApplication.area_of_expertise.length > 0
            ? `
        <div class="field">
          <strong>Areas of Expertise:</strong>
          <ul class="list">
            ${vendorApplication.area_of_expertise.map((item: string) => `<li>${item}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }
        <table>
          <tr><td>Business Duration</td><td>${vendorApplication.business_duration || "Not provided"}</td></tr>
          <tr><td>Craft Development</td><td>${vendorApplication.craft_development || "Not provided"}</td></tr>
          <tr><td>Certifications/Awards</td><td>${vendorApplication.certifications_awards || "Not provided"}</td></tr>
        </table>

        <h3>Creativity & Style</h3>
        <table>
          <tr><td>Creativity Style</td><td>${vendorApplication.creativity_style || "Not provided"}</td></tr>
          <tr><td>Inspiration</td><td>${vendorApplication.inspiration || "Not provided"}</td></tr>
          <tr><td>Brand Uniqueness</td><td>${vendorApplication.brand_uniqueness || "Not provided"}</td></tr>
        </table>
        ${
          vendorApplication.sustainable_methods && vendorApplication.sustainable_methods.length > 0
            ? `
        <div class="field">
          <strong>Sustainable Methods:</strong>
          <ul class="list">
            ${vendorApplication.sustainable_methods.map((item: string) => `<li>${item}</li>`).join("")}
          </ul>
        </div>`
            : ""
        }

        <h3>Pricing & Marketing</h3>
        <table>
          <tr><td>Pricing Style</td><td>${vendorApplication.pricing_style || "Not provided"}</td></tr>
          <tr><td>Exclusive Offers</td><td>${vendorApplication.exclusive_offers || "Not provided"}</td></tr>
          <tr><td>Promotion Channels</td><td>${vendorApplication.promotion_social_channels || "Not provided"}</td></tr>
          <tr><td>Future Website Plans</td><td>${vendorApplication.future_website || "Not provided"}</td></tr>
        </table>

        ${
          vendorApplication.social_media_links && vendorApplication.social_media_links.length > 0
            ? `
        <div class="field">
          <strong>Social Media Links:</strong>
          <ul class="list">
            ${vendorApplication.social_media_links.map((link: string) => `<li><a href="${link}">${link}</a></li>`).join("")}
          </ul>
        </div>`
            : ""
        }

        <h3>Subscription & Payment</h3>
        <table>
          <tr><td>Subscription Type</td><td>${vendorApplication.subscription_type || "Not provided"}</td></tr>
          ${vendorApplication.promo_code ? `<tr><td>Promo Code Used</td><td><strong>${vendorApplication.promo_code}</strong></td></tr>` : ""}
          <tr><td>Payment Method Saved</td><td><span class="badge ${vendorApplication.payment_method_saved ? "badge-yes" : "badge-no"}">${vendorApplication.payment_method_saved ? "YES" : "NO"}</span></td></tr>
        </table>

        <h3>Agreements & Confirmations</h3>
        <table>
          <tr><td>Info Accurate</td><td><span class="badge ${vendorApplication.info_accurate ? "badge-yes" : "badge-no"}">${vendorApplication.info_accurate ? "YES" : "NO"}</span></td></tr>
          <tr><td>Understands Review</td><td><span class="badge ${vendorApplication.understands_review ? "badge-yes" : "badge-no"}">${vendorApplication.understands_review ? "YES" : "NO"}</span></td></tr>
          <tr><td>Agrees to Terms</td><td><span class="badge ${vendorApplication.agrees_to_terms ? "badge-yes" : "badge-no"}">${vendorApplication.agrees_to_terms ? "YES" : "NO"}</span></td></tr>
          <tr><td>Receive Updates</td><td><span class="badge ${vendorApplication.receive_updates ? "badge-yes" : "badge-no"}">${vendorApplication.receive_updates ? "YES" : "NO"}</span></td></tr>
        </table>

        ${
          vendorApplication.additional_info
            ? `
        <h3>Additional Information</h3>
        <div class="field">
          <p>${vendorApplication.additional_info}</p>
        </div>`
            : ""
        }

        <h3>Application Status</h3>
        <table>
          <tr><td>Status</td><td><span class="badge badge-info">${vendorApplication.status.toUpperCase()}</span></td></tr>
          <tr><td>Created</td><td>${new Date(vendorApplication.created_at).toLocaleString()}</td></tr>
          <tr><td>Updated</td><td>${new Date(vendorApplication.updated_at).toLocaleString()}</td></tr>
        </table>
      </div>
    `;
  }

  html += `
    </body>
    </html>
  `;

  return html;
}

serve(handler);
