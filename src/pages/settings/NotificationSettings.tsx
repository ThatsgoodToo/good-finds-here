import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, AlertCircle } from "lucide-react";
import SettingsLayout from "@/components/settings/SettingsLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  notifyExpiryAlerts: boolean;
  notifyCouponResets: boolean;
  notifyVendorNudges: boolean;
  notifyEngagement: boolean;
  notifyShareInvites: boolean;
  notifyReferralBonus: boolean;
  notifyFeedbackRequests: boolean;
  notifyListingUpdates: boolean;
}

export default function NotificationSettings() {
  const { user, roles: userRoles } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<NotificationPreferences>({
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      notifyExpiryAlerts: true,
      notifyCouponResets: true,
      notifyVendorNudges: true,
      notifyEngagement: false,
      notifyShareInvites: true,
      notifyReferralBonus: true,
      notifyFeedbackRequests: true,
      notifyListingUpdates: true,
    },
  });

  // Load current preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching preferences:", error);
      } else if (data) {
        form.reset({
          emailNotifications: data.email_notifications ?? true,
          pushNotifications: data.push_notifications ?? true,
          marketingEmails: data.marketing_emails ?? false,
          notifyExpiryAlerts: data.notify_expiry_alerts ?? true,
          notifyCouponResets: data.notify_coupon_resets ?? true,
          notifyVendorNudges: data.notify_vendor_nudges ?? true,
          notifyEngagement: data.notify_engagement ?? false,
          notifyShareInvites: data.notify_share_invites ?? true,
          notifyReferralBonus: data.notify_referral_bonus ?? true,
          notifyFeedbackRequests: data.notify_feedback_requests ?? true,
          notifyListingUpdates: data.notify_listing_updates ?? true,
        });
      }
    };

    loadPreferences();
  }, [user, form]);

  const onSubmit = async (values: NotificationPreferences) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        email_notifications: values.emailNotifications,
        push_notifications: values.pushNotifications,
        marketing_emails: values.marketingEmails,
        notify_expiry_alerts: values.notifyExpiryAlerts,
        notify_coupon_resets: values.notifyCouponResets,
        notify_vendor_nudges: values.notifyVendorNudges,
        notify_engagement: values.notifyEngagement,
        notify_share_invites: values.notifyShareInvites,
        notify_referral_bonus: values.notifyReferralBonus,
        notify_feedback_requests: values.notifyFeedbackRequests,
        notify_listing_updates: values.notifyListingUpdates,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isVendor = userRoles?.includes("vendor" as any);
  const masterEmailEnabled = form.watch("emailNotifications");

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Notification Preferences</h2>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {!masterEmailEnabled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Master email notifications are OFF. Enable them to receive specific notification types.
                </AlertDescription>
              </Alert>
            )}

            {/* Master Controls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Master Controls</h3>
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Master toggle - disables all email notifications when OFF
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Push Notifications</FormLabel>
                      <FormDescription>
                        Receive push notifications in your browser
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Deal Alerts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Deal Alerts</h3>
              <FormField
                control={form.control}
                name="notifyExpiryAlerts"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Expiring Deals</FormLabel>
                      <FormDescription>
                        Get notified when your saved deals are about to expire
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifyCouponResets"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Coupon Resets</FormLabel>
                      <FormDescription>
                        Get notified when coupons for your saved deals reset
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifyShareInvites"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Shared Deals</FormLabel>
                      <FormDescription>
                        Get notified when someone shares a deal with you
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Engagement */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Engagement & Community</h3>
              <FormField
                control={form.control}
                name="notifyEngagement"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Re-engagement Emails</FormLabel>
                      <FormDescription>
                        Monthly emails with trending deals and updates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifyFeedbackRequests"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Feedback Surveys</FormLabel>
                      <FormDescription>
                        Help us improve by sharing your feedback
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notifyReferralBonus"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Referral Bonuses</FormLabel>
                      <FormDescription>
                        Get notified when your referrals earn you rewards
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-0.5">
                      <FormLabel>Marketing Emails</FormLabel>
                      <FormDescription>
                        Receive emails about promotions and platform updates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Vendor Updates */}
            {isVendor && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Vendor Updates</h3>
                <FormField
                  control={form.control}
                  name="notifyVendorNudges"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel>Weekly Activity Nudges</FormLabel>
                        <FormDescription>
                          Get weekly tips to boost your listing performance
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notifyListingUpdates"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel>Listing Approval Notifications</FormLabel>
                        <FormDescription>
                          Get notified when your listings are approved or need changes
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!masterEmailEnabled} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </Form>
      </div>
    </SettingsLayout>
  );
}
