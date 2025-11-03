import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import Header from "@/components/Header";

const EMAIL_TEMPLATES = [
  { value: "welcome", label: "Welcome (Signup)", vars: "user_name" },
  { value: "vendorApproved", label: "Vendor Approved", vars: "business_name" },
  { value: "vendorRejected", label: "Vendor Rejected", vars: "business_name, rejection_reason" },
  { value: "passwordReset", label: "Password Reset", vars: "user_name, reset_link" },
  { value: "waitlistConfirm", label: "Waitlist Confirmation", vars: "user_name" },
  { value: "saveRedeemGuide", label: "Save/Redeem Guide", vars: "user_name, listing_title, coupon_code, listing_id" },
  { value: "listingExpiringSoonUser", label: "Listing Expiring (User)", vars: "user_name, listing_title, expires_date, coupon_code, listing_id" },
  { value: "listingExpiringSoonVendor", label: "Listing Expiring (Vendor)", vars: "business_name, listing_title, expires_date" },
  { value: "couponResetUser", label: "Coupon Reset (User)", vars: "user_name, listing_title, coupon_code, reset_date, listing_id" },
  { value: "couponResetVendor", label: "Coupon Reset (Vendor)", vars: "business_name, listing_title" },
  { value: "weeklyVendorNudge", label: "Weekly Vendor Nudge", vars: "business_name, has_listings" },
  { value: "noCouponsAlert", label: "No Coupons Alert", vars: "business_name" },
  { value: "listingPostConfirm", label: "Listing Posted", vars: "business_name, listing_title, listing_id" },
  { value: "shareInvite", label: "Share Invite", vars: "listing_title, coupon_code, listing_id" },
  { value: "referralBonus", label: "Referral Bonus", vars: "user_name, coupon_code" },
  { value: "reEngagement", label: "Re-engagement", vars: "user_name, top_coupons" },
  { value: "feedbackSurvey", label: "Feedback Survey", vars: "user_name" },
  { value: "contactThankYou", label: "Contact Thank You", vars: "user_name, message" },
  { value: "adminContactNotification", label: "Admin Contact Alert", vars: "user_name, user_email, message" },
  { value: "adminVendorApplicationNotification", label: "Admin Vendor Alert", vars: "business_name, user_email, business_type" },
];

const EmailTestPage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const getDefaultVars = (template: string): Record<string, string> => {
    const defaults: Record<string, Record<string, string>> = {
      welcome: { user_name: "Test User" },
      vendorApproved: { business_name: "Test Vendor Co" },
      vendorRejected: { business_name: "Test Vendor", rejection_reason: "Incomplete application" },
      passwordReset: { user_name: "Test User", reset_link: "https://thatsgoodtoo.shop/reset?token=abc123" },
      waitlistConfirm: { user_name: "Test User" },
      saveRedeemGuide: { user_name: "Test User", listing_title: "50% Off Coffee", coupon_code: "COFFEE50", listing_id: "test-123" },
      listingExpiringSoonUser: { user_name: "Test User", listing_title: "Weekend Sale", expires_date: "Dec 31, 2025", coupon_code: "WEEKEND20", listing_id: "test-123" },
      listingExpiringSoonVendor: { business_name: "Test Vendor", listing_title: "Weekend Sale", expires_date: "Dec 31, 2025" },
      couponResetUser: { user_name: "Test User", listing_title: "Daily Deal", coupon_code: "DAILY10", reset_date: "Jan 15, 2025", listing_id: "test-123" },
      couponResetVendor: { business_name: "Test Vendor", listing_title: "Daily Deal" },
      weeklyVendorNudge: { business_name: "Test Vendor", has_listings: "false" },
      noCouponsAlert: { business_name: "Test Vendor" },
      listingPostConfirm: { business_name: "Test Vendor", listing_title: "New Product Launch", listing_id: "test-123" },
      shareInvite: { listing_title: "Amazing Deal", coupon_code: "FRIEND20", listing_id: "test-123" },
      referralBonus: { user_name: "Test User", coupon_code: "REFER10" },
      reEngagement: { user_name: "Test User", top_coupons: "• 50% Off Pizza - PIZZA50\n• Free Shipping - FREESHIP\n• Buy 2 Get 1 - BOGO" },
      feedbackSurvey: { user_name: "Test User" },
      contactThankYou: { user_name: "Test User", message: "I love the platform!" },
      adminContactNotification: { user_name: "John Doe", user_email: "john@example.com", message: "Question about pricing" },
      adminVendorApplicationNotification: { business_name: "New Vendor LLC", user_email: "vendor@example.com", business_type: "Restaurant" },
    };
    return defaults[template] || {};
  };

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail) {
      toast.error("Please select a template and enter an email");
      return;
    }

    setIsSending(true);
    try {
      const templateVars = getDefaultVars(selectedTemplate);

      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: testEmail,
          template: selectedTemplate,
          templateVars,
        },
      });

      if (error) throw error;

      toast.success("Test email sent!", {
        description: `Check ${testEmail} for the email`,
      });
      setLastSent(selectedTemplate);
    } catch (error: any) {
      console.error("Test email error:", error);
      toast.error("Failed to send test email", {
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const selectedTemplateInfo = EMAIL_TEMPLATES.find(t => t.value === selectedTemplate);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16 container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">📧 Email Template Testing</h1>
            <p className="text-muted-foreground">
              Test all 20 branded email templates with live preview
            </p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Send Test Email</CardTitle>
              </div>
              <CardDescription>
                Select a template and send it to any email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Email Template</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Choose a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TEMPLATES.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTemplateInfo && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-semibold mb-1">Template Variables:</p>
                  <p className="text-muted-foreground">{selectedTemplateInfo.vars}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Test Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleSendTest} 
                disabled={isSending || !selectedTemplate || !testEmail}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Test Email
                  </>
                )}
              </Button>

              {lastSent && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <CheckCircle className="h-4 w-4" />
                  Last sent: {EMAIL_TEMPLATES.find(t => t.value === lastSent)?.label}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Templates</CardTitle>
              <CardDescription>
                All 20 email templates are ready to use
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {EMAIL_TEMPLATES.map((template) => (
                  <div
                    key={template.value}
                    className="p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setSelectedTemplate(template.value)}
                  >
                    <p className="font-semibold text-sm">{template.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{template.vars}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EmailTestPage;
