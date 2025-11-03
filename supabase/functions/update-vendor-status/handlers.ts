import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

export interface VendorApplication {
  id: string;
  user_id: string;
  website?: string;
  social_media_links?: Record<string, string>;
  city?: string;
  state_region?: string;
  country?: string;
  phone_number?: string;
  business_type?: string;
  business_type_other?: string;
  business_description?: string;
  products_services?: string[];
  inventory_type?: string;
  shipping_options?: string[];
  pickup_address?: string;
  area_of_expertise?: string[];
  business_duration?: string;
  craft_development?: string;
  certifications_awards?: string;
  creativity_style?: string;
  inspiration?: string;
  brand_uniqueness?: string;
  sustainable_methods?: string;
  pricing_style?: string;
  exclusive_offers?: string;
  promotion_social_channels?: string;
  future_website?: string;
  subscription_type?: string;
  promo_code?: string;
  profiles: {
    email: string;
    full_name?: string;
    display_name?: string;
  };
}

interface ApprovalContext {
  supabase: SupabaseClient;
  resend: Resend;
  application: VendorApplication;
  applicationId: string;
  adminUserId: string;
  adminNotes?: string;
}

interface RejectionContext {
  supabase: SupabaseClient;
  resend: Resend;
  application: VendorApplication;
  applicationId: string;
  adminUserId: string;
  adminNotes?: string;
}

export async function handleApproval(context: ApprovalContext): Promise<void> {
  const { supabase, resend, application, applicationId, adminUserId, adminNotes } = context;

  // 1. Update application status
  const { error: updateError } = await supabase
    .from("vendor_applications")
    .update({
      status: "approved",
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    })
    .eq("id", applicationId);

  if (updateError) {
    console.error("Error updating application status:", updateError);
    throw new Error(`Failed to update application: ${updateError.message}`);
  }

  console.log("Application status updated to approved");

  // 2. Create vendor profile
  await createVendorProfile(supabase, application);

  // 3. Add user roles
  await addVendorAndShopperRoles(supabase, application.user_id);

  // 4. Send notifications
  const userEmail = application.profiles.email;
  const userName = application.profiles.full_name || application.profiles.display_name || "there";

  await sendApprovalEmail(resend, userEmail, userName, application);
  await createApprovalNotification(supabase, application.user_id);

  console.log(`Application ${applicationId} approved successfully`);
}

export async function handleRejection(context: RejectionContext): Promise<void> {
  const { supabase, resend, application, applicationId, adminUserId, adminNotes } = context;

  // 1. Update application status
  const { error: updateError } = await supabase
    .from("vendor_applications")
    .update({
      status: "rejected",
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    })
    .eq("id", applicationId);

  if (updateError) throw updateError;

  // 2. Send notifications
  const userEmail = application.profiles.email;
  const userName = application.profiles.full_name || application.profiles.display_name || "there";

  await sendRejectionEmail(resend, userEmail, userName, adminNotes);
  await createRejectionNotification(supabase, application.user_id, adminNotes);

  console.log(`Application ${applicationId} rejected`);
}

export async function handlePendingReset(
  supabase: SupabaseClient,
  applicationId: string,
  adminNotes?: string
): Promise<void> {
  const { error: updateError } = await supabase
    .from("vendor_applications")
    .update({
      status: "pending",
      admin_notes: adminNotes || null,
    })
    .eq("id", applicationId);

  if (updateError) throw updateError;

  console.log(`Application ${applicationId} set back to pending`);
}

async function createVendorProfile(
  supabase: SupabaseClient,
  application: VendorApplication
): Promise<void> {
  const { data: profileData, error: profileError } = await supabase
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
    })
    .select();

  if (profileError) {
    console.error("Error creating vendor profile:", profileError);
    throw new Error(`Failed to create vendor profile: ${profileError.message}`);
  }

  console.log("Vendor profile created successfully:", {
    user_id: application.user_id,
    profile_id: profileData?.[0]?.id
  });
}

