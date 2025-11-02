import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle, Clock, Search, Shield, ExternalLink, Check, X } from "lucide-react";

interface VendorApplication {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  business_type: string | null;
  business_type_other: string | null;
  business_description: string | null;
  website: string | null;
  phone_number: string | null;
  city: string | null;
  state_region: string | null;
  country: string | null;
  pickup_address: string | null;
  products_services: string[] | null;
  inventory_type: string[] | null;
  shipping_options: string[] | null;
  area_of_expertise: string[] | null;
  business_duration: string | null;
  craft_development: string | null;
  certifications_awards: string | null;
  creativity_style: string | null;
  inspiration: string | null;
  brand_uniqueness: string | null;
  sustainable_methods: string[] | null;
  pricing_style: string | null;
  exclusive_offers: string | null;
  promotion_social_channels: string | null;
  social_media_links: string[] | null;
  future_website: string | null;
  subscription_type: string | null;
  promo_code: string | null;
  additional_info: string | null;
  admin_notes: string | null;
  info_accurate: boolean | null;
  understands_review: boolean | null;
  agrees_to_terms: boolean | null;
  receive_updates: boolean | null;
  payment_method_saved: boolean | null;
  profiles?: {
    email: string;
    full_name: string | null;
    display_name: string | null;
  } | null;
}

