import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SignupModal from "@/components/SignupModal";
import ProductCard from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Hand, ChevronLeft, ChevronRight, Ticket, ArrowLeft, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import LocationLink from "@/components/LocationLink";
import { supabase } from "@/integrations/supabase/client";
import { mapCategoriesToTypes } from "@/lib/categoryMapping";
import type { CategoryType } from "@/components/ProductCard";

// Video URL parsing utilities
const getVideoEmbedUrl = (url: string | null): string | null => {
  if (!url) return null;

  // YouTube Shorts pattern
  const shortsRegex = /(?:youtube\.com\/shorts\/)([^"&?/\s]{11})/i;
  const shortsMatch = url.match(shortsRegex);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // YouTube standard patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/i;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;
};

const VideoListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { user } = useAuth();
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [loading, setLoading] = useState(true);

  const [listing, setListing] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [activeCoupon, setActiveCoupon] = useState<any>(null);
  const [moreFromVendor, setMoreFromVendor] = useState<any[]>([]);
  const [relatedListings, setRelatedListings] = useState<any[]>([]);
  const [highFivesCount, setHighFivesCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      if (!listingId) return;
      setLoading(true);

      // Load listing with all fields including categories
      const { data: listingData } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .maybeSingle();

      if (listingData) {
        setListing(listingData);

        // Load vendor profile
        const { data: vendorProfile } = await supabase
          .from("vendor_profiles")
          .select("*")
          .eq("user_id", listingData.vendor_id)
          .maybeSingle();

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", listingData.vendor_id)
          .maybeSingle();

        if (vendorProfile || profile) {
          setVendor({
            id: listingData.vendor_id,
            name: vendorProfile?.business_name || profile?.display_name || "Vendor",
            business_name: vendorProfile?.business_name || profile?.display_name || "Vendor",
            logo: profile?.avatar_url || "",
            website: vendorProfile?.website || listingData.website_url || "",
            location: vendorProfile ? `${vendorProfile.city}, ${vendorProfile.state_region}` : listingData.location || "",
            verified: vendorProfile?.status === "active",
            shipping_options: vendorProfile?.shipping_options || [],
          });
        }

        // Load active coupon
        const { data: couponData } = await supabase
          .from("coupons")
          .select("*")
          .eq("listing_id", listingId)
          .eq("active_status", true)
          .gte("end_date", new Date().toISOString())
          .lte("start_date", new Date().toISOString())
          .maybeSingle();

        setActiveCoupon(couponData);

        // Load more from vendor
        const { data: moreListings } = await supabase
          .from("listings")
          .select("*")
          .eq("vendor_id", listingData.vendor_id)
          .eq("status", "active")
          .neq("id", listingId)
          .limit(3);

        setMoreFromVendor(moreListings || []);

        // Load related listings based on categories
        if (listingData.categories && listingData.categories.length > 0) {
          const { data: related } = await supabase
            .from("listings")
            .select("*")
            .neq("id", listingId)
            .eq("status", "active")
            .overlaps("categories", listingData.categories)
            .limit(6);

          setRelatedListings(related || []);
        }

        // Load high fives count
        const { count } = await supabase
          .from("favorites")
          .select("*", { count: "exact", head: true })
          .eq("item_id", listingId);

        setHighFivesCount(count || 0);
      }

      setLoading(false);
    };

    loadData();
  }, [listingId]);

  const images = listing?.image_url ? [listing.image_url] : [];

  const folders = [
    { id: "1", name: "Videos" },
    { id: "2", name: "Inspiration" },
    { id: "3", name: "Favorites" },
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleClaimCoupon = () => {
    setShowCouponDialog(true);
  };

  const handleConfirmClaim = async () => {
    if (!activeCoupon || !user) return;

    try {
      await supabase.from("coupon_usage").insert({
        coupon_id: activeCoupon.id,
        user_id: user.id,
        listing_id: listingId,
      });

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Video not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Vendor Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col items-center text-center gap-4">
              <Link to={`/vendor/${vendor?.id}`}>
                <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={vendor?.logo} alt={vendor?.name} />
                  <AvatarFallback>{vendor?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => navigate(`/vendor/${vendor?.id}`)}
                  className="text-2xl font-bold hover:text-primary transition-colors"
                >
                  {vendor?.name}
                </button>
                {vendor?.verified && (
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    TGT Verified
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                {vendor?.location && (
                  <LocationLink 
                    location={vendor.location}
                    iconSize="sm"
                    className="text-sm"
                  />
                )}
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
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          {/* Video Player */}
          {(() => {
            const videoUrl = getVideoEmbedUrl(listing.source_url || listing.listing_link);
            
            if (videoUrl) {
              return (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-8">
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={listing.title}
                  />
                </div>
              );
            }
            
            // Fallback to image carousel if no video URL
            if (images.length > 0) {
              return (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-8">
                  <img
                    src={images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </>
                  )}
                </div>
              );
            }
            
            return null;
          })()}

          {/* Video Details */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl font-bold">{listing.title}</h1>
              
              {/* Category Dots */}
              <div className="flex items-center gap-2">
                {listing.categories && mapCategoriesToTypes(listing.categories).map((type: CategoryType, index: number) => (
                  <div
                    key={`category-${index}`}
                    className={`w-3 h-3 rounded-full ring-1 ring-border ${
                      type === "product" ? "bg-category-product" :
                      type === "service" ? "bg-category-service" :
                      type === "experience" ? "bg-category-experience" :
                      "bg-category-sale"
                    }`}
                  />
                ))}
                {activeCoupon && (
                  <div className="w-3 h-3 rounded-full ring-1 ring-border bg-category-sale" />
                )}
              </div>

              {/* Price */}
              {listing.price && (
                <p className="text-xl font-semibold">${listing.price}</p>
              )}

              {/* High Fives */}
              <Button
                variant="outline"
                size="sm"
                className="gap-2 w-full sm:w-auto"
                onClick={() => setShowFolderDialog(true)}
              >
                <Hand className="h-4 w-4" />
                High Five ({highFivesCount.toLocaleString()})
              </Button>
            </div>

            <div className="space-y-4">
              {listing.description && (
                <div>
                  <h3 className="font-semibold mb-2">description</h3>
                  <p className="text-sm text-muted-foreground">{listing.description}</p>
                </div>
              )}

              {/* Visit Website Button */}
              {vendor?.website && (
                <div>
                  <Button
                    className="w-full sm:w-auto gap-2"
                    onClick={async () => {
                      if (!vendor) return;
                      try {
                        await supabase.from("website_clicks").insert({
                          vendor_id: vendor.id,
                          listing_id: listingId || null,
                        });
                        await supabase
                          .from("vendor_profiles")
                          .update({ clicks_to_website: (vendor.clicks_to_website || 0) + 1 })
                          .eq("id", vendor.id);
                      } catch (error) {
                        console.error("Error tracking click:", error);
                      }
                      window.open(vendor.website, "_blank");
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </Button>
                </div>
              )}

              {/* Categories */}
              {listing.categories && listing.categories.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.categories.map((category: string, index: number) => (
                      <Badge key={index} variant="outline">{category}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Generic Category and Subcategory */}
              {(listing.generic_category || listing.generic_subcategory) && (
                <div>
                  <h3 className="font-semibold mb-2">Classification</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.generic_category && (
                      <Badge variant="secondary">{listing.generic_category.replace(/_/g, ' ')}</Badge>
                    )}
                    {listing.generic_subcategory && (
                      <Badge variant="secondary">{listing.generic_subcategory.replace(/_/g, ' ')}</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping Options */}
              {vendor?.shipping_options && vendor.shipping_options.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Shipping Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.shipping_options.map((option: string, index: number) => (
                      <Badge key={index} variant="secondary">{option}</Badge>
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
                            {activeCoupon.discount_value}
                            {activeCoupon.discount_type === "percentage" ? "%" : "$"} off
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Limited time offer</p>
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

              {listing.tags && listing.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* More from Vendor */}
        {moreFromVendor.length > 0 && (
          <div className="container mx-auto px-4 sm:px-6 mt-12">
            <h2 className="text-3xl font-bold mb-4">More from {vendor?.business_name}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {moreFromVendor.map((item) => (
                <div key={item.id} className="shrink-0 w-64">
                  <ProductCard
                    id={item.id}
                    title={item.title}
                    price={item.price ? `$${item.price}` : "Free"}
                    image={item.image_url}
                    categories={mapCategoriesToTypes(item.categories)}
                    vendor={vendor?.business_name || ""}
                    vendorId={item.vendor_id}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <div className="container mx-auto px-4 sm:px-6 mt-8">
            <h2 className="text-3xl font-bold mb-4">Relatable Content</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {relatedListings.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.price ? `$${item.price}` : "Free"}
                  image={item.image_url}
                  categories={mapCategoriesToTypes(item.categories)}
                  vendor={vendor?.business_name || ""}
                  vendorId={item.vendor_id}
                />
              ))}
            </div>
          </div>
        )}

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
              Choose a folder to save this video or create a new one.
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
              {activeCoupon && `${activeCoupon.discount_value}${activeCoupon.discount_type === "percentage" ? "%" : "$"} off`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Coupon Code</p>
              <p className="text-lg font-mono font-bold">{activeCoupon?.code}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This will redirect you to {vendor?.name}'s website where you can use this code.
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

export default VideoListing;