async function addVendorAndShopperRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  // Add vendor role
  const { error: vendorRoleError } = await supabase
    .from("user_roles")
    .upsert({
      user_id: userId,
      role: "vendor",
    }, {
      onConflict: 'user_id,role'
    });

  if (vendorRoleError) {
    console.error("Error adding vendor role:", vendorRoleError);
    throw new Error(`Failed to add vendor role: ${vendorRoleError.message}`);
  }

  // Add shopper role (vendors automatically get shopper privileges)
  const { error: shopperRoleError } = await supabase
    .from("user_roles")
    .upsert({
      user_id: userId,
      role: "shopper",
    }, {
      onConflict: 'user_id,role'
    });

  if (shopperRoleError) {
    console.error("Error adding shopper role:", shopperRoleError);
    throw new Error(`Failed to add shopper role: ${shopperRoleError.message}`);
  }

  console.log("Vendor and shopper roles added successfully for user:", userId);
}

async function sendApprovalEmail(
  resend: Resend,
  userEmail: string,
  userName: string,
  application: VendorApplication
): Promise<void> {
  try {
    // Use send-email edge function with template
    const response = await fetch('https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        to: userEmail,
        template: 'vendorApproved',
        templateVars: {
          business_name: userName,
        }
      })
    });
    console.log("Approval email sent to:", userEmail);
  } catch (emailError) {
    console.error("Failed to send approval email:", emailError);
  }
}

async function sendRejectionEmail(
  resend: Resend,
  userEmail: string,
  userName: string,
  adminNotes?: string
): Promise<void> {
  try {
    // Use send-email edge function with template
    const response = await fetch('https://fksjvollrvzokhpptdoi.supabase.co/functions/v1/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
      },
      body: JSON.stringify({
        to: userEmail,
        template: 'vendorRejected',
        templateVars: {
          business_name: userName,
          rejection_reason: adminNotes || "Application did not meet current criteria",
        }
      })
    });
    console.log("Rejection email sent to:", userEmail);
  } catch (emailError) {
    console.error("Failed to send rejection email:", emailError);
  }
}

async function createApprovalNotification(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  try {
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Application Approved! 🎉",
      message: "Congratulations! Your vendor application has been approved. You can now create listings and manage your vendor profile.",
      type: "success",
      link: "/dashboard/vendor"
    });
    console.log("Platform notification created for approval");
  } catch (notifError) {
    console.error("Failed to create platform notification:", notifError);
  }
}

async function createRejectionNotification(
  supabase: SupabaseClient,
  userId: string,
  adminNotes?: string
): Promise<void> {
  try {
    const notifMessage = adminNotes 
      ? `Your vendor application has been reviewed. ${adminNotes}` 
      : "Your vendor application could not be approved at this time. Please check your email for more details.";
    
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Application Status Update",
      message: notifMessage,
      type: "warning",
      link: "/vendor-signup"
    });
    console.log("Platform notification created for rejection");
  } catch (notifError) {
    console.error("Failed to create platform notification:", notifError);
  }
}

function generateApprovalEmailHtml(userName: string, application: VendorApplication): string {
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

function generateRejectionEmailHtml(userName: string, adminNotes?: string): string {
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
          <strong>Feedback from our team:</strong><br>
          ${adminNotes}
        </div>
      ` : ""}
      
      <p>If you have any questions or would like to discuss your application further, please don't hesitate to reach out to us at <a href="mailto:connect@thatsgoodtoo.shop">connect@thatsgoodtoo.shop</a>.</p>
      
      <p>We appreciate your understanding.</p>
      <p><strong>The That's Good Too Team</strong></p>
    </div>
    
    <div class="footer">
      <p>That's Good Too - Supporting Local Goods & Independent Artists</p>
    </div>
  </div>
</body>
</html>
  `;
}
