// Branded email templates for ThatsGoodToo coupon platform
// All templates use coupon-themed design with dynamic variables

const SITE_URL = "https://thatsgoodtoo.shop";

interface TemplateVars {
  [key: string]: string | undefined;
}

const wrapTemplate = (content: string, unsubscribeUrl?: string) => {
  const unsubscribeSection = unsubscribeUrl
    ? `<p style="text-align: center; color: #666; margin-top: 20px;"><a href="${unsubscribeUrl}" style="background: #32CD32; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px;">Unsubscribe</a> | <a href="${SITE_URL}" style="color: #FF4500; text-decoration: none;">View Deals</a></p>`
    : `<p style="text-align: center; color: #666; margin-top: 20px;"><a href="${SITE_URL}" style="color: #FF4500; text-decoration: none;">View Deals</a></p>`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 2px dashed #FFD700; background: #FFF8DC; border-radius: 10px;">
      <h1 style="color: #FF4500; text-align: center; font-size: 28px; margin-bottom: 10px;">ThatsGoodToo 💸</h1>
      <p style="text-align: center; color: #666; font-size: 14px; margin-top: 0;">Save Big on Local Deals!</p>
      <hr style="border: 1px dashed #FFD700; margin: 20px 0;">
      ${content}
      <hr style="border: 1px dashed #FFD700; margin: 20px 0;">
      ${unsubscribeSection}
    </div>
  `;
};

const replaceVars = (template: string, vars: TemplateVars): string => {
  let result = template;
  Object.keys(vars).forEach((key) => {
    const value = vars[key] || "";
    // Escape special regex characters to prevent ReDoS attacks
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(`{${escapedKey}}`, "g"), value);
  });
  return result;
};

export const templates = {
  // 1. Welcome (Signup)
  welcome: (vars: TemplateVars) => ({
    subject: "Welcome to ThatsGoodToo! 🎉",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Welcome, ${vars.user_name}!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Thanks for joining ThatsGoodToo! You're now part of a community discovering amazing local deals and exclusive coupons.
      </p>
      <div style="background: #FFF; padding: 15px; border-radius: 8px; border: 1px dashed #FFD700; margin: 20px 0;">
        <h3 style="color: #32CD32; margin-top: 0;">🎁 Get Started:</h3>
        <ul style="color: #333; line-height: 1.8;">
          <li>Browse exclusive coupons from local vendors</li>
          <li>Save your favorite deals with High-Five ✋</li>
          <li>Share great finds with friends</li>
        </ul>
      </div>
      <p style="text-align: center;">
        <a href="${SITE_URL}" style="background: #FF4500; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin: 10px 0;">Explore Deals Now</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 2. Vendor Application Approved
  vendorApproved: (vars: TemplateVars) => ({
    subject: "🎉 Your Vendor Application is Approved!",
    html: wrapTemplate(
      `
      <h2 style="color: #32CD32; text-align: center;">Congratulations, ${vars.business_name}!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Your vendor application has been approved! You can now start posting exclusive deals and reaching shoppers.
      </p>
      <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2E7D32; margin-top: 0;">✅ Next Steps:</h3>
        <ol style="color: #333; line-height: 1.8;">
          <li>Create your first listing</li>
          <li>Add exclusive coupons</li>
          <li>Share your vendor page</li>
        </ol>
      </div>
      <p style="text-align: center;">
        <a href="${SITE_URL}/vendor-dashboard" style="background: #32CD32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 3. Vendor Application Rejected
  vendorRejected: (vars: TemplateVars) => ({
    subject: "Your Vendor Application Status",
    html: wrapTemplate(
      `
      <h2 style="color: #333; text-align: center;">Application Update</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.business_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Thank you for your interest in becoming a vendor on ThatsGoodToo. After careful review, we're unable to approve your application at this time.
      </p>
      ${vars.rejection_reason ? `<div style="background: #FFF3E0; padding: 15px; border-radius: 8px; border-left: 4px solid #FF9800; margin: 20px 0;"><p style="margin: 0; color: #333;"><strong>Reason:</strong> ${vars.rejection_reason}</p></div>` : ""}
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        You're welcome to reapply in the future or contact us if you have questions.
      </p>
      <p style="text-align: center;">
        <a href="mailto:connect@thatsgoodtoo.shop" style="background: #666; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Contact Support</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 4. Password Reset
  passwordReset: (vars: TemplateVars) => ({
    subject: "Reset Your Password 🔒",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Password Reset Request</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.user_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password. Click the button below to create a new password:
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${vars.reset_link}" style="background: #FF4500; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
      </p>
      <div style="background: #FFEBEE; padding: 15px; border-radius: 8px; border-left: 4px solid #F44336; margin: 20px 0;">
        <p style="margin: 0; color: #333; font-size: 14px;">
          ⚠️ This link expires in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 5. Waitlist Confirmation
  waitlistConfirm: (vars: TemplateVars) => ({
    subject: "You're on the Waitlist! 🎉",
    html: wrapTemplate(
      `
      <h2 style="color: #32CD32; text-align: center;">Welcome to the Waitlist!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.user_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        You're officially on the ThatsGoodToo waitlist! 🎊
      </p>
      <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2E7D32; margin-top: 0;">What's Next?</h3>
        <p style="color: #333; margin: 0;">
          We'll notify you when new exclusive coupons and deals drop. You'll be among the first to know!
        </p>
      </div>
      <p style="color: #666; font-size: 14px; text-align: center; font-style: italic;">
        Stay tuned for amazing deals!
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 6. Save Redeem Guide
  saveRedeemGuide: (vars: TemplateVars) => ({
    subject: "How to Redeem Your Saved Coupon 🎟️",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Great Save!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.user_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        You saved "<strong>${vars.listing_title}</strong>"! Here's how to redeem your coupon:
      </p>
      <div style="background: #FFF; padding: 20px; border-radius: 8px; border: 2px dashed #FFD700; margin: 20px 0; text-align: center;">
        <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your Coupon Code:</p>
        <p style="color: #FF4500; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">${vars.coupon_code}</p>
      </div>
      <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1976D2; margin-top: 0;">📋 Redemption Steps:</h3>
        <ol style="color: #333; line-height: 1.8;">
          <li>Visit the vendor's location or website</li>
          <li>Show or enter the coupon code above</li>
          <li>Enjoy your exclusive discount!</li>
        </ol>
      </div>
      <p style="text-align: center;">
        <a href="${SITE_URL}/listing/${vars.listing_id}" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Full Details</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 7. Listing Expiring Soon (User)
  listingExpiringSoonUser: (vars: TemplateVars) => ({
    subject: "⏰ Your Saved Deal Expires Soon!",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Hurry! Deal Expiring</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.user_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Your saved listing "<strong>${vars.listing_title}</strong>" expires soon!
      </p>
      <div style="background: #FFEBEE; padding: 15px; border-radius: 8px; border-left: 4px solid #F44336; margin: 20px 0;">
        <p style="margin: 0; color: #333;">
          ⏰ <strong>Expires:</strong> ${vars.expires_date}
        </p>
      </div>
      ${vars.coupon_code ? `<div style="background: #FFF; padding: 15px; border-radius: 8px; border: 1px dashed #FFD700; margin: 20px 0; text-align: center;"><p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">Coupon Code:</p><p style="color: #FF4500; font-size: 24px; font-weight: bold; margin: 0;">${vars.coupon_code}</p></div>` : ""}
      <p style="text-align: center;">
        <a href="${SITE_URL}/listing/${vars.listing_id}" style="background: #FF4500; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Redeem Now</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 8. Listing Expiring Soon (Vendor)
  listingExpiringSoonVendor: (vars: TemplateVars) => ({
    subject: "Listing Expiring Soon - Renew Now",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Listing Expiration Notice</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.business_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Your listing "<strong>${vars.listing_title}</strong>" expires on ${vars.expires_date}.
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Want to keep it live? Renew it now to continue reaching shoppers!
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${SITE_URL}/vendor-dashboard" style="background: #32CD32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Renew Listing</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 9. Coupon Reset (User)
  couponResetUser: (vars: TemplateVars) => ({
    subject: "🔄 Coupon Reset! Use It Again Today",
    html: wrapTemplate(
      `
      <h2 style="color: #32CD32; text-align: center;">Great News!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.user_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        The coupon for "<strong>${vars.listing_title}</strong>" has been reset! You can use it again.
      </p>
      <div style="background: #FFF; padding: 20px; border-radius: 8px; border: 2px dashed #FFD700; margin: 20px 0; text-align: center;">
        <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Fresh Coupon Code:</p>
        <p style="color: #32CD32; font-size: 28px; font-weight: bold; margin: 0; letter-spacing: 2px;">${vars.coupon_code}</p>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 12px;">Reset on: ${vars.reset_date}</p>
      </div>
      <p style="text-align: center;">
        <a href="${SITE_URL}/listing/${vars.listing_id}" style="background: #32CD32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Claim Now</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 10. Coupon Reset (Vendor)
  couponResetVendor: (vars: TemplateVars) => ({
    subject: "Coupon Reset Triggered - Boost Your Views!",
    html: wrapTemplate(
      `
      <h2 style="color: #32CD32; text-align: center;">Coupon Reset Successful</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.business_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Your coupon for "<strong>${vars.listing_title}</strong>" has been automatically reset.
      </p>
      <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2E7D32; margin-top: 0;">📊 What This Means:</h3>
        <ul style="color: #333; line-height: 1.8;">
          <li>Users can claim your coupon again</li>
          <li>Expect increased traffic to your listing</li>
          <li>Previous users will be notified</li>
        </ul>
      </div>
      <p style="text-align: center;">
        <a href="${SITE_URL}/vendor-dashboard" style="background: #32CD32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Dashboard</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 11. Weekly Low Activity Nudge (Vendor)
  weeklyVendorNudge: (vars: TemplateVars) => ({
    subject: "📢 Time to Boost Your Presence!",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Your Shop Needs You!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.business_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        ${vars.has_listings === "false" ? "We noticed you don't have any active listings. Post a new promo to reach more shoppers!" : "Your listings aren't getting much traction. Try posting a fresh coupon to boost engagement!"}
      </p>
      <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #F57C00; margin-top: 0;">💡 Quick Tips:</h3>
        <ul style="color: #333; line-height: 1.8;">
          <li>Post exclusive, time-limited offers</li>
          <li>Use eye-catching product images</li>
          <li>Share your vendor page on social media</li>
        </ul>
      </div>
      <p style="text-align: center;">
        <a href="${SITE_URL}/vendor/new-listing" style="background: #FF4500; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Create New Listing</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 12. No Active Coupons Alert (Vendor)
  noCouponsAlert: (vars: TemplateVars) => ({
    subject: "⚠️ No Active Coupons - Add One Now!",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Missing Out on Sales?</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.business_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        You don't have any active coupons right now. Add one to attract more customers!
      </p>
      <div style="background: #FFEBEE; padding: 15px; border-radius: 8px; border-left: 4px solid #F44336; margin: 20px 0;">
        <p style="margin: 0; color: #333;">
          <strong>Did you know?</strong> Vendors with active coupons get 5x more profile views!
        </p>
      </div>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${SITE_URL}/vendor-dashboard" style="background: #32CD32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Add Coupon Now</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 13. Listing Post Confirmation (Vendor)
  listingPostConfirm: (vars: TemplateVars) => ({
    subject: "✅ Your Listing is Live!",
    html: wrapTemplate(
      `
      <h2 style="color: #32CD32; text-align: center;">Listing Published!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.business_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Great news! Your listing "<strong>${vars.listing_title}</strong>" is now live on ThatsGoodToo.
      </p>
      <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2E7D32; margin-top: 0;">📢 Next Steps:</h3>
        <ul style="color: #333; line-height: 1.8;">
          <li>Share your listing on social media</li>
          <li>Monitor views in your dashboard</li>
          <li>Respond to shopper inquiries promptly</li>
        </ul>
      </div>
      <p style="text-align: center;">
        <a href="${SITE_URL}/listing/${vars.listing_id}" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 10px;">View Listing</a>
        <a href="${SITE_URL}/vendor-dashboard" style="background: #32CD32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Dashboard</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 14. Share Invite (Friend)
  shareInvite: (vars: TemplateVars) => ({
    subject: `Check out this deal: ${vars.listing_title}`,
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Your Friend Shared a Deal!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hey there!
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        A friend thought you'd love this exclusive deal from ThatsGoodToo:
      </p>
      <div style="background: #FFF; padding: 20px; border-radius: 8px; border: 2px solid #FFD700; margin: 20px 0; text-align: center;">
        <h3 style="color: #FF4500; margin-top: 0;">${vars.listing_title}</h3>
        ${vars.coupon_code ? `<div style="background: #FFF8DC; padding: 15px; border-radius: 8px; margin: 15px 0;"><p style="color: #666; margin: 0 0 8px 0; font-size: 14px;">Use Coupon Code:</p><p style="color: #FF4500; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px;">${vars.coupon_code}</p></div>` : ""}
      </div>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${SITE_URL}/listing/${vars.listing_id}" style="background: #FF4500; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">View Deal</a>
      </p>
      <p style="color: #666; font-size: 14px; text-align: center;">
        Discover more local deals on ThatsGoodToo!
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 15. Referral Bonus
  referralBonus: (vars: TemplateVars) => ({
    subject: "🎉 Referral Bonus Unlocked!",
    html: wrapTemplate(
      `
      <h2 style="color: #32CD32; text-align: center;">You Earned a Bonus!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Congratulations, ${vars.user_name}!
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Your friend just signed up using your referral link. Here's your reward:
      </p>
      <div style="background: #FFF; padding: 20px; border-radius: 8px; border: 2px dashed #FFD700; margin: 20px 0; text-align: center;">
        <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your Bonus Coupon:</p>
        <p style="color: #32CD32; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 3px;">${vars.coupon_code}</p>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Use it on your next purchase!</p>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 1.6; text-align: center;">
        Keep sharing to earn more bonuses! 💰
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${SITE_URL}" style="background: #32CD32; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Shop Now</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 16. Re-engagement (Inactive User)
  reEngagement: (vars: TemplateVars) => ({
    subject: "💝 We Missed You! Top 3 Hot Coupons Inside",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">Come Back for Great Deals!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hey ${vars.user_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        It's been a while! We've got some hot new deals waiting for you:
      </p>
      <div style="background: #FFF; padding: 20px; border-radius: 8px; border: 1px solid #FFD700; margin: 20px 0;">
        <h3 style="color: #FF4500; margin-top: 0;">🔥 Trending Now:</h3>
        <pre style="background: #FFF8DC; padding: 15px; border-radius: 8px; font-family: Arial, sans-serif; white-space: pre-wrap; word-wrap: break-word;">${vars.top_coupons || "Check out the latest deals on our platform!"}</pre>
      </div>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${SITE_URL}" style="background: #FF4500; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Explore Deals</a>
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 17. Feedback Survey
  feedbackSurvey: (vars: TemplateVars) => ({
    subject: "How are we doing? Quick feedback requested 📝",
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">We Value Your Opinion!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.user_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        We noticed you've saved 5 items on ThatsGoodToo! 🎉 We'd love to hear your thoughts.
      </p>
      <div style="background: #E3F2FD; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h3 style="color: #1976D2; margin-top: 0;">Rate Your Experience:</h3>
        <div style="font-size: 32px; margin: 15px 0;">
          ⭐ ⭐ ⭐ ⭐ ⭐
        </div>
        <p style="color: #333; margin: 10px 0;">
          Reply to this email with a number (1-5):
        </p>
        <ul style="text-align: left; display: inline-block; margin: 15px 0;">
          <li>⭐ = Needs improvement</li>
          <li>⭐⭐⭐ = Good</li>
          <li>⭐⭐⭐⭐⭐ = Amazing!</li>
        </ul>
      </div>
      <p style="color: #666; font-size: 14px; text-align: center;">
        Your feedback helps us improve ThatsGoodToo for everyone!
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 18. Contact Thank You
  contactThankYou: (vars: TemplateVars) => ({
    subject: "Thanks for reaching out! 💬",
    html: wrapTemplate(
      `
      <h2 style="color: #32CD32; text-align: center;">Message Received!</h2>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi ${vars.user_name},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Thank you for contacting ThatsGoodToo! We've received your message and will get back to you as soon as possible.
      </p>
      <div style="background: #E8F5E9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #333;">
          <strong>What you sent:</strong><br>
          "${vars.message}"
        </p>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        In the meantime, feel free to explore our latest deals!
      </p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${SITE_URL}" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Browse Deals</a>
      </p>
      <p style="color: #666; font-size: 14px; text-align: center;">
        Best regards,<br>ThatsGoodToo Team
      </p>
      `,
      vars.unsubscribe_url
    ),
  }),

  // 19. Admin Notification (New Contact)
  adminContactNotification: (vars: TemplateVars) => ({
    subject: `New Contact Form: ${vars.user_name}`,
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">New Contact Submission</h2>
      <div style="background: #FFF; padding: 20px; border-radius: 8px; border: 1px solid #FFD700; margin: 20px 0;">
        <p style="color: #333; margin: 5px 0;"><strong>From:</strong> ${vars.user_name}</p>
        <p style="color: #333; margin: 5px 0;"><strong>Email:</strong> ${vars.user_email}</p>
        <hr style="border: 1px solid #FFD700; margin: 15px 0;">
        <p style="color: #333; margin: 5px 0;"><strong>Message:</strong></p>
        <p style="color: #333; background: #FFF8DC; padding: 15px; border-radius: 8px; white-space: pre-wrap; word-wrap: break-word;">${vars.message}</p>
      </div>
      <p style="text-align: center;">
        <a href="mailto:${vars.user_email}" style="background: #FF4500; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reply to ${vars.user_name}</a>
      </p>
      `
    ),
  }),

  // 20. Admin Notification (New Vendor Application)
  adminVendorApplicationNotification: (vars: TemplateVars) => ({
    subject: `New Vendor Application: ${vars.business_name}`,
    html: wrapTemplate(
      `
      <h2 style="color: #FF4500; text-align: center;">New Vendor Application</h2>
      <div style="background: #FFF; padding: 20px; border-radius: 8px; border: 1px solid #FFD700; margin: 20px 0;">
        <p style="color: #333; margin: 5px 0;"><strong>Business:</strong> ${vars.business_name}</p>
        <p style="color: #333; margin: 5px 0;"><strong>Email:</strong> ${vars.user_email}</p>
        <p style="color: #333; margin: 5px 0;"><strong>Type:</strong> ${vars.business_type}</p>
      </div>
      <p style="text-align: center;">
        <a href="${SITE_URL}/admin" style="background: #FF4500; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Review Application</a>
      </p>
      `
    ),
  }),
};

export const getTemplate = (templateName: keyof typeof templates, vars: TemplateVars) => {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }
  return template(vars);
};
