import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
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
  MapPin, 
  DollarSign, 
  Package, 
  Truck, 
  Hand,
  ChevronLeft,
  ChevronRight,
  Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";

const VendorProfile = () => {
  const navigate = useNavigate();
  const { vendorId } = useParams();
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [newFolderName, setNewFolderName] = useState("");

  // Mock vendor data
  const vendor = {
    name: "Clay & Co.",
    verified: true,
    website: "https://clayandco.example.com",
    bio: "Handcrafted ceramic pieces inspired by nature. Each item is uniquely made with sustainable practices and local materials. We specialize in functional pottery that brings beauty to everyday life.",
    profileImage: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300",
    location: "Portland, Oregon",
    priceRange: "Accessible - $15-$150",
    category: "Handcrafted Ceramics",
    expertise: "10+ years",
    shipping: ["Shipping", "Pickup", "In Person"],
    ownership: "Women-Owned",
    sustainable: ["Eco-friendly materials", "Low-waste production", "Locally sourced"],
    activeOffers: 3,
    highFives: 247,
  };

  const listings = {
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500",
        title: "Handcrafted Bowl Set",
        type: "product" as const,
        hasOffer: true,
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500",
        title: "Ceramic Vase",
        type: "product" as const,
        hasOffer: false,
      },
      {
        id: "3",
        url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500",
        title: "Pottery Workshop",
        type: "experience" as const,
        hasOffer: true,
      },
      {
        id: "4",
        url: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=500",
        title: "Custom Orders",
        type: "service" as const,
        hasOffer: false,
      },
    ],
    videos: [],
    audio: [],
  };

  const offers = [
    { id: "1", title: "15% off Bowl Sets", type: "product", thumbnail: listings.images[0].url },
    { id: "2", title: "Free Workshop Entry", type: "experience", thumbnail: listings.images[2].url },
    { id: "3", title: "Buy 2 Get 1 Free", type: "product", thumbnail: listings.images[1].url },
  ];

  const relatedVendors = [
    {
      id: "1",
      name: "Studio Ceramics",
      category: "Pottery & Art",
      type: "experience" as const,
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200",
    },
    {
      id: "2",
      name: "Metalworks",
      category: "Handcrafted Jewelry",
      type: "product" as const,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200",
    },
    {
      id: "3",
      name: "Pure Essence",
      category: "Organic Goods",
      type: "product" as const,
      image: "https://images.unsplash.com/photo-1600428449936-7d99b66d3e7c?w=200",
    },
  ];

  const folders = [
    { id: "1", name: "Travel" },
    { id: "2", name: "Kid Snacks" },
    { id: "3", name: "Favorites" },
  ];

  const getTypeDotColor = (type: "product" | "service" | "experience") => {
    switch (type) {
      case "product": return "bg-green-500";
      case "service": return "bg-blue-500";
      case "experience": return "bg-purple-500";
    }
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
    window.open(vendor.website, "_blank");
    setShowCouponDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
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
                
                <Button
                  variant="link"
                  className="text-primary gap-1"
                  onClick={() => window.open(vendor.website, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </Button>
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
                        <div className="absolute top-2 left-2">
                          <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(listing.type))} />
                        </div>
                        
                        {/* Exclusive offer badge */}
                        {listing.hasOffer && (
                          <Badge className="absolute top-2 right-2 bg-red-500">
                            Exclusive Offer
                          </Badge>
                        )}
                        
                        {/* Bottom title overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 p-3">
                          <p className="text-sm font-medium">{listing.title}</p>
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
              {/* Location */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">{vendor.location}</p>
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

              {/* Category & Expertise */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold mb-1">Category</h3>
                      <p className="text-sm text-muted-foreground">{vendor.category}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Expertise</h3>
                      <p className="text-sm text-muted-foreground">{vendor.expertise}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Options */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-2">Shipping Options</h3>
                      <div className="flex flex-wrap gap-2">
                        {vendor.shipping.map((option, index) => (
                          <Badge key={index} variant="secondary">{option}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ownership & Sustainable Practices */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1">Ownership</h3>
                    <Badge variant="outline">{vendor.ownership}</Badge>
                  </div>
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
                              <div className={cn("h-2 w-2 rounded-full shrink-0", getTypeDotColor(offer.type as any))} />
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

              {/* High Fives */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hand className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold">High Fives</h3>
                        <p className="text-sm text-muted-foreground">{vendor.highFives} shoppers</p>
                      </div>
                    </div>
                    <Button onClick={handleHighFive} size="sm">
                      Add to Folder
                    </Button>
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
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 shrink-0">
                          <AvatarImage src={relatedVendor.image} alt={relatedVendor.name} />
                          <AvatarFallback>{relatedVendor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("h-2 w-2 rounded-full shrink-0", getTypeDotColor(relatedVendor.type))} />
                            <h3 className="font-semibold text-sm truncate">{relatedVendor.name}</h3>
                          </div>
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
          onToggleMap={() => {}}
          isMapView={false}
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
              Choose a folder to save {vendor.name} or create a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setShowFolderDialog(false);
                  // Handle folder selection
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
                  className="flex-1 px-3 py-2 rounded-md border border-input bg-background"
                />
                <Button onClick={() => {
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
    </div>
  );
};

export default VendorProfile;
