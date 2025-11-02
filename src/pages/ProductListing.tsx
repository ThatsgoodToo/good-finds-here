import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SignupModal from "@/components/SignupModal";
import ProductCard from "@/components/ProductCard";
import { mapCategoriesToTypes } from "@/lib/categoryMapping";
import type { CategoryType } from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, CheckCircle, Hand, ChevronDown, Ticket, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import LocationLink from "@/components/LocationLink";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

type Listing = Database['public']['Tables']['listings']['Row'];
type Coupon = Database['public']['Tables']['coupons']['Row'];

interface VendorInfo {
  id: string;
  name: string;
  logo: string;
  website: string;
  location: string;
  verified: boolean;
  ownership: string;
  expertise: string;
  shipping: string[];
  clicks_to_website?: number;
}

const ProductListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);

  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [moreFromVendor, setMoreFromVendor] = useState<Listing[]>([]);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [highFivesCount, setHighFivesCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Helper functions for data fetching
  const fetchListingData = async (id: string) => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      toast.error("Listing not found");
      return null;
    }
    return data;
  };

  const fetchVendorData = async (vendorId: string, websiteUrl: string | null) => {
    const { data: vendorProfile } = await supabase
      .from("vendor_profiles")
      .select("*")
      .eq("user_id", vendorId)
      .maybeSingle();

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, profile_picture_url")
      .eq("id", vendorId)
      .maybeSingle();

    return {
      id: vendorId,
      name: vendorProfile?.business_name || profile?.display_name || "Vendor",
      logo: profile?.profile_picture_url || profile?.avatar_url || "",
      website: vendorProfile?.website || websiteUrl || "",
      location: vendorProfile ? `${vendorProfile.city}, ${vendorProfile.state_region}` : "",
      verified: vendorProfile?.status === "active",
      ownership: vendorProfile?.business_type || "",
      expertise: vendorProfile?.business_duration || "",
      shipping: vendorProfile?.shipping_options || [],
    };
  };

  const fetchActiveCoupon = async (id: string) => {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("listing_id", id)
      .eq("active_status", true)
      .gte("end_date", new Date().toISOString())
      .lte("start_date", new Date().toISOString())
      .limit(1);

    return data && data.length > 0 ? data[0] : null;
  };

  const fetchRelatedData = async (id: string, vendorId: string, categories: string[]) => {
    const { data: vendorListings } = await supabase
      .from("listings")
      .select("*")
      .eq("vendor_id", vendorId)
      .eq("status", "active")
      .neq("id", id)
      .limit(6);

    const { data: related } = await supabase
      .from("listings")
      .select("*, vendor:vendor_profiles!inner(business_name)")
      .eq("status", "active")
      .contains("categories", categories || [])
      .neq("id", id)
      .limit(8);

    const { count } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("item_id", id);

    return {
      vendorListings: vendorListings || [],
      relatedListings: related || [],
      highFivesCount: count || 0,
    };
  };

  useEffect(() => {
    const loadListingData = async () => {
      if (!listingId) return;

      try {
        setLoading(true);

        const listingData = await fetchListingData(listingId);
        if (!listingData) return;

        setListing(listingData);

        const vendorData = await fetchVendorData(listingData.vendor_id, listingData.website_url);
        setVendor(vendorData);

        const coupon = await fetchActiveCoupon(listingId);
        setActiveCoupon(coupon);

        const relatedData = await fetchRelatedData(
          listingId,
          listingData.vendor_id,
          listingData.categories || []
        );
        
        setMoreFromVendor(relatedData.vendorListings);
        setRelatedListings(relatedData.relatedListings);
        setHighFivesCount(relatedData.highFivesCount);

      } catch (error) {
        console.error("Error loading listing:", error);
        toast.error("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    loadListingData();
  }, [listingId]);

  const categoryColors: Record<string, string> = {
    product: "bg-category-product",
    service: "bg-category-service",
    material: "bg-category-material",
    music: "bg-category-music",
    video: "bg-category-video",
    food: "bg-category-food",
    wellness: "bg-category-wellness",
  };

  const folders = [
    { id: "1", name: "Travel" },
    { id: "2", name: "Favorites" },
    { id: "3", name: "Gift Ideas" },
  ];

  const activeOffer = {
    title: "15% off with code HERITAGE15",
    description: "Valid on all heritage collection items",
  };

  const handleClaimCoupon = () => {
    setShowCouponDialog(true);
  };

  const handleWebsiteClick = async () => {
    if (!vendor) return;
    
    try {
      // Insert click record
      await supabase.from("website_clicks").insert({
        vendor_id: vendor.id,
        listing_id: listingId || null,
      });

      // Increment counter
      await supabase
        .from("vendor_profiles")
        .update({ clicks_to_website: (vendor.clicks_to_website || 0) + 1 })
        .eq("id", vendor.id);

      // Open website
      window.open(vendor.website, "_blank");
    } catch (error) {
      console.error("Error tracking website click:", error);
      // Still open the website even if tracking fails
      window.open(vendor.website, "_blank");
    }
  };

  const handleConfirmClaim = async () => {
    if (!activeCoupon || !user) return;

    try {
      // Record coupon usage
      await supabase.from("coupon_usage").insert({
        coupon_id: activeCoupon.id,
        user_id: user.id,
        listing_id: listingId,
      });

      // Increment used_count
      const { data: coupon } = await supabase
        .from("coupons")
        .select("used_count")
        .eq("id", activeCoupon.id)
        .single();

      if (coupon) {
        await supabase
          .from("coupons")
          .update({ used_count: coupon.used_count + 1 })
          .eq("id", activeCoupon.id);
      }

      // Track website click
      if (vendor) {
        await supabase.from("website_clicks").insert({
          vendor_id: vendor.id,
          listing_id: listingId || null,
        });

        await supabase
          .from("vendor_profiles")
          .update({ clicks_to_website: (vendor.clicks_to_website || 0) + 1 })
          .eq("id", vendor.id);
      }

      toast.success(`Coupon code: ${activeCoupon.code}`);
      
      const targetUrl = listing?.source_url || listing?.listing_link || vendor?.website;
      if (targetUrl) {
        window.open(targetUrl, "_blank");
      }
    } catch (error) {
      console.error("Error claiming coupon:", error);
      toast.error("Failed to claim coupon");
    }
    
    setShowCouponDialog(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 sm:pt-20 pb-24">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!listing || !vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 sm:pt-20 pb-24">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <p className="text-center text-muted-foreground">Listing not found</p>
          </div>
        </main>
      </div>
    );
  }

  const listingImages = listing.image_url ? [listing.image_url] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Vendor Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Link to={`/vendor/${vendor.id}`}>
                <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={vendor.logo} alt={vendor.name} />
                  <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/vendor/${vendor.id}`)}
                    className="text-2xl font-bold hover:text-primary transition-colors"
                  >
                    {vendor.name}
                  </button>
                  {vendor.verified && (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      TGT Verified
                    </Badge>
                  )}
                </div>
                
                {vendor?.website && (
                  <Button
                    variant="link"
                    className="text-sm gap-1"
                    onClick={handleWebsiteClick}
                  >
                    <ExternalLink className="h-3 w-3" />
                    website
                  </Button>
                )}
                
                <LocationLink 
                  location={vendor.location}
                  iconSize="sm"
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left - Product Images */}
            <div className="space-y-4">
              {listingImages.length > 0 ? (
                <div className="flex gap-4">
                  {listingImages.length > 1 && (
                    <div className="flex flex-col gap-2 w-16">
                      {listingImages.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={cn(
                            "border-2 rounded-lg overflow-hidden transition-all",
                            selectedImage === index
                              ? "border-primary"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-16 object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex-1">
                    <img
                      src={listingImages[selectedImage]}
                      alt={listing.title}
                      className="w-full rounded-lg"
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-muted rounded-lg aspect-square flex items-center justify-center">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
            </div>

            {/* Right - Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-4">{listing.title}</h1>
                
                {/* Category Dots */}
                <div className="flex items-center gap-2 mb-4">
                  {listing.listing_types && listing.listing_types.length > 0 
                    ? mapCategoriesToTypes(listing.listing_types).map((type: CategoryType, index: number) => (
                        <div
                          key={`category-${index}`}
                          className={cn(
                            "w-3 h-3 rounded-full ring-1 ring-border",
                            type === "product" ? "bg-category-product" :
                            type === "service" ? "bg-category-service" :
                            type === "experience" ? "bg-category-experience" :
                            "bg-category-sale"
                          )}
                          title={type}
                        />
                      ))
                    : listing.listing_type && (
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full ring-1 ring-border",
                            listing.listing_type === "product" ? "bg-category-product" :
                            listing.listing_type === "service" ? "bg-category-service" :
                            listing.listing_type === "experience" ? "bg-category-experience" :
                            "bg-category-sale"
                          )}
                          title={listing.listing_type}
                        />
                      )
                  }
                  {activeCoupon && (
                    <div className="w-3 h-3 rounded-full ring-1 ring-border bg-category-sale" title="Active coupon" />
                  )}
                </div>

                {listing.price && (
                  <p className="text-xl font-semibold mb-4">${listing.price}</p>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowFolderDialog(true)}
                  >
                    <Hand className="h-4 w-4" />
                    {highFivesCount.toLocaleString()}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {listing.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{listing.description}</p>
                  </div>
                )}

                {vendor.ownership && (
                  <div>
                    <h3 className="font-semibold mb-1">Ownership</h3>
                    <p className="text-sm text-muted-foreground">{vendor.ownership}</p>
                  </div>
                )}

                {vendor.expertise && (
                  <div>
                    <h3 className="font-semibold mb-1">Expertise</h3>
                    <p className="text-sm text-muted-foreground">{vendor.expertise}</p>
                  </div>
                )}

                {vendor.shipping && vendor.shipping.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Options</h3>
                    <div className="flex flex-wrap gap-2">
                      {vendor.shipping.map((option: string, index: number) => (
                        <Badge key={index} variant="secondary">{option}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listing.tags && listing.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {activeCoupon && (
                  <div>
                    <h3 className="font-semibold mb-2">Active Offer</h3>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {activeCoupon.discount_value}{activeCoupon.discount_type === 'percentage' ? '%' : '$'} off
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Code: {activeCoupon.code}</p>
                          </div>
                          <Button size="sm" onClick={handleClaimCoupon} className="gap-2 shrink-0">
                            <Ticket className="h-4 w-4" />
                            Claim
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {listing.categories && listing.categories.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Categories</h3>
                    <p className="text-sm text-muted-foreground">{listing.categories.join(", ")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* More from Vendor */}
          {moreFromVendor.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">More from {vendor.name}</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {moreFromVendor.map((item) => (
                  <div key={item.id} className="shrink-0 w-64">
                    <ProductCard
                      id={item.id}
                      title={item.title}
                      price={item.price ? `$${item.price}` : "Free"}
                      image={item.image_url || "/placeholder.svg"}
                      categories={mapCategoriesToTypes(item.categories)}
                      vendor={vendor?.name || ""}
                      vendorId={item.vendor_id}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Listings */}
          {relatedListings.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Related Listings</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedListings.map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price ? `$${item.price}` : "Free"}
                    image={item.image_url || "/placeholder.svg"}
                    categories={mapCategoriesToTypes(item.categories)}
                    vendor={vendor?.name || ""}
                    vendorId={item.vendor_id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <SearchBar
          onSearch={() => {}}
          isCentered={false}
          onWhatsgoodClick={() => navigate("/")}
        />
      </main>

      {/* Folder Dialog */}
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
                onClick={() => setShowFolderDialog(false)}
              >
                {folder.name}
              </Button>
            ))}
            {newFolderName ? (
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
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
              Use code <span className="font-mono font-semibold text-foreground">{activeCoupon?.code}</span> for{" "}
              {activeCoupon?.discount_value}{activeCoupon?.discount_type === 'percentage' ? '%' : '$'} off
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Your coupon code:</p>
              <p className="text-lg font-mono font-bold">{activeCoupon?.code}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Click below to visit {vendor?.name}'s website and apply this code at checkout.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCouponDialog(false)}>
                Cancel
              </Button>
              <Button className="flex-1 gap-2" onClick={handleConfirmClaim}>
                <ExternalLink className="h-4 w-4" />
                Visit Site
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>
  );
};

export default ProductListing;