const AdminDashboard = () => {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<VendorApplication | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "pending" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [detailViewApp, setDetailViewApp] = useState<VendorApplication | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        navigate("/");
        return;
      }

      const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: user.id });
      if (!isAdmin) {
        toast.error("Access denied: Admin privileges required");
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  // Load applications
  useEffect(() => {
    loadApplications();
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;

    if (activeFilter !== "all") {
      filtered = filtered.filter((app) => app.status === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.profiles?.full_name?.toLowerCase().includes(query) ||
          app.profiles?.email?.toLowerCase().includes(query) ||
          app.business_type?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  }, [applications, activeFilter, searchQuery]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vendor_applications")
        .select(`
          *,
          profiles (
            email,
            full_name,
            display_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications((data as unknown as VendorApplication[]) || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (app: VendorApplication, action: "approve" | "reject" | "pending") => {
    setSelectedApp(app);
    setActionType(action);
    setAdminNotes("");
  };

  const confirmAction = async () => {
    if (!selectedApp || !actionType) return;

    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("update-vendor-status", {
        body: {
          application_id: selectedApp.id,
          new_status: actionType,
          admin_notes: adminNotes || undefined,
        },
      });

      if (error) throw error;

      toast.success(`Application ${actionType === "approve" ? "approved" : actionType === "reject" ? "rejected" : "set to pending"}`);
      
      // Reload applications
      await loadApplications();
      
      // Close dialog
      setSelectedApp(null);
      setActionType(null);
      setAdminNotes("");
    } catch (error: unknown) {
      console.error("Error updating application:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update application");
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = (app: VendorApplication) => {
    setDetailViewApp(app);
    setDetailViewOpen(true);
  };

  const handleActionFromDetail = (action: "approve" | "reject" | "pending") => {
    if (detailViewApp) {
      setDetailViewOpen(false);
      handleAction(detailViewApp, action);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-600 gap-1"><CheckCircle className="h-3 w-3" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatArray = (arr: string[] | null) => {
    if (!arr || arr.length === 0) return "None specified";
    return arr.join(", ");
  };

  const formatBoolean = (value: boolean | null) => {
    if (value === null) return <Badge variant="outline">Not specified</Badge>;
    return value ? (
      <Badge variant="default" className="bg-green-600 gap-1"><Check className="h-3 w-3" />Yes</Badge>
    ) : (
      <Badge variant="secondary" className="gap-1"><X className="h-3 w-3" />No</Badge>
    );
  };

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 container mx-auto px-4 sm:px-6 py-12">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage vendor applications</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Pending Review</CardDescription>
                <CardTitle className="text-3xl">{pendingCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Approved</CardDescription>
                <CardTitle className="text-3xl text-green-600">{approvedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Rejected</CardDescription>
                <CardTitle className="text-3xl text-destructive">{rejectedCount}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Applications Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Vendor Applications</CardTitle>
                  <CardDescription>Review and manage vendor applications</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                  <TabsTrigger value="approved">Approved ({approvedCount})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeFilter} className="mt-0">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Business</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApplications.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                              No applications found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredApplications.map((app) => (
                            <TableRow key={app.id}>
                              <TableCell className="font-medium">
                                {app.profiles?.full_name || app.profiles?.display_name || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {app.profiles?.email || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {app.business_type || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm">
                                {app.city && app.state_region
                                  ? `${app.city}, ${app.state_region}`
                                  : "N/A"}
                              </TableCell>
                              <TableCell>{getStatusBadge(app.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewDetails(app)}
                                    title="View Details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAction(app, "pending")}
                                    title="Set to Pending"
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAction(app, "approve")}
                                    className="text-green-600 hover:text-green-700"
                                    title="Approve"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAction(app, "reject")}
                                    className="text-destructive hover:text-destructive"
                                    title="Reject"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Detailed Application View Dialog */}
      <Dialog open={detailViewOpen} onOpenChange={setDetailViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Vendor Application Details</span>
              {detailViewApp && getStatusBadge(detailViewApp.status)}
            </DialogTitle>
            <DialogDescription>
              Review complete application information for {detailViewApp?.profiles?.full_name || "this vendor"}
            </DialogDescription>
          </DialogHeader>

          {detailViewApp && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Applicant Information */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Applicant Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{detailViewApp.profiles?.full_name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Display Name</Label>
                      <p className="font-medium">{detailViewApp.profiles?.display_name || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{detailViewApp.profiles?.email || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{detailViewApp.phone_number || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Submitted</Label>
                      <p className="font-medium">{formatDate(detailViewApp.created_at)}</p>
                    </div>
                    {detailViewApp.reviewed_at && (
                      <div>
                        <Label className="text-muted-foreground">Reviewed</Label>
                        <p className="font-medium">{formatDate(detailViewApp.reviewed_at)}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="business" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="business">Business</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="background">Background</TabsTrigger>
                    <TabsTrigger value="marketing">Marketing</TabsTrigger>
                  </TabsList>

                  {/* Business Tab */}
                  <TabsContent value="business" className="space-y-4 mt-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-muted-foreground">Business Type</Label>
                        <p className="font-medium">
                          {detailViewApp.business_type || "N/A"}
                          {detailViewApp.business_type_other && ` (${detailViewApp.business_type_other})`}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Business Description</Label>
                        <p className="font-medium whitespace-pre-wrap">
                          {detailViewApp.business_description || "No description provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Website</Label>
                        {detailViewApp.website ? (
                          <a
                            href={detailViewApp.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {detailViewApp.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="font-medium">No website</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">City</Label>
                          <p className="font-medium">{detailViewApp.city || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">State/Region</Label>
                          <p className="font-medium">{detailViewApp.state_region || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Country</Label>
                          <p className="font-medium">{detailViewApp.country || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Business Duration</Label>
                          <p className="font-medium">{detailViewApp.business_duration || "N/A"}</p>
                        </div>
                      </div>
                      {detailViewApp.pickup_address && (
                        <div>
                          <Label className="text-muted-foreground">Pickup Address</Label>
                          <p className="font-medium">{detailViewApp.pickup_address}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Products Tab */}
                  <TabsContent value="products" className="space-y-4 mt-4">
                    <div>
                      <Label className="text-muted-foreground">Products & Services</Label>
                      <p className="font-medium">{formatArray(detailViewApp.products_services)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Inventory Type</Label>
                      <p className="font-medium">{formatArray(detailViewApp.inventory_type)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Shipping Options</Label>
                      <p className="font-medium">{formatArray(detailViewApp.shipping_options)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Area of Expertise</Label>
                      <p className="font-medium">{formatArray(detailViewApp.area_of_expertise)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Pricing Style</Label>
                      <p className="font-medium">{detailViewApp.pricing_style || "N/A"}</p>
                    </div>
                    {detailViewApp.exclusive_offers && (
                      <div>
                        <Label className="text-muted-foreground">Exclusive Offers</Label>
                        <p className="font-medium whitespace-pre-wrap">{detailViewApp.exclusive_offers}</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Background Tab */}
                  <TabsContent value="background" className="space-y-4 mt-4">
                    {detailViewApp.craft_development && (
                      <div>
                        <Label className="text-muted-foreground">Craft Development</Label>
                        <p className="font-medium whitespace-pre-wrap">{detailViewApp.craft_development}</p>
                      </div>
                    )}
                    {detailViewApp.certifications_awards && (
                      <div>
                        <Label className="text-muted-foreground">Certifications & Awards</Label>
                        <p className="font-medium whitespace-pre-wrap">{detailViewApp.certifications_awards}</p>
                      </div>
                    )}
                    {detailViewApp.creativity_style && (
                      <div>
                        <Label className="text-muted-foreground">Creativity Style</Label>
                        <p className="font-medium whitespace-pre-wrap">{detailViewApp.creativity_style}</p>
                      </div>
                    )}
                    {detailViewApp.inspiration && (
                      <div>
                        <Label className="text-muted-foreground">Inspiration</Label>
                        <p className="font-medium whitespace-pre-wrap">{detailViewApp.inspiration}</p>
                      </div>
                    )}
                    {detailViewApp.brand_uniqueness && (
                      <div>
                        <Label className="text-muted-foreground">Brand Uniqueness</Label>
                        <p className="font-medium whitespace-pre-wrap">{detailViewApp.brand_uniqueness}</p>
                      </div>
                    )}
                    {detailViewApp.sustainable_methods && (
                      <div>
                        <Label className="text-muted-foreground">Sustainable Methods</Label>
                        <p className="font-medium">{formatArray(detailViewApp.sustainable_methods)}</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Marketing Tab */}
                  <TabsContent value="marketing" className="space-y-4 mt-4">
                    {detailViewApp.social_media_links && detailViewApp.social_media_links.length > 0 && (
                      <div>
                        <Label className="text-muted-foreground">Social Media Links</Label>
                        <div className="space-y-1">
                          {detailViewApp.social_media_links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline inline-flex items-center gap-1 block"
                            >
                              {link}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {detailViewApp.promotion_social_channels && (
                      <div>
                        <Label className="text-muted-foreground">Promotion & Social Channels</Label>
                        <p className="font-medium whitespace-pre-wrap">{detailViewApp.promotion_social_channels}</p>
                      </div>
                    )}
                    {detailViewApp.future_website && (
                      <div>
                        <Label className="text-muted-foreground">Future Website Plans</Label>
                        <p className="font-medium whitespace-pre-wrap">{detailViewApp.future_website}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">Subscription Type</Label>
                      <p className="font-medium">{detailViewApp.subscription_type || "N/A"}</p>
                    </div>
                    {detailViewApp.promo_code && (
                      <div>
                        <Label className="text-muted-foreground">Promo Code</Label>
                        <p className="font-medium">{detailViewApp.promo_code}</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <Separator />

                {/* Agreements & Verification */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Agreements & Verification</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Information Accurate</Label>
                      {formatBoolean(detailViewApp.info_accurate)}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Understands Review Process</Label>
                      {formatBoolean(detailViewApp.understands_review)}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Agrees to Terms</Label>
                      {formatBoolean(detailViewApp.agrees_to_terms)}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Receive Updates</Label>
                      {formatBoolean(detailViewApp.receive_updates)}
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Payment Method Saved</Label>
                      {formatBoolean(detailViewApp.payment_method_saved)}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {detailViewApp.additional_info && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Additional Information</Label>
                      <p className="font-medium whitespace-pre-wrap mt-2">{detailViewApp.additional_info}</p>
                    </div>
                  </>
                )}

                {/* Admin Notes */}
                {detailViewApp.admin_notes && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground">Admin Notes</Label>
                      <p className="font-medium whitespace-pre-wrap mt-2 text-destructive">
                        {detailViewApp.admin_notes}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setDetailViewOpen(false)}>
              Close
            </Button>
            {detailViewApp && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleActionFromDetail("pending")}
                  disabled={detailViewApp.status === "pending"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Set Pending
                </Button>
                <Button
                  variant="outline"
                  className="text-green-600 hover:text-green-700 border-green-600"
                  onClick={() => handleActionFromDetail("approve")}
                  disabled={detailViewApp.status === "approved"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleActionFromDetail("reject")}
                  disabled={detailViewApp.status === "rejected"}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <AlertDialog open={!!selectedApp && !!actionType} onOpenChange={() => {
        setSelectedApp(null);
        setActionType(null);
        setAdminNotes("");
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" && "Approve Application"}
              {actionType === "reject" && "Reject Application"}
              {actionType === "pending" && "Set to Pending"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve" &&
                `Approve ${selectedApp?.profiles?.full_name || "this vendor"}'s application? This will create their vendor profile and grant access.`}
              {actionType === "reject" &&
                `Reject ${selectedApp?.profiles?.full_name || "this vendor"}'s application? They will be notified via email.`}
              {actionType === "pending" &&
                `Set ${selectedApp?.profiles?.full_name || "this vendor"}'s application back to pending status?`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Provide feedback or reason for rejection..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                These notes will be included in the rejection email
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction} disabled={processing}>
              {processing ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;
