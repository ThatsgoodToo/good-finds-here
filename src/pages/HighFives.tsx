import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SignupModal from "@/components/SignupModal";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hand, Star, TrendingUp, Award, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import ShareCouponDialog from "@/components/dashboard/vendor/ShareCouponDialog";

const HighFives = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Mock data for highly rated vendors (shown to signed-out users)
  const topVendors = [
    {
      id: "1",
      name: "Clay & Co.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200",
      rating: 4.9,
      highFives: 1247,
      category: "Handcrafted Ceramics",
      type: "product" as const,
    },
    {
      id: "2",
      name: "GINEW",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200",
      rating: 4.8,
      highFives: 1114,
      category: "Heritage Clothing",
      type: "product" as const,
    },
    {
      id: "3",
      name: "Studio Ceramics",
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200",
      rating: 4.9,
      highFives: 892,
      category: "Pottery Workshops",
      type: "experience" as const,
    },
  ];

  // Mock data for top listings (shown to signed-out users)
  const topListings = [
    {
      id: "1",
      title: "Handcrafted Bowl Set",
      vendor: "Clay & Co.",
      vendorId: "1",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300",
      highFives: 547,
      price: "$95",
      type: "product" as const,
    },
    {
      id: "2",
      title: "Heritage Striped Shirt",
      vendor: "GINEW",
      vendorId: "2",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300",
      highFives: 432,
      price: "$120",
      type: "product" as const,
    },
    {
      id: "3",
      title: "Pottery Workshop",
      vendor: "Studio Ceramics",
      vendorId: "3",
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300",
      highFives: 389,
      price: "$75",
      type: "experience" as const,
    },
  ];

  // Mock data for shopper favorites (shown to signed-in shoppers)
  const shopperFavorites = {
    vendors: [
      {
        id: "1",
        name: "Clay & Co.",
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200",
        highFives: 1247,
        category: "Handcrafted Ceramics",
        type: "product" as const,
        savedDate: "2025-10-15",
      },
      {
        id: "2",
        name: "GINEW",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200",
        highFives: 1114,
        category: "Heritage Clothing",
        type: "product" as const,
        savedDate: "2025-10-12",
      },
    ],
    listings: [
      {
        id: "1",
        title: "Handcrafted Bowl Set",
        vendor: "Clay & Co.",
        vendorId: "1",
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300",
        highFives: 547,
        price: "$95",
        type: "product" as const,
        folder: "Favorites",
      },
      {
        id: "2",
        title: "Heritage Striped Shirt",
        vendor: "GINEW",
        vendorId: "2",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300",
        highFives: 432,
        price: "$120",
        type: "product" as const,
        folder: "Gift Ideas",
      },
    ],
  };

  // Mock data for relatable listings (shown to logged-in shoppers)
  const relatableListings = [
    {
      id: "4",
      title: "Organic Cotton Tote",
      vendor: "Eco Goods",
      vendorId: "4",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300",
      highFives: 234,
      price: "$35",
      type: "product" as const,
      matchedFilters: ["Eco-friendly", "Handcrafted"]
    },
    {
      id: "5",
      title: "Local Honey Set",
      vendor: "Bee Happy Farms",
      vendorId: "5",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784e38?w=300",
      highFives: 198,
      price: "$42",
      type: "product" as const,
      matchedFilters: ["Local", "Sustainable"]
    },
    {
      id: "6",
      title: "Wood Carving Workshop",
      vendor: "Artisan Studio",
      vendorId: "6",
      image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=300",
      highFives: 156,
      price: "$85",
      type: "experience" as const,
      matchedFilters: ["Handcrafted", "Local"]
    },
  ];

  // Mock data for overlooked items (least popular)
  const overlookedItems = [
    {
      id: "7",
      title: "Vintage Record Player",
      vendor: "Retro Audio",
      vendorId: "7",
      image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=300",
      highFives: 12,
      price: "$145",
      type: "product" as const,
    },
    {
      id: "8",
      title: "Hand-Knit Scarf",
      vendor: "Cozy Creations",
      vendorId: "8",
      image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=300",
      highFives: 8,
      price: "$55",
      type: "product" as const,
    },
    {
      id: "9",
      title: "Calligraphy Class",
      vendor: "Write Beautiful",
      vendorId: "9",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300",
      highFives: 15,
      price: "$65",
      type: "service" as const,
    },
  ];

  // Mock data for vendor followers (shown to signed-in vendors)
  const vendorFollowers = [
    {
      id: "1",
      name: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      location: "Portland, OR",
      followedDate: "2025-09-20",
      highFivesGiven: 23,
    },
    {
      id: "2",
      name: "Mike Chen",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      location: "Seattle, WA",
      followedDate: "2025-09-15",
      highFivesGiven: 15,
    },
    {
      id: "3",
      name: "Emma Davis",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      location: "San Francisco, CA",
      followedDate: "2025-09-10",
      highFivesGiven: 31,
    },
  ];

  const getTypeDotColor = (type: "product" | "service" | "experience") => {
    switch (type) {
      case "product": return "bg-green-500";
      case "service": return "bg-blue-500";
      case "experience": return "bg-purple-500";
    }
  };

  const renderGuestView = () => (
    <div className="space-y-12">
      {/* Top Rated Vendors */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Award className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Top Rated Vendors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topVendors.map((vendor) => (
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
                      <span>{vendor.highFives} High Fives</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Featured Listings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topListings.map((listing) => (
            <Card
              key={listing.id}
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
              onClick={() => navigate(`/listing/product/${listing.id}`)}
            >
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
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

      {/* Overlooked Items */}
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
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopperFavorites.vendors.map((vendor) => (
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
                      <span>{vendor.highFives} High Fives</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Saved Listings */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Hand className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">My Saved Listings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopperFavorites.listings.map((listing) => (
            <Card
              key={listing.id}
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
              onClick={() => navigate(`/listing/product/${listing.id}`)}
            >
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
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
      </section>

      {/* Relatable Listings */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">You Might Also Like</h2>
          <Badge variant="secondary">Based on your preferences</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatableListings.map((listing) => (
            <Card
              key={listing.id}
              className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
              onClick={() => navigate(`/listing/product/${listing.id}`)}
            >
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2">
                  <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(listing.type))} />
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex flex-wrap gap-1">
                    {listing.matchedFilters.map((filter, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {filter}
                      </Badge>
                    ))}
                  </div>
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

      {/* Overlooked Items */}
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
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
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
                    <p className="text-sm text-muted-foreground mb-2">{follower.location}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Hand className="h-4 w-4 text-primary" />
                      <span>{follower.highFivesGiven} High Fives</span>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Open offer coupon modal
                  }}
                >
                  Offer Exclusive Coupon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );

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

          {/* Content based on user state */}
          {!user && renderGuestView()}
          {user && userRole === "shopper" && renderShopperView()}
          {user && userRole === "vendor" && renderVendorView()}
        </div>

        <SearchBar
          onSearch={() => {}}
          onToggleMap={() => {}}
          isMapView={false}
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
