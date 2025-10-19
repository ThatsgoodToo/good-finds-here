import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import SignupModal from "@/components/SignupModal";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExternalLink, MapPin, Hand, ChevronLeft, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ShopperProfile = () => {
  const navigate = useNavigate();
  const { shopperId } = useParams();
  const { user, userRole } = useAuth();
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDescription, setCouponDescription] = useState("");

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Mock shopper data
  const shopper = {
    id: "1",
    name: "Sarah Johnson",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    location: "Portland, Oregon",
    bio: "Food lover, sustainable living enthusiast, and supporter of local artisans. Always on the lookout for unique handcrafted items and ethical brands.",
    website: "https://sarahjohnson.example.com",
    highFives: 247,
  };

  // Mock saved items
  const savedItems = [
    {
      id: "1",
      type: "vendor" as const,
      name: "Clay & Co.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200",
      category: "Handcrafted Ceramics",
    },
    {
      id: "2",
      type: "listing" as const,
      name: "Heritage Striped Shirt",
      vendor: "GINEW",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200",
      category: "Clothing",
    },
    {
      id: "3",
      type: "vendor" as const,
      name: "Studio Ceramics",
      image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200",
      category: "Pottery Workshops",
    },
    {
      id: "4",
      type: "listing" as const,
      name: "Handcrafted Bowl Set",
      vendor: "Clay & Co.",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=200",
      category: "Home Decor",
    },
    {
      id: "5",
      type: "listing" as const,
      name: "Organic Skincare Kit",
      vendor: "Pure Essence",
      image: "https://images.unsplash.com/photo-1600428449936-7d99b66d3e7c?w=200",
      category: "Beauty",
    },
  ];

  const getTypeDotColor = (type: "vendor" | "listing") => {
    return type === "vendor" ? "bg-green-500" : "bg-blue-500";
  };

  const handleOfferCoupon = () => {
    if (!couponCode.trim() || !couponDescription.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Track coupon offer
    console.log("Coupon offered:", { couponCode, couponDescription, shopperId });
    
    toast.success("Exclusive coupon sent!", {
      description: `${shopper.name} will see your offer in their dashboard.`,
    });
    
    setShowCouponDialog(false);
    setCouponCode("");
    setCouponDescription("");
  };

  const handleItemClick = (item: typeof savedItems[0]) => {
    if (item.type === "vendor") {
      navigate(`/vendor/${item.id}`);
    } else {
      navigate(`/listing/product/${item.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Back Button */}
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        {/* Profile Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={shopper.image} alt={shopper.name} />
                <AvatarFallback>{shopper.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{shopper.name}</h1>
                
                {shopper.location && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{shopper.location}</span>
                  </div>
                )}
                
                {shopper.website && (
                  <Button
                    variant="link"
                    className="text-primary gap-1"
                    onClick={() => window.open(shopper.website, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </Button>
                )}
              </div>
              
              {shopper.bio && (
                <p className="text-muted-foreground max-w-2xl">
                  {shopper.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Activity Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Hand className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-semibold">High Fives</h3>
                      <p className="text-sm text-muted-foreground">
                        {shopper.highFives} saved items
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setShowActivityDialog(true)}
                  >
                    View Activity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vendor-only: Offer Coupon Button */}
            {user && userRole === "vendor" && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3 text-center sm:text-left">
                      <Gift className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-1">
                          Send an Exclusive Offer
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Reward this shopper with a special coupon for your shop
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setShowCouponDialog(true)}
                      className="shrink-0"
                    >
                      Offer Coupon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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

      {/* Activity Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>High Fives Activity</DialogTitle>
            <DialogDescription>
              Vendors and listings saved by {shopper.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 overflow-y-auto max-h-[60vh] pr-2">
            {savedItems.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleItemClick(item)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={cn("h-2 w-2 rounded-full", getTypeDotColor(item.type))} />
                        <h4 className="font-semibold text-sm">{item.name}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.type === "listing" ? item.vendor : item.category}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Offer Coupon Dialog */}
      <Dialog open={showCouponDialog} onOpenChange={setShowCouponDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offer Exclusive Coupon</DialogTitle>
            <DialogDescription>
              Create a special offer for {shopper.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="couponCode">Coupon Code</Label>
              <Input
                id="couponCode"
                placeholder="e.g., SPECIAL15"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="couponDescription">Description</Label>
              <Textarea
                id="couponDescription"
                placeholder="e.g., 15% off your next purchase"
                value={couponDescription}
                onChange={(e) => setCouponDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCouponDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleOfferCoupon}
              >
                Send Offer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>
  );
};

export default ShopperProfile;
