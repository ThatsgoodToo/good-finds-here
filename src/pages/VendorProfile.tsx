import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SignupModal from "@/components/SignupModal";
import { CategoryType } from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ExternalLink, 
  CheckCircle, 
  DollarSign, 
  Package, 
  Truck, 
  Hand,
  ChevronLeft,
  ChevronRight,
  Ticket,
  MapPin,
  ArrowLeft,
  Sparkles,
  Leaf
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import LocationLink from "@/components/LocationLink";

const VendorProfile = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const { user } = useAuth();
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Load vendor data from database
  const [vendor, setVendor] = useState({
    name: "",
    verified: false,
    website: "",
    bio: "",
    profileImage: "",
    location: "",
    priceRange: "",
    category: "",
    expertise: "",
    shipping: [] as string[],
    ownership: "",
    sustainable: [] as string[],
    activeOffers: 0,
    highFives: 0,
  });

  const [listings, setListings] = useState({
    images: [] as Array<{
      id: string;
      url: string;
      title: string;
      type: CategoryType;
      types: CategoryType[];
      hasOffer: boolean;
    }>,
    videos: [] as any[],
    audio: [] as any[],
  });

  const [offers, setOffers] = useState<Array<{
    id: string;
    title: string;
    type: string;
    thumbnail: string;
  }>>([]);

  const [relatedVendors, setRelatedVendors] = useState<Array<{
    id: string;
    name: string;
    category: string;
    type: CategoryType;
    image: string;
  }>>([]);

  useEffect(() => {
    const loadVendorProfile = async () => {
      if (!vendorId) return;

      // Find vendor profile by ID or slug
      const { data: vendorProfiles } = await supabase
        .from("vendor_profiles")
        .select("*");

      const matchedVendor = vendorProfiles?.find((v: any) => {
        const slugify = (s: string) => s?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return v.id === vendorId || v.user_id === vendorId || slugify(v.business_type) === vendorId.toLowerCase();
      });

      if (matchedVendor) {
        // Check if this is the user's own profile
        setIsOwnProfile(user?.id === matchedVendor.user_id);
        // Get profile separately
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url, profile_picture_url, bio")
          .eq("id", matchedVendor.user_id)
          .maybeSingle();

        setVendor({
          name: matchedVendor.business_name || profile?.display_name || "Vendor",
          verified: matchedVendor.status === "active",
          website: matchedVendor.website || "",
          bio: matchedVendor.business_description || profile?.bio || "",
          profileImage: profile?.profile_picture_url || profile?.avatar_url || "",
          location: `${matchedVendor.city}, ${matchedVendor.state_region}`,
          priceRange: matchedVendor.pricing_style || "",
          category: matchedVendor.business_type || "",
          expertise: matchedVendor.business_duration || "",
          shipping: matchedVendor.shipping_options || [],
          ownership: "",
          sustainable: matchedVendor.sustainable_methods || [],
          activeOffers: 0,
          highFives: 0,
        });

        // Load listings
        const { data: listingsData } = await supabase
          .from("listings")
          .select("*")
          .eq("vendor_id", matchedVendor.user_id)
          .eq("status", "active");

        if (listingsData) {
          setListings({
            images: listingsData.map((listing: any) => ({
              id: listing.id,
              url: listing.image_url || "",
              title: listing.title,
              type: listing.listing_type as CategoryType,
              types: [listing.listing_type] as CategoryType[],
              hasOffer: false,
            })),
            videos: [],
            audio: [],
          });
        }

        // Load active offers
        const { data: couponsData } = await supabase
          .from("coupons")
          .select("*")
          .eq("vendor_id", matchedVendor.user_id)
          .eq("active_status", true);

        if (couponsData) {
          setOffers(
            couponsData.map((coupon: any) => ({
              id: coupon.id,
              title: `${coupon.discount_value}${coupon.discount_type === 'percentage' ? '%' : ''} off`,
              type: "product",
              thumbnail: "",
            }))
          );
        }
      }
    };

    loadVendorProfile();
  }, [vendorId, user]);

  const folders = [
    { id: "1", name: "Travel" },
    { id: "2", name: "Kid Snacks" },
    { id: "3", name: "Favorites" },
  ];

  const getCategoryColor = (type: string): string => {
    const colors: Record<string, string> = {
      sale: "bg-category-sale",
      experience: "bg-category-experience",
      product: "bg-category-product",
      service: "bg-category-service",
    };
    return colors[type.toLowerCase()] || "bg-category-product";
  };

  const handleHighFive = () => {
    setShowFolderDialog(true);
  };

  const handleClaimCoupon = (offer: any) => {
    setSelectedOffer(offer);
    setShowCouponDialog(true);
  };

  const handleConfirmClaim = () => {
    // Track coupon claim
    console.log("Coupon claimed:", selectedOffer);
    // Redirect to vendor website/checkout
    if (vendor.website) {
      window.open(vendor.website, "_blank");
    }
    setShowCouponDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Back to Dashboard Button */}
        {isOwnProfile && (
          <div className="border-b border-border bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/vendor")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Top Section - Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                <AvatarImage src={vendor.profileImage} alt={vendor.name} />
                <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{vendor.name}</h1>
                  {vendor.verified && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      TGT Verified
                    </Badge>
                  )}
                </div>
                
                {vendor.website && (
                  <Button
                    variant="link"
                    className="text-primary gap-1"
                    onClick={() => window.open(vendor.website, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </Button>
                )}
              </div>
              
              <p className="text-muted-foreground max-w-2xl">
                {vendor.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Media Grid */}
            <div className="lg:col-span-2 space-y-4">
              <Tabs defaultValue="images" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="images">
                    Images ({listings.images.length})
                  </TabsTrigger>
                  <TabsTrigger value="videos">
                    Videos ({listings.videos.length})
                  </TabsTrigger>
                  <TabsTrigger value="audio">
                    Audio ({listings.audio.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="images" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {listings.images.map((listing) => (
                      <div
                        key={listing.id}
                        className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square"
                      >
                        <img
                          src={listing.url}
                          alt={listing.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        
                        {/* Top-left type indicator */}
                        <div className="absolute top-2 left-2 flex gap-1.5 z-10">
                          {listing.types?.map((type: string) => (
                            <div
                              key={type}
                              className={cn("w-3 h-3 rounded-full ring-1 ring-border", getCategoryColor(type))}
                            />
                          ))}
                        </div>
                        
                        {/* High-Five Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedListing(listing.id);
                            setShowFolderDialog(true);
                          }}
                          className="absolute top-2 right-2 z-10 bg-background/90 hover:bg-background text-foreground shadow-md"
                        >
                          <Hand className="h-5 w-5" />
                        </Button>
                        
                        {/* Exclusive offer badge */}
                        {listing.hasOffer && (
                          <Badge className="absolute top-12 right-2 bg-red-500">
                            Exclusive Offer
                          </Badge>
                        )}
                        
                        {/* Title overlay - always visible on all screen sizes */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-sm font-medium text-white">{listing.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="mt-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No videos available</p>
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="mt-4">
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No audio available</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Side - Profile Details */}
            <div className="space-y-4">
              {/* High Fives */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hand className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">High Fives</h3>
                        <p className="text-sm text-muted-foreground">{vendor.highFives.toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleHighFive}
                      className="text-sm text-primary hover:underline"
                    >
                      add
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Location</h3>
                      <LocationLink 
                        location={vendor.location}
                        showIcon={false}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Price Range</h3>
                      <p className="text-sm text-muted-foreground">{vendor.priceRange}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ownership & Expertise */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-1">Ownership</h3>
                      <p className="text-sm text-muted-foreground">{vendor.category}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Expertise</h3>
                      <p className="text-sm text-muted-foreground">{vendor.expertise}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Shipping</h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.shipping.map((option, index) => (
                          <Badge key={index} variant="secondary">{option}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Creative Style */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Creative Style</h3>
                      <p className="text-sm text-muted-foreground">{vendor.ownership}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sustainable Practices */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Leaf className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Sustainable Practices</h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.sustainable.map((practice, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {practice}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Offers */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">Active Offers ({vendor.activeOffers})</h3>
                      <div className="space-y-2">
                        {offers.map((offer) => (
                          <div key={offer.id} className="flex items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className={cn("h-2 w-2 rounded-full ring-1 ring-border shrink-0", getCategoryColor(offer.type))} />
                              <span className="text-muted-foreground truncate">{offer.title}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="shrink-0 gap-1"
                              onClick={() => handleClaimCoupon(offer)}
                            >
                              <Ticket className="h-3 w-3" />
                              Claim
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Related Vendors Carousel */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Vendors</h2>
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {relatedVendors.map((relatedVendor) => (
                  <Card
                    key={relatedVendor.id}
                    className="shrink-0 w-64 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/vendor/${relatedVendor.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 relative">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={relatedVendor.image} alt={relatedVendor.name} />
                          <AvatarFallback>{relatedVendor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {/* Category dot - absolute positioned in upper-left */}
                        <div className={cn("absolute top-2 left-2 h-2 w-2 rounded-full ring-1 ring-border", getCategoryColor(relatedVendor.type))} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{relatedVendor.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{relatedVendor.category}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SearchBar
          onSearch={() => {}}
          isCentered={false}
          onWhatsgoodClick={() => navigate("/")}
        />
      </main>

      {/* Folder Selection Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Folder</DialogTitle>
            <DialogDescription>
              Choose a folder to save this item or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  toast.success(`Added to ${folder.name}!`);
                  setShowFolderDialog(false);
                }}
              >
                {folder.name}
              </Button>
            ))}
            {newFolderName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground"
                />
                <Button onClick={() => {
                  toast.success(`Folder "${newFolderName}" created!`);
                  setShowFolderDialog(false);
                  setNewFolderName("");
                }}>
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="default" className="w-full" onClick={() => setNewFolderName("New Folder")}>
                + Create New Folder
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Coupon Claim Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Exclusive Offer</DialogTitle>
            <DialogDescription>
              You're about to claim: {selectedOffer?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will redirect you to {vendor.name}'s website where you can use this exclusive offer.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCouponDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-2" onClick={handleConfirmClaim}>
                <Ticket className="h-4 w-4" />
                Claim & Visit Site
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>
  );
};

export default VendorProfile;
