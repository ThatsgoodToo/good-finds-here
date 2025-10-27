import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import SignupModal from "@/components/SignupModal";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Users, BarChart3, Tag, Hand } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
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
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [refreshCoupons, setRefreshCoupons] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedShopper, setSelectedShopper] = useState<{ id: string; name: string } | null>(null);
  
  const { sharesRemaining, maxShares } = useVendorShareLimits();
  const [vendorDescription, setVendorDescription] = useState(
    "Handcrafted ceramics and pottery made with sustainable practices. Family-owned business since 2015."
  );

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

  // Demo vendor data
  const vendorName = "Clay & Co.";
  const vendorImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200";
  const location = "Boise, Idaho";
  const externalUrl = "https://clayandco.example.com";

  // Metrics
  const metrics = {
    clicks: 1247,
    sales: 89,
    activeOffers: 12,
    followers: 456,
  };

  // Recent visitors
  const recentVisitors = [
    {
      id: "1",
      name: "Sarah Martinez",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      lastVisit: "2 hours ago",
      itemsViewed: 5,
    },
    {
      id: "2",
      name: "Michael Chen",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      lastVisit: "5 hours ago",
      itemsViewed: 3,
    },
    {
      id: "3",
      name: "Emma Wilson",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      lastVisit: "1 day ago",
      itemsViewed: 8,
    },
  ];

  // Listings
  const listings = [
    {
      id: "1",
      title: "Handcrafted Bowl Set",
      type: "product" as const,
      price: "$89.99",
      inventory: "12 available",
      activeOffer: true,
      offerDetails: "15% off",
      couponClaims: 23,
      status: "active" as const,
    },
    {
      id: "2",
      title: "Pottery Workshop",
      type: "service" as const,
      price: "$125/session",
      inventory: "5 spots/week",
      activeOffer: true,
      offerDetails: "First session 20% off",
      couponClaims: 8,
      status: "active" as const,
    },
    {
      id: "3",
      title: "Custom Vase",
      type: "product" as const,
      price: "$145.00",
      inventory: "Made to order",
      activeOffer: false,
      status: "warning" as const,
    },
    {
      id: "4",
      title: "Behind the Scenes Video",
      type: "content" as const,
      price: "Free",
      inventory: "Unlimited",
      activeOffer: false,
      status: "active" as const,
    },
  ];

  const mainCategories = ["Handcrafted", "Home Goods", "Art"];
  const [subcategories, setSubcategories] = useState(["Ceramics", "Pottery", "Sustainable", "Local", "Eco-friendly"]);

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

  const handleUploadImage = () => {
    toast.info("Image upload feature coming soon");
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
              </TabsTrigger>
              <TabsTrigger value="hifives" className="gap-2" data-tour="vendor-hi-fives">
                <Hand className="h-4 w-4" />
                <span className="hidden sm:inline">Your Hi Fives</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
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
