import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Database, Mail, Clock, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";

export default function TestDataPage() {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const isAdmin = roles.includes("admin" as any);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Admin access required to view this page.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const generateFeedbackSaves = async () => {
    setLoading("feedback");
    try {
      if (!user) throw new Error("Not authenticated");

      // Create 5 test saves
      const saves = Array.from({ length: 5 }, (_, i) => ({
        user_id: user.id,
        listing_id: crypto.randomUUID(), // Fake listing IDs
        email_on_save: true,
      }));

      const { error } = await supabase.from("user_saves").insert(saves);
      if (error) throw error;

      toast({
        title: "Test Data Created",
        description: "5 saves added. Feedback email should trigger on the 5th save.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const createExpiringListing = async () => {
    setLoading("expiring");
    try {
      if (!user) throw new Error("Not authenticated");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3); // Expires in 3 days

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          vendor_id: user.id,
          title: `[TEST] Expiring Deal - ${format(new Date(), "PPp")}`,
          description: "This is a test listing that expires in 3 days",
          category: "test",
          listing_type: "product",
          status: "active",
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create a test coupon
      const { error: couponError } = await supabase.from("coupons").insert({
        vendor_id: user.id,
        listing_id: listing.id,
        code: `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discount_type: "percentage",
        discount_value: 20,
        start_date: new Date().toISOString(),
        end_date: expiresAt.toISOString(),
        active_status: true,
        max_uses: 10,
        used_count: 0,
      });

      if (couponError) throw couponError;

      toast({
        title: "Test Listing Created",
        description: `Listing expires in 3 days. ID: ${listing.id}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const createResetDueListing = async () => {
    setLoading("reset");
    try {
      if (!user) throw new Error("Not authenticated");

      const resetsAt = new Date();
      resetsAt.setHours(resetsAt.getHours() - 1); // Reset was due 1 hour ago

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          vendor_id: user.id,
          title: `[TEST] Reset Due - ${format(new Date(), "PPp")}`,
          description: "This listing's coupon is due for a reset",
          category: "test",
          listing_type: "product",
          status: "active",
          reset_cycle: "daily",
          resets_at: resetsAt.toISOString(),
        })
        .select()
        .single();

      if (listingError) throw listingError;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const { error: couponError } = await supabase.from("coupons").insert({
        vendor_id: user.id,
        listing_id: listing.id,
        code: `RESET${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discount_type: "percentage",
        discount_value: 15,
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
        active_status: true,
        is_recurring: true,
        recurrence_pattern: "daily",
        max_uses: 5,
        used_count: 4, // Almost depleted
      });

      if (couponError) throw couponError;

      toast({
        title: "Test Listing Created",
        description: `Reset was due 1 hour ago. ID: ${listing.id}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test Data Generator</h1>
          <p className="text-muted-foreground">
            Admin-only tools for testing cron jobs and email notifications
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            These tools create test data in the database. Use responsibly and clean up test data
            after testing.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Feedback Email Test
              </CardTitle>
              <CardDescription>
                Generate 5 user saves to trigger the feedback survey email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={generateFeedbackSaves}
                disabled={loading === "feedback"}
                className="w-full"
              >
                {loading === "feedback" ? "Creating..." : "Generate 5 Saves"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Expiring Listing Test
              </CardTitle>
              <CardDescription>
                Create a test listing that expires in 3 days (triggers expiry email)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={createExpiringListing}
                disabled={loading === "expiring"}
                className="w-full"
              >
                {loading === "expiring" ? "Creating..." : "Create Expiring Listing"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Reset Due Test
              </CardTitle>
              <CardDescription>
                Create a test listing with a coupon that was due for reset 1 hour ago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={createResetDueListing}
                disabled={loading === "reset"}
                className="w-full"
              >
                {loading === "reset" ? "Creating..." : "Create Reset Due Listing"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function format(date: Date, formatStr: string): string {
  return date.toISOString();
}
