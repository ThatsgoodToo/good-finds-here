import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [vendorDescription, setVendorDescription] = useState(
    "Handcrafted ceramics and pottery made with sustainable practices. Family-owned business since 2015."
  );

  // Demo vendor data
  const vendorName = "Clay & Co.";
  const vendorImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200";
  const location = "Portland, Oregon";
  const externalUrl = "https://clayandco.example.com";
  const hasShopperRole = true; // Demo: user has both roles

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
  const subcategories = ["Ceramics", "Pottery", "Sustainable", "Local", "Eco-friendly"];

  const handleMetricClick = (metric: string) => {
    setSelectedMetric(metric);
  };

  const handleSendOffer = (visitorId: string) => {
    const visitor = recentVisitors.find((v) => v.id === visitorId);
    toast.success(`Offer sent to ${visitor?.name}!`);
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

  const handleEditSubcategories = () => {
    toast.info("Edit subcategories dialog");
  };

  const handleAddListing = () => {
    navigate("/vendor/listing/new");
  };

  const handleEditListing = (id: string) => {
    toast.info(`Edit listing ${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
          hasShopperRole={hasShopperRole}
          userRole={userRole as string}
        />

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="listings" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Listings</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Active Offers</span>
              </TabsTrigger>
              <TabsTrigger value="hifives" className="gap-2">
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
                      <CardTitle>Active Offers</CardTitle>
                      <CardDescription>Manage your active coupon offers across all listings</CardDescription>
                    </div>
                    <Button onClick={() => setShowCouponDialog(true)} className="gap-2">
                      <Tag className="h-4 w-4" />
                      New Offer
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {listings.filter(l => l.activeOffer).length === 0 ? (
                    <div className="text-center py-12">
                      <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <h3 className="text-lg font-semibold mb-2">No Active Offers</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first offer to attract more customers
                      </p>
                      <Button onClick={() => setShowCouponDialog(true)}>Create Offer</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listings.filter(l => l.activeOffer).map((listing) => (
                        <div key={listing.id} className="flex gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="w-20 h-20 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                            <img 
                              src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200" 
                              alt={listing.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{listing.title}</h4>
                                <p className="text-sm text-muted-foreground">{listing.offerDetails}</p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="secondary">{listing.couponClaims} claims</Badge>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    listing.type === "product" 
                                      ? "border-category-product text-category-product" 
                                      : "border-category-service text-category-service"
                                  }
                                >
                                  {listing.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-muted-foreground">{listing.price}</p>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">Edit</Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Deactivate</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                    <Badge variant="secondary">20 offers remaining this month</Badge>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>Set up a new coupon code for your listings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coupon-code">Coupon Code</Label>
              <Input id="coupon-code" placeholder="e.g., SAVE20" />
            </div>
            <div>
              <Label htmlFor="discount">Discount</Label>
              <Select>
                <SelectTrigger id="discount">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage Off</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="shipping">Free Shipping</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input id="value" placeholder="e.g., 15" type="number" />
            </div>
            <div>
              <Label htmlFor="claim-limit">Claim Limit (Optional)</Label>
              <Input id="claim-limit" placeholder="Max number of claims" type="number" />
            </div>
            <div>
              <Label htmlFor="expiration">Expiration Date</Label>
              <Input id="expiration" type="date" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCouponDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Coupon created!");
                  setShowCouponDialog(false);
                }}
              >
                Create Coupon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorDashboard;
