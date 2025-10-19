import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

type VendorApplication = {
  id: string;
  created_at: string;
  status: string;
  website: string;
  city: string;
  state_region: string;
  country: string;
  business_type: string;
  business_description: string;
  area_of_expertise: string[];
  business_duration: string;
  admin_notes: string | null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<VendorApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (userRole !== "admin") {
      toast.error("You don't have permission to access this page");
      navigate("/");
      return;
    }

    fetchApplications();
  }, [user, userRole, navigate]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("vendor_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    setProcessing(true);
    try {
      // Get the full application data
      const { data: app, error: fetchError } = await supabase
        .from("vendor_applications")
        .select("*")
        .eq("id", applicationId)
        .single();

      if (fetchError) throw fetchError;

      // Create vendor profile
      const { error: insertError } = await supabase.from("vendor_profiles").insert({
        user_id: app.user_id,
        application_id: app.id,
        website: app.website,
        social_media_links: app.social_media_links,
        city: app.city,
        state_region: app.state_region,
        country: app.country,
        phone_number: app.phone_number,
        business_type: app.business_type,
        business_type_other: app.business_type_other,
        business_description: app.business_description,
        products_services: app.products_services,
        inventory_type: app.inventory_type,
        shipping_options: app.shipping_options,
        pickup_address: app.pickup_address,
        area_of_expertise: app.area_of_expertise,
        business_duration: app.business_duration,
        craft_development: app.craft_development,
        certifications_awards: app.certifications_awards,
        creativity_style: app.creativity_style,
        inspiration: app.inspiration,
        brand_uniqueness: app.brand_uniqueness,
        sustainable_methods: app.sustainable_methods,
        pricing_style: app.pricing_style,
        exclusive_offers: app.exclusive_offers,
        promotion_social_channels: app.promotion_social_channels,
        future_website: app.future_website,
        subscription_type: app.subscription_type,
      });

      if (insertError) throw insertError;

      // Update application status
      const { error: updateError } = await supabase
        .from("vendor_applications")
        .update({
          status: "approved",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq("id", applicationId);

      if (updateError) throw updateError;

      // Update profiles table role
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role: "vendor" })
        .eq("id", app.user_id);

      if (roleError) throw roleError;

      toast.success("Application approved successfully!");
      fetchApplications();
      setSelectedApp(null);
      setAdminNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve application");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("vendor_applications")
        .update({
          status: "rejected",
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes,
        })
        .eq("id", applicationId);

      if (error) throw error;

      toast.success("Application rejected");
      fetchApplications();
      setSelectedApp(null);
      setAdminNotes("");
    } catch (error: any) {
      toast.error("Failed to reject application");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingApps = applications.filter((app) => app.status === "pending");
  const approvedApps = applications.filter((app) => app.status === "approved");
  const rejectedApps = applications.filter((app) => app.status === "rejected");

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Review and manage vendor applications</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingApps.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedApps.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApps.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {pendingApps.map((app) => (
                  <Card
                    key={app.id}
                    className={`cursor-pointer transition-colors ${
                      selectedApp?.id === app.id ? "border-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedApp(app);
                      setAdminNotes(app.admin_notes || "");
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{app.website}</CardTitle>
                          <CardDescription>
                            {app.city}, {app.state_region}, {app.country}
                          </CardDescription>
                        </div>
                        <Badge>{app.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {app.business_description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied: {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedApp && (
                <Card className="sticky top-6 h-fit">
                  <CardHeader>
                    <CardTitle>Application Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="font-semibold">Website</Label>
                          <p className="text-sm">{selectedApp.website}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Location</Label>
                          <p className="text-sm">
                            {selectedApp.city}, {selectedApp.state_region}, {selectedApp.country}
                          </p>
                        </div>
                        <div>
                          <Label className="font-semibold">Business Type</Label>
                          <p className="text-sm">{selectedApp.business_type}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Description</Label>
                          <p className="text-sm">{selectedApp.business_description}</p>
                        </div>
                        <div>
                          <Label className="font-semibold">Expertise Areas</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedApp.area_of_expertise?.map((area) => (
                              <Badge key={area} variant="secondary">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="font-semibold">Business Duration</Label>
                          <p className="text-sm">{selectedApp.business_duration}</p>
                        </div>

                        <div className="space-y-2 pt-4 border-t">
                          <Label htmlFor="adminNotes">Admin Notes</Label>
                          <Textarea
                            id="adminNotes"
                            placeholder="Add notes about this application..."
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            rows={4}
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => handleApprove(selectedApp.id)}
                            disabled={processing}
                            className="flex-1"
                          >
                            {processing ? "Processing..." : "Approve"}
                          </Button>
                          <Button
                            onClick={() => handleReject(selectedApp.id)}
                            disabled={processing}
                            variant="destructive"
                            className="flex-1"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedApps.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{app.website}</CardTitle>
                    <CardDescription>
                      {app.city}, {app.state_region}, {app.country}
                    </CardDescription>
                  </div>
                  <Badge variant="default">{app.status}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedApps.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{app.website}</CardTitle>
                    <CardDescription>
                      {app.city}, {app.state_region}, {app.country}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">{app.status}</Badge>
                </div>
              </CardHeader>
              {app.admin_notes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {app.admin_notes}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
