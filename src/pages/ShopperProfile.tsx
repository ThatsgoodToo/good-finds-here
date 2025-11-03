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
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Hand, ChevronLeft, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import ShareCouponDialog from "@/components/dashboard/vendor/ShareCouponDialog";
import { toast } from "sonner";

const ShopperProfile = () => {
  const navigate = useNavigate();
  const { shopperId } = useParams();
  const { user, userRole } = useAuth();
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [showCouponDialog, setShowCouponDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    highFivesPublic: true,
    locationPublic: true,
  });
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  useEffect(() => {
    const checkOwner = async () => {
      if (!user || !shopperId) {
        setIsOwnProfile(false);
        return;
      }
      try {
        // ✅ SAFE: Only selecting non-sensitive fields for profile check
        const { data } = await supabase
          .from('profiles')
          .select('display_name, high_fives_public, location_public')
          .eq('id', user.id)
          .maybeSingle();
        const slugify = (s: string) => s
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        const candidateSlugs = [
          user.id,
          data?.display_name ? slugify(data.display_name) : undefined,
          user.email ? slugify(user.email.split('@')[0]) : undefined,
        ].filter(Boolean) as string[];
        setIsOwnProfile(candidateSlugs.includes((shopperId as string).toLowerCase()));
        if (data) {
          setPrivacySettings((prev) => ({
            highFivesPublic: (data as any).high_fives_public ?? prev.highFivesPublic,
            locationPublic: (data as any).location_public ?? prev.locationPublic,
          }));
        }
      } catch (e) {
        console.error('Failed to determine profile ownership', e);
      }
    };
    checkOwner();
  }, [user, shopperId]);

  // Load shopper data from database
  const [shopper, setShopper] = useState({
    id: shopperId || "",
    name: "",
    image: "",
    location: "",
    locationPublic: true,
    bio: "",
    website: "",
    highFives: 0,
    highFivesPublic: true,
  });

  const [savedItems, setSavedItems] = useState<Array<{
    id: string;
    type: "vendor" | "listing";
    name: string;
    image: string;
    category: string;
    vendor?: string;
  }>>([]);

  useEffect(() => {
    const loadShopperProfile = async () => {
      if (!shopperId) return;

      // Try to find the user by slug - use public_profiles view for public access
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, display_name, avatar_url, bio, location_public, high_fives_public");

      const matchedProfile = profiles?.find((p: any) => {
        const slugify = (s: string) => s?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return p.id === shopperId || slugify(p.display_name) === shopperId.toLowerCase();
      });

      if (matchedProfile) {
        setShopper({
          id: matchedProfile.id,
          name: matchedProfile.display_name || "Shopper",
          image: matchedProfile.avatar_url || "",
          location: "", // TODO: Add location to profiles table
          locationPublic: matchedProfile.location_public ?? true,
          bio: matchedProfile.bio || "",
          website: "",
          highFives: 0, // TODO: Count favorites
          highFivesPublic: matchedProfile.high_fives_public ?? true,
        });

        // Load saved items from user_saves table
        const { data: saves } = await supabase
          .from("user_saves")
          .select("*")
          .eq("user_id", matchedProfile.id)
          .eq("save_type", "listing");

        if (saves) {
          setSavedItems(
            saves.map((save: any) => ({
              id: save.target_id,
              type: save.save_type,
              name: save.folder_id || "Unsorted",
              image: "",
              category: "",
            }))
          );
        }
      }
    };

    loadShopperProfile();
  }, [shopperId]);

  const getTypeDotColor = (type: "vendor" | "listing") => {
    return type === "vendor" ? "bg-green-500" : "bg-blue-500";
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
                
                {shopper.location && privacySettings.locationPublic && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <span>{shopper.location}</span>
                  </div>
                )}

                {shopper.website && (
                  <Button
                    variant="link"
                    className="text-primary gap-1"
                    onClick={() => window.open("https://bandcamp.com/", "_blank")}
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
            {/* Activity Section - Only show if high fives are public */}
            {privacySettings.highFivesPublic && (
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
            )}

            {/* Privacy Notice - Show when high fives are private */}
            {!privacySettings.highFivesPublic && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Hand className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      This shopper has chosen to keep their activity private
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referral Link - Show on own profile */}
            {isOwnProfile && (
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-1 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        Share ThatsGoodToo & Earn Rewards
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Invite friends using your referral link. When they sign up, you'll get exclusive bonus coupons!
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={`${window.location.origin}/signup?ref=${user?.id}`}
                        className="flex-1 font-mono text-sm bg-background"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${user?.id}`);
                          toast.success("Referral link copied!");
                        }}
                        variant="outline"
                      >
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

      <ShareCouponDialog
        open={showCouponDialog}
        onOpenChange={setShowCouponDialog}
        shopperId={shopper.id}
        shopperName={shopper.name}
      />

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>
  );
};

export default ShopperProfile;
