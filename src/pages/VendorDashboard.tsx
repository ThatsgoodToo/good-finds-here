import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import SignupModal from "@/components/SignupModal";
import VendorPendingApproval from "@/components/VendorPendingApproval";
import VendorApplicationRejected from "@/components/VendorApplicationRejected";
import { useVendorAccess } from "@/hooks/useVendorAccess";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, BarChart3, Tag, Hand, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Header from "@/components/Header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import VendorHeader from "@/components/dashboard/vendor/VendorHeader";
import MetricsRow from "@/components/dashboard/vendor/MetricsRow";
import MetricsChart from "@/components/dashboard/vendor/MetricsChart";
import RecentVisitors from "@/components/dashboard/vendor/RecentVisitors";
import VendorFilters from "@/components/dashboard/vendor/VendorFilters";
import ManageListings from "@/components/dashboard/vendor/ManageListings";
import CouponForm from "@/components/dashboard/vendor/CouponForm";
import CouponList from "@/components/dashboard/vendor/CouponList";
import ShareCouponDialog from "@/components/dashboard/vendor/ShareCouponDialog";
import { useVendorShareLimits } from "@/hooks/useVendorShareLimits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VendorDashboard = () => {
  const { user, roles, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const { status: vendorStatus, isLoading: checkingStatus } = useVendorAccess();
  
  // All state hooks MUST be declared before any conditional returns
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [refreshCoupons, setRefreshCoupons] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedShopper, setSelectedShopper] = useState<{ id: string; name: string } | null>(null);
  
  // All profile and data state declarations
  const [vendorName, setVendorName] = useState("");
  const [vendorImage, setVendorImage] = useState("");
  const [location, setLocation] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [vendorDescription, setVendorDescription] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [mainCategories, setMainCategories] = useState<string[]>([]);
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    clicks: 0,
    sales: 0,
    activeOffers: 0,
    followers: 0,
  });

  // Recent visitors state
  const [recentVisitors, setRecentVisitors] = useState<Array<{
    id: string;
    name: string;
    image: string;
    lastVisit: string;
    itemsViewed: number;
  }>>([]);

  // Listings state
  const [listings, setListings] = useState<Array<{
    id: string;
    title: string;
    type: "product" | "service" | "experience";
    categories?: string[];
    price: string;
    inventory: string;
    activeOffer: boolean;
    offerDetails?: string;
    couponClaims?: number;
    status: "active" | "paused";
  }>>([]);
  
  const { sharesRemaining, maxShares } = useVendorShareLimits();

  // Detect URL tab parameter and switch to it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['overview', 'listings', 'coupons', 'hifives'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  useEffect(() => {
    const loadVendorProfile = async () => {
      if (!user) return;

      const { data: vendorProfile } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, profile_picture_url")
        .eq("id", user.id)
        .maybeSingle();

      if (vendorProfile) {
        setVendorName(vendorProfile.business_name || profile?.display_name || "Vendor");
        setLocation(`${vendorProfile.city}, ${vendorProfile.state_region}`);
        setExternalUrl(vendorProfile.website || "");
        setVendorDescription(vendorProfile.business_description || "");
        setSubcategories(vendorProfile.area_of_expertise || []);
        setMainCategories(vendorProfile.products_services || []);
      }

      if (profile) {
        setVendorImage(profile.profile_picture_url || profile.avatar_url || "");
      }
    };

    loadVendorProfile();
  }, [user]);
  
  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Set active role to vendor when on this page
  useEffect(() => {
    if (roles.includes("vendor") && activeRole !== "vendor") {
      setActiveRole("vendor");
    }
  }, [roles, activeRole, setActiveRole]);

  // Load metrics data
  useEffect(() => {
    const loadMetrics = async () => {
      if (!user) return;

      const { data: vendorProfile } = await supabase
        .from("vendor_profiles")
        .select("profile_views, clicks_to_website")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: coupons } = await supabase
        .from("coupons")
        .select("id")
        .eq("vendor_id", user.id)
        .eq("active_status", true);

      const { data: followers } = await supabase
        .from("followers")
        .select("id")
        .eq("vendor_id", user.id);

      setMetrics({
        clicks: vendorProfile?.clicks_to_website || 0,
        sales: 0,
        activeOffers: coupons?.length || 0,
        followers: followers?.length || 0,
      });
    };

    loadMetrics();
  }, [user]);

  // Load followers/recent visitors
  useEffect(() => {
    const loadFollowers = async () => {
      if (!user) return;

      const { data: followers } = await supabase
        .from("followers")
        .select(`
          shopper_id,
          created_at,
          profiles!followers_shopper_id_fkey(display_name, avatar_url, profile_picture_url)
        `)
        .eq("vendor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (followers) {
        setRecentVisitors(
          followers.map((f: any) => ({
            id: f.shopper_id,
            name: f.profiles?.display_name || "Shopper",
            image: f.profiles?.profile_picture_url || f.profiles?.avatar_url || "",
            lastVisit: new Date(f.created_at).toLocaleDateString(),
            itemsViewed: 0,
          }))
        );
      }
    };

    loadFollowers();
  }, [user]);

  // Load listings
  const [listingsRefreshTrigger, setListingsRefreshTrigger] = useState(0);
  
  useEffect(() => {
    const loadListings = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("vendor_id", user.id);

      if (data) {
        // For each listing, check if it has an active coupon
        const listingsWithCoupons = await Promise.all(
          data.map(async (listing) => {
            // Query for active coupons linked to this listing
            const { data: couponData } = await supabase
              .from("coupons")
              .select("id, code, discount_type, discount_value, used_count")
              .eq("listing_id", listing.id)
              .eq("active_status", true)
              .gte("end_date", new Date().toISOString())
              .limit(1);

            const activeCoupon = couponData?.[0];
            
            return {
              id: listing.id,
              title: listing.title,
              type: (listing.listing_type === "experience" ? "experience" : listing.listing_type) as "product" | "service" | "experience",
              categories: listing.categories || [],
              price: listing.price ? `$${Number(listing.price).toFixed(2)}` : "Free",
              inventory: "Available",
              activeOffer: !!activeCoupon,
              offerDetails: activeCoupon 
                ? `${activeCoupon.code} - ${activeCoupon.discount_value}${activeCoupon.discount_type === 'percentage' ? '%' : '$'} off`
                : undefined,
              couponClaims: activeCoupon?.used_count || undefined,
              status: (listing.status === "active" ? "active" : "paused") as "active" | "paused",
            };
          })
        );

        setListings(listingsWithCoupons);
      }
    };

    loadListings();
  }, [user, listingsRefreshTrigger]);

  // Refresh listings when tab regains focus
  useEffect(() => {
    const handleFocus = () => {
      setListingsRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Check vendor access status
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show pending approval page if application is pending
  if (vendorStatus === "pending") {
    return <VendorPendingApproval />;
  }

  // Show rejection page if application was rejected
  if (vendorStatus === "rejected") {
    return <VendorApplicationRejected />;
  }

  if (vendorStatus === "no-application") {
    navigate("/signup/vendor");
    return null;
  }

  const handleMetricClick = (metric: string) => {
    setSelectedMetric(metric);
  };

  const handleSendOffer = (visitorId: string) => {
    const visitor = recentVisitors.find((v) => v.id === visitorId);
    if (visitor) {
      setSelectedShopper({ id: visitorId, name: visitor.name });
      setShareDialogOpen(true);
    }
  };

  const handleUploadImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !user) return;

      try {
        const { uploadFile, getUserPath } = await import("@/lib/storage");
        const path = getUserPath(user.id, file.name);
        const { url } = await uploadFile({
          bucket: "profile-pictures",
          file,
          path,
        });

        const { error } = await supabase
          .from("profiles")
          .update({ avatar_url: url })
          .eq("id", user.id);

        if (error) throw error;

        toast.success("Vendor image updated!");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload vendor image");
      }
    };

    input.click();
  };

  const handleUpdateLocation = (newLocation: string) => {
    toast.info("Location changes require TGT approval");
  };

  const handleUpdateExternalUrl = (url: string) => {
    toast.info("URL changes require TGT approval");
  };

  const handleUpdateDescription = (desc: string) => {
    setVendorDescription(desc);
    toast.success("Description updated!");
  };

  const handleEditSubcategories = (newSubcategories: string[]) => {
    setSubcategories(newSubcategories);
  };

  const handleAddListing = () => {
    navigate("/vendor/listing/new");
  };

  const handleEditListing = (id: string) => {
    navigate(`/vendor/listing/edit/${id}`);
  };

  const handleDeleteListing = async (id: string) => {
    if (!user) return;
    
    try {
      // First, delete any associated coupons
      await supabase
        .from("coupons")
        .delete()
        .eq("listing_id", id);
      
      // Then delete the listing
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", id)
        .eq("vendor_id", user.id);
      
      if (error) throw error;
      
      toast.success("Listing deleted successfully");
      setListingsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    }
  };

  const handleToggleListingStatus = async (id: string, currentStatus: string) => {
    if (!user) return;
    
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      
      const { error } = await supabase
        .from("listings")
        .update({ status: newStatus })
        .eq("id", id)
        .eq("vendor_id", user.id);
      
      if (error) throw error;
      
      toast.success(`Listing ${newStatus === "active" ? "activated" : "paused"}`);
      setListingsRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error updating listing status:", error);
      toast.error("Failed to update listing status");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <OnboardingTutorial />

      <main className="pt-16 sm:pt-20 pb-12">
        <VendorHeader
          vendorName={vendorName}
          vendorImage={vendorImage}
          location={location}
          externalUrl={externalUrl}
          description={vendorDescription}
          vendorUserId={user?.id || ""}
          onUploadImage={handleUploadImage}
          onUpdateLocation={handleUpdateLocation}
          onUpdateExternalUrl={handleUpdateExternalUrl}
          onUpdateDescription={handleUpdateDescription}
        />

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="gap-2" data-tour="vendor-dashboard">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="listings" className="gap-2" data-tour="vendor-listings">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Listings</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="gap-2" data-tour="vendor-offers">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Active Offers</span>
                {metrics.activeOffers === 0 && (
                  <Badge variant="destructive" className="ml-1">!</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="hifives" className="gap-2" data-tour="vendor-hi-fives">
                <Hand className="h-4 w-4" />
                <span className="hidden sm:inline">Your Hi Fives</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* No Active Coupons Alert */}
              {metrics.activeOffers === 0 && (
                <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                  <AlertTitle className="text-yellow-800 dark:text-yellow-300">No Active Coupons</AlertTitle>
                  <AlertDescription className="text-yellow-700 dark:text-yellow-400 flex items-center justify-between">
                    <span>
                      Create coupon codes to attract more shoppers and boost your sales! 
                      Coupons help your listings stand out with the red sale dot.
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="ml-4 shrink-0 border-yellow-300 hover:bg-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-900/30"
                      onClick={() => setShowCouponDialog(true)}
                    >
                      Create Coupon
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Metrics */}
              <MetricsRow
                clicks={metrics.clicks}
                sales={metrics.sales}
                activeOffers={metrics.activeOffers}
                followers={metrics.followers}
                onMetricClick={handleMetricClick}
                data-tour="vendor-metrics"
              />

              {/* Filters */}
              <VendorFilters
                mainCategories={mainCategories}
                subcategories={subcategories}
                onEditSubcategories={handleEditSubcategories}
              />
            </TabsContent>

            {/* Listings Tab */}
            <TabsContent value="listings" className="space-y-6">
              <ManageListings
                listings={listings}
                onAddListing={handleAddListing}
                onEditListing={handleEditListing}
                onDeleteListing={handleDeleteListing}
                onToggleStatus={handleToggleListingStatus}
              />
            </TabsContent>

            {/* Active Offers Tab */}
            <TabsContent value="coupons" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Active Coupons</CardTitle>
                      <CardDescription>Manage your coupon codes and promotional offers</CardDescription>
                    </div>
                    <Button onClick={() => setShowCouponDialog(true)} className="gap-2">
                      <Tag className="h-4 w-4" />
                      New Coupon
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CouponList 
                    refresh={refreshCoupons}
                    onRefreshComplete={() => setRefreshCoupons(false)}
                    onCreateClick={() => setShowCouponDialog(true)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Your Hi Fives Tab */}
            <TabsContent value="hifives" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Your Hi Fives</CardTitle>
                      <CardDescription>Shoppers who saved you to their favorites</CardDescription>
                    </div>
                    <Badge variant="secondary">{sharesRemaining}/{maxShares} offers remaining this month</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentVisitors.map((visitor) => (
                      <div key={visitor.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <img 
                            src={visitor.image} 
                            alt={visitor.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{visitor.name}</p>
                            <p className="text-xs text-muted-foreground">Saved {visitor.lastVisit}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendOffer(visitor.id)}
                        >
                          Send Offer
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Metrics Chart Overlay */}
      {selectedMetric && (
        <MetricsChart metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
      )}

      {/* Create Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Coupon Code</DialogTitle>
            <DialogDescription>
              Create a new coupon code for your customers
            </DialogDescription>
          </DialogHeader>
          <CouponForm 
            onSuccess={() => {
              setShowCouponDialog(false);
              setRefreshCoupons(true);
            }}
            onCancel={() => setShowCouponDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Share Coupon Dialog */}
      {selectedShopper && (
        <ShareCouponDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          shopperId={selectedShopper.id}
          shopperName={selectedShopper.name}
        />
      )}

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>
  );
};

export default VendorDashboard;
