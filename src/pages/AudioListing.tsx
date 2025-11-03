import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SignupModal from "@/components/SignupModal";
import ProductCard from "@/components/ProductCard";
import { SaveButton } from "@/components/SaveButton";
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
import { ExternalLink, CheckCircle, Ticket, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import LocationLink from "@/components/LocationLink";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type Listing = Database['public']['Tables']['listings']['Row'];
type Coupon = Database['public']['Tables']['coupons']['Row'];

interface VendorInfo {
  id: string;
  name: string;
  logo: string;
  website: string;
  location: string;
  verified: boolean;
  clicks_to_website?: number;
}

// Audio URL parsing utilities
const getAudioEmbedUrl = (url: string | null): { embedUrl: string; type: 'iframe' | 'audio' } | null => {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Bandcamp (supports artist subdomains like artist.bandcamp.com)
    if (hostname === 'bandcamp.com' || hostname.endsWith('.bandcamp.com')) {
    const trackMatch = url.match(/\/track\/([^/?]+)/);
    const albumMatch = url.match(/\/album\/([^/?]+)/);
    if (trackMatch) {
      return { embedUrl: `https://bandcamp.com/EmbeddedPlayer/track=${trackMatch[1]}/size=large/`, type: 'iframe' };
    }
    if (albumMatch) {
      return { embedUrl: `https://bandcamp.com/EmbeddedPlayer/album=${albumMatch[1]}/size=large/`, type: 'iframe' };
    }
    }
    
    // SoundCloud
    if (hostname === 'soundcloud.com' || hostname.endsWith('.soundcloud.com')) {
    return { 
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`, 
      type: 'iframe' 
    };
  }

  // Spotify
  if (hostname === 'spotify.com' || hostname.endsWith('.spotify.com')) {
    const spotifyRegex = /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/;
  const spotifyMatch = url.match(spotifyRegex);
  if (spotifyMatch) {
    return { embedUrl: `https://open.spotify.com/embed/${spotifyMatch[1]}/${spotifyMatch[2]}`, type: 'iframe' };
  }
  }

  // YouTube (check against allowed hosts)
  const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com'];
  if (YOUTUBE_HOSTS.includes(hostname)) {
    // YouTube Shorts pattern
  const shortsRegex = /(?:youtube\.com\/shorts\/)([^"&?/\s]{11})/i;
  const shortsMatch = url.match(shortsRegex);
  if (shortsMatch && shortsMatch[1]) {
    return { embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}`, type: 'iframe' };
  }

  // YouTube standard patterns (for audio)
  const youtubeRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return { embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`, type: 'iframe' };
    }
  }

  // Direct audio file
  if (url.match(/\.(mp3|wav|ogg|m4a)$/i)) {
      return { embedUrl: url, type: 'audio' };
    }
    
    return null;
  } catch {
    // Invalid URL
    return null;
  }
};

const AudioListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { user } = useAuth();
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [listing, setListing] = useState<Listing | null>(null);
  const [vendor, setVendor] = useState<VendorInfo | null>(null);
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [moreFromVendor, setMoreFromVendor] = useState<Listing[]>([]);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
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

      // Load listing
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
            logo: profile?.avatar_url || "",
            website: vendorProfile?.website || listingData.website_url || "",
            location: vendorProfile ? `${vendorProfile.city}, ${vendorProfile.state_region}` : listingData.location || "",
            verified: vendorProfile?.status === "active",
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
          .from("user_saves")
          .select("*", { count: "exact", head: true })
          .eq("save_type", "listing")
          .eq("target_id", listingId);

        setHighFivesCount(count || 0);

        // Track listing view (increment views count)
        await supabase
          .from("listings")
          .update({ views: (listingData.views || 0) + 1 })
          .eq("id", listingId);

        // Track vendor profile view if not viewing own listing
        if (user?.id && user.id !== listingData.vendor_id && vendorProfile) {
          await supabase
            .from("vendor_profiles")
            .update({ profile_views: (vendorProfile.profile_views || 0) + 1 })
            .eq("user_id", listingData.vendor_id);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [listingId, user?.id]);

  const folders = [
    { id: "1", name: "Music" },
    { id: "2", name: "Meditation" },
    { id: "3", name: "Favorites" },
  ];

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
          <p className="text-muted-foreground">Audio not found</p>
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
              
              <div className="space-y-2">
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
                
                {vendor?.website && (
                  <Button
                    variant="link"
                    className="text-sm gap-1"
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
                    <ExternalLink className="h-3 w-3" />
                    website
                  </Button>
                )}
                
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
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Audio Player or Cover Art */}
            <div className="lg:col-span-1">
              {(() => {
                const audioEmbed = getAudioEmbedUrl(listing.source_url || listing.listing_link);
                
                if (audioEmbed) {
                  if (audioEmbed.type === 'iframe') {
                    return (
                      <div className="w-full rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={audioEmbed.embedUrl}
                          className="w-full h-[400px]"
                          allow="autoplay"
                          title={listing.title}
                        />
                      </div>
                    );
                  } else if (audioEmbed.type === 'audio') {
                    return (
                      <div className="w-full space-y-4">
                        {listing.image_url && (
                          <img
                            src={listing.image_url}
                            alt={listing.title}
                            className="w-full rounded-lg"
                            loading="lazy"
                          />
                        )}
                        <audio controls className="w-full">
                          <source src={audioEmbed.embedUrl} />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    );
                  }
                }
                
                // Fallback to cover art only
                if (listing.image_url) {
                  return (
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full rounded-lg"
                      loading="lazy"
                    />
                  );
                }
                
                return null;
              })()}
            </div>

            {/* Right - Audio Player & Details */}
            <div className="lg:col-span-2 space-y-6">
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
                
                <div className="flex items-center gap-3 mb-6">
                  <SaveButton
                    itemType="listing"
                    itemId={listingId || ""}
                    itemTitle={listing.title}
                    size="sm"
                    variant="outline"
                    showLabel
                  />
                  <span className="text-sm text-muted-foreground">
                    {highFivesCount} High Five{highFivesCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {listing.description && (
                  <div>
                    <h3 className="font-semibold mb-2">description</h3>
                    <p className="text-sm text-muted-foreground">{listing.description}</p>
                  </div>
                )}

                {listing.price && (
                  <div>
                    <h3 className="font-semibold mb-1">Price</h3>
                    <p className="text-sm text-muted-foreground">${listing.price}</p>
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
                    <h3 className="font-semibold mb-2">Filters</h3>
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
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">More from {vendor?.name}</h2>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {moreFromVendor.map((item) => (
                  <div key={item.id} className="shrink-0 w-64">
                    <ProductCard
                      id={item.id}
                      title={item.title}
                      price={item.price ? `$${item.price}` : "Free"}
                      image={item.image_url}
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
              <h2 className="text-xl font-bold mb-4">Relatable Content</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedListings.map((item) => (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    price={item.price ? `$${item.price}` : "Free"}
                    image={item.image_url}
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
                Claim & Visit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>
  );
};

export default AudioListing;
