import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import FilterBar from "@/components/FilterBar";
import SignupModal from "@/components/SignupModal";
import { useAuth } from "@/contexts/AuthContext";
import { CategoryType } from "@/components/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hand, Award, Sparkles, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareCouponDialog from "@/components/dashboard/vendor/ShareCouponDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VendorCard {
  id: string;
  name: string;
  image: string;
  highFives: number;
  category: string;
  type: "product" | "service" | "experience" | "sale";
  savedDate?: string;
}

interface ListingCard {
  id: string;
  title: string;
  vendor: string;
  vendorId: string;
  image: string;
  highFives: number;
  price: string;
  type: CategoryType;
  folder?: string;
  matchedFilters?: string[];
}

interface FollowerCard {
  id: string;
  name: string;
  image: string;
  location: string;
  followedDate: string;
  highFivesGiven: number;
}

const HighFives = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState<{ id: string; name: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | CategoryType>("all");
  
  // State for fetched data
  const [loading, setLoading] = useState(true);
  const [topVendors, setTopVendors] = useState<VendorCard[]>([]);
  const [topListings, setTopListings] = useState<ListingCard[]>([]);
  const [overlookedItems, setOverlookedItems] = useState<ListingCard[]>([]);
  const [shopperFavorites, setShopperFavorites] = useState<{ vendors: VendorCard[]; listings: ListingCard[] }>({ vendors: [], listings: [] });
  const [relatableListings, setRelatableListings] = useState<ListingCard[]>([]);
  const [vendorFollowers, setVendorFollowers] = useState<FollowerCard[]>([]);

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Fetch data based on user role
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!user) {
          await fetchGuestData();
        } else if (userRole === "shopper") {
          await fetchShopperData();
        } else if (userRole === "vendor") {
          await fetchVendorData();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userRole]);

  const fetchGuestData = async () => {
    // Fetch top vendors with follower counts
    const { data: vendors, error: vendorsError } = await supabase
      .from("vendor_profiles")
      .select(`
        id,
        user_id,
        business_description,
        business_type,
        city,
        state_region
      `)
      .eq("status", "active")
      .limit(6);

    if (!vendorsError && vendors) {
      const vendorsWithCounts = await Promise.all(
        vendors.map(async (vendor) => {
          // Get profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, profile_picture_url")
            .eq("id", vendor.user_id)
            .single();

          // Get follower count
          const { count } = await supabase
            .from("followers")
            .select("*", { count: "exact", head: true })
            .eq("vendor_id", vendor.user_id);

          return {
            id: vendor.user_id,
            name: profile?.display_name || "Unknown Vendor",
            image: profile?.profile_picture_url || "",
            highFives: count || 0,
            category: vendor.business_type || "General",
            type: "product" as const,
          };
        })
      );
      setTopVendors(vendorsWithCounts.sort((a, b) => b.highFives - a.highFives).slice(0, 3));
    }

    // Fetch top listings
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        image_url,
        price,
        listing_type,
        vendor_id
      `)
      .eq("status", "active")
      .limit(6);

    if (!listingsError && listings) {
      const listingsWithCounts = await Promise.all(
        listings.map(async (listing) => {
          // Get vendor profile and name
          const { data: vendorProfile } = await supabase
            .from("vendor_profiles")
            .select("user_id")
            .eq("user_id", listing.vendor_id)
            .single();

          let vendorName = "Unknown";
          if (vendorProfile) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", vendorProfile.user_id)
              .single();
            vendorName = profile?.display_name || "Unknown";
          }

          const { count } = await supabase
            .from("favorites")
            .select("*", { count: "exact", head: true })
            .eq("item_id", listing.id);

          return {
            id: listing.id,
            title: listing.title,
            vendor: vendorName,
            vendorId: listing.vendor_id,
            image: listing.image_url || "",
            highFives: count || 0,
            price: listing.price ? `$${listing.price}` : "Contact for price",
            type: listing.listing_type as any,
          };
        })
      );
      
      const sorted = listingsWithCounts.sort((a, b) => b.highFives - a.highFives);
      setTopListings(sorted.slice(0, 3));
      setOverlookedItems(sorted.slice(-3).reverse());
    }
  };

  const fetchShopperData = async () => {
    if (!user) return;

    // Fetch followed vendors
    const { data: followedVendors, error: followError } = await supabase
      .from("followers")
      .select(`
        vendor_id,
        created_at
      `)
      .eq("shopper_id", user.id);

    if (!followError && followedVendors) {
      const vendorsWithCounts = await Promise.all(
        followedVendors.map(async (follow) => {
          // Get vendor profile
          const { data: vendorProfile } = await supabase
            .from("vendor_profiles")
            .select("business_type, user_id")
            .eq("user_id", follow.vendor_id)
            .single();

          // Get profile data
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, profile_picture_url")
            .eq("id", follow.vendor_id)
            .single();

          // Get follower count
          const { count } = await supabase
            .from("followers")
            .select("*", { count: "exact", head: true })
            .eq("vendor_id", follow.vendor_id);

          return {
            id: follow.vendor_id,
            name: profile?.display_name || "Unknown",
            image: profile?.profile_picture_url || "",
            highFives: count || 0,
            category: vendorProfile?.business_type || "General",
            type: "product" as const,
            savedDate: follow.created_at,
          };
        })
      );
      setShopperFavorites(prev => ({ ...prev, vendors: vendorsWithCounts }));
    }

    // Fetch saved listings
    const { data: favorites, error: favError } = await supabase
      .from("favorites")
      .select(`
        item_id,
        folder_name,
        created_at
      `)
      .eq("user_id", user.id);

    if (!favError && favorites && favorites.length > 0) {
      const listingIds = favorites.map(f => f.item_id);
      
      const { data: listings } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          image_url,
          price,
          listing_type,
          vendor_id
        `)
        .in("id", listingIds);

      if (listings) {
        const listingsWithDetails = await Promise.all(
          listings.map(async (listing) => {
            // Get vendor name
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", listing.vendor_id)
              .single();

            // Get favorites count
            const { count } = await supabase
              .from("favorites")
              .select("*", { count: "exact", head: true })
              .eq("item_id", listing.id);

            const favorite = favorites.find(f => f.item_id === listing.id);

            return {
              id: listing.id,
              title: listing.title,
              vendor: profile?.display_name || "Unknown",
              vendorId: listing.vendor_id,
              image: listing.image_url || "",
              highFives: count || 0,
              price: listing.price ? `$${listing.price}` : "Contact for price",
              type: listing.listing_type as any,
              folder: favorite?.folder_name || "Favorites",
            };
          })
        );
        setShopperFavorites(prev => ({ ...prev, listings: listingsWithDetails }));
      }
    }

    // Fetch recommendations based on user interests
    const { data: profile } = await supabase
      .from("profiles")
      .select("interests")
      .eq("id", user.id)
      .single();

    if (profile?.interests && profile.interests.length > 0) {
      const { data: recommendations } = await supabase
        .from("listings")
        .select(`
          id,
          title,
          image_url,
          price,
          listing_type,
          tags,
          vendor_id
        `)
        .eq("status", "active")
        .limit(6);

      if (recommendations) {
        const recsWithCounts = await Promise.all(
          recommendations.map(async (listing) => {
            // Get vendor name
            const { data: vendorProfile } = await supabase
              .from("profiles")
              .select("display_name")
              .eq("id", listing.vendor_id)
              .single();

            // Get favorites count
            const { count } = await supabase
              .from("favorites")
              .select("*", { count: "exact", head: true })
              .eq("item_id", listing.id);

            const matchedFilters = listing.tags?.filter((tag: string) => 
              profile.interests.some((interest: string) => 
                interest.toLowerCase().includes(tag.toLowerCase())
              )
            ) || [];

            return {
              id: listing.id,
              title: listing.title,
              vendor: vendorProfile?.display_name || "Unknown",
              vendorId: listing.vendor_id,
              image: listing.image_url || "",
              highFives: count || 0,
              price: listing.price ? `$${listing.price}` : "Contact for price",
              type: listing.listing_type as any,
              matchedFilters: matchedFilters.slice(0, 3),
            };
          })
        );
        setRelatableListings(recsWithCounts.slice(0, 3));
      }
    }

    // Also fetch overlooked items for shoppers
    await fetchGuestData();
  };

  const fetchVendorData = async () => {
    if (!user) return;

    // Fetch followers for this vendor
    const { data: followers, error: followersError } = await supabase
      .from("followers")
      .select(`
        shopper_id,
        created_at
      `)
      .eq("vendor_id", user.id);

    if (!followersError && followers) {
      const followersData = await Promise.all(
        followers.map(async (follower) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, profile_picture_url")
            .eq("id", follower.shopper_id)
            .single();

          return {
            id: follower.shopper_id,
            name: profile?.display_name || "Unknown Shopper",
            image: profile?.profile_picture_url || "",
            location: "Unknown",
            followedDate: follower.created_at,
            highFivesGiven: 0,
          };
        })
      );
      setVendorFollowers(followersData);
    }
  };

  const getTypeDotColor = (type: "product" | "service" | "experience" | "sale") => {
    switch (type) {
      case "product": return "bg-category-product";
      case "service": return "bg-category-service";
      case "experience": return "bg-category-experience";
      case "sale": return "bg-category-sale";
    }
  };

  const filterByType = <T extends { type: "product" | "service" | "experience" | "sale" }>(items: T[]): T[] => {
    if (activeFilter === "all") return items;
    return items.filter(item => item.type === activeFilter);
  };

  const renderGuestView = () => (
    <div className="space-y-12">
      {/* Top Rated Vendors */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Award className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Top Rated Vendors</h2>
        </div>
        {filterByType(topVendors).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterByType(topVendors).map((vendor) => (
              <Card
                key={vendor.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/vendor/${vendor.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={vendor.image} alt={vendor.name} />
                      <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("h-2 w-2 rounded-full", getTypeDotColor(vendor.type))} />
                        <h3 className="font-semibold">{vendor.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{vendor.category}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Hand className="h-4 w-4 text-primary" />
                        <span>{vendor.highFives} Followers</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No vendors available yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Featured Listings */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Featured Listings</h2>
        </div>
        {filterByType(topListings).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterByType(topListings).map((listing) => (
              <Card
                key={listing.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => navigate(`/listing/product/${listing.id}`)}
              >
                <div className="relative">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(listing.type))} />
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{listing.vendor}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{listing.price}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Hand className="h-4 w-4 text-primary" />
                      <span>{listing.highFives}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No listings available yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Overlooked Items */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Heart className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Hidden Gems</h2>
          <Badge variant="secondary">Give them some love!</Badge>
        </div>
        {filterByType(overlookedItems).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterByType(overlookedItems).map((listing) => (
              <Card
                key={listing.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => navigate(`/listing/product/${listing.id}`)}
              >
                <div className="relative">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(listing.type))} />
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{listing.vendor}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{listing.price}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Hand className="h-4 w-4 text-primary" />
                      <span>{listing.highFives}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No hidden gems to discover yet!</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Call to Action */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6 text-center">
          <Hand className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Start Saving Your Favorites</h3>
          <p className="text-muted-foreground mb-4">
            Sign up to create collections and never lose track of your favorite vendors and products
          </p>
          <Button onClick={() => navigate("/signup/shopper")}>
            Join as Shopper
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderShopperView = () => (
    <div className="space-y-12">
      {/* Saved Vendors */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Hand className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">My Favorite Vendors</h2>
        </div>
        {filterByType(shopperFavorites.vendors).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterByType(shopperFavorites.vendors).map((vendor) => (
              <Card
                key={vendor.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/vendor/${vendor.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={vendor.image} alt={vendor.name} />
                      <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("h-2 w-2 rounded-full", getTypeDotColor(vendor.type))} />
                        <h3 className="font-semibold">{vendor.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{vendor.category}</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Hand className="h-4 w-4 text-primary" />
                        <span>{vendor.highFives} Followers</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>You haven't followed any vendors yet. Start exploring!</p>
              <Button className="mt-4" onClick={() => navigate("/")}>Browse Vendors</Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Saved Listings */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Hand className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">My Saved Listings</h2>
        </div>
        {filterByType(shopperFavorites.listings).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterByType(shopperFavorites.listings).map((listing) => (
              <Card
                key={listing.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => navigate(`/listing/product/${listing.id}`)}
              >
                <div className="relative">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(listing.type))} />
                  </div>
                  <Badge className="absolute top-2 right-2">
                    {listing.folder}
                  </Badge>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{listing.vendor}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{listing.price}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Hand className="h-4 w-4 text-primary" />
                      <span>{listing.highFives}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>You haven't saved any listings yet. Start exploring!</p>
              <Button className="mt-4" onClick={() => navigate("/")}>Browse Listings</Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Relatable Listings */}
      {relatableListings.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">You Might Also Like</h2>
            <Badge variant="secondary">Based on your preferences</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterByType(relatableListings).map((listing) => (
              <Card
                key={listing.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => navigate(`/listing/product/${listing.id}`)}
              >
                <div className="relative">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(listing.type))} />
                  </div>
                  {listing.matchedFilters && listing.matchedFilters.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex flex-wrap gap-1">
                        {listing.matchedFilters.map((filter: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{listing.vendor}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{listing.price}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Hand className="h-4 w-4 text-primary" />
                      <span>{listing.highFives}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Overlooked Items */}
      {overlookedItems.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Heart className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Hidden Gems</h2>
            <Badge variant="secondary">Give them some love!</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {overlookedItems.map((listing) => (
              <Card
                key={listing.id}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                onClick={() => navigate(`/listing/product/${listing.id}`)}
              >
                <div className="relative">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(listing.type))} />
                  </div>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{listing.vendor}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{listing.price}</span>
                    <div className="flex items-center gap-1 text-sm">
                      <Hand className="h-4 w-4 text-primary" />
                      <span>{listing.highFives}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const renderVendorView = () => (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Hand className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Your Followers</h2>
          <Badge variant="secondary">{vendorFollowers.length} shoppers</Badge>
        </div>
        {vendorFollowers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendorFollowers.map((follower) => (
              <Card
                key={follower.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/shopper/${follower.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={follower.image} alt={follower.name} />
                      <AvatarFallback>{follower.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{follower.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Followed you</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFollower({ id: follower.id, name: follower.name });
                      setShareDialogOpen(true);
                    }}
                  >
                    Offer Exclusive Coupon
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <p>No followers yet. Share your profile to attract shoppers!</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 sm:pt-20 pb-24">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
              <Hand className="h-8 w-8 text-primary" />
              High Fives
            </h1>
            <p className="text-muted-foreground">
              {!user && "Discover the best vendors and products on That's Good Too"}
              {user && userRole === "shopper" && "Your saved vendors and listings"}
              {user && userRole === "vendor" && "Shoppers who are following your profile"}
            </p>
          </div>

          {/* Filter Bar */}
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onBack={() => navigate("/")}
            viewMode="gallery"
            onViewModeChange={() => {}}
          />

          {/* Content based on user state */}
          {!user && renderGuestView()}
          {user && userRole === "shopper" && renderShopperView()}
          {user && userRole === "vendor" && renderVendorView()}
        </div>

        <SearchBar
          onSearch={() => {}}
          isCentered={false}
          onWhatsgoodClick={() => navigate("/")}
        />
      </main>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
      {selectedFollower && (
        <ShareCouponDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          shopperId={selectedFollower.id}
          shopperName={selectedFollower.name}
        />
      )}
    </div>
  );
};

export default HighFives;
