import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { List, Map as MapIcon, Gift } from "lucide-react";
import ShareCouponDialog from "@/components/dashboard/vendor/ShareCouponDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Follower {
  id: string;
  name: string;
  image: string;
  location: string;
  savedDate: string;
}

interface VendorFollowersListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VendorFollowersList = ({ open, onOpenChange }: VendorFollowersListProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState<{ id: string; name: string } | null>(null);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFollowers = async () => {
      if (!user || !open) return;
      
      setLoading(true);
      try {
        // Get followers
        const { data: followersData } = await supabase
          .from("followers")
          .select("shopper_id, created_at")
          .eq("vendor_id", user.id)
          .order("created_at", { ascending: false });

        if (followersData && followersData.length > 0) {
          // Get profiles for followers
          const shopperIds = followersData.map(f => f.shopper_id);
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url, profile_picture_url, location")
            .in("id", shopperIds);

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

          const mappedFollowers: Follower[] = followersData.map(f => {
            const profile = profileMap.get(f.shopper_id);
            const createdDate = new Date(f.created_at);
            const now = new Date();
            const daysAgo = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            
            let savedDate = "";
            if (daysAgo === 0) savedDate = "Today";
            else if (daysAgo === 1) savedDate = "Yesterday";
            else if (daysAgo < 7) savedDate = `${daysAgo} days ago`;
            else if (daysAgo < 30) savedDate = `${Math.floor(daysAgo / 7)} weeks ago`;
            else savedDate = `${Math.floor(daysAgo / 30)} months ago`;

            return {
              id: f.shopper_id,
              name: profile?.display_name || "Shopper",
              image: profile?.profile_picture_url || profile?.avatar_url || "/placeholder.svg",
              location: profile?.location || "Unknown",
              savedDate,
            };
          });

          setFollowers(mappedFollowers);
        }
      } catch (error) {
        console.error("Error loading followers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFollowers();
  }, [user, open]);

  const handleViewProfile = (followerId: string) => {
    navigate(`/shopper/${followerId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Your Followers</DialogTitle>
        </DialogHeader>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapIcon className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-3 mt-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading followers...
              </div>
            ) : followers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No followers yet. Share your profile to get started!
              </div>
            ) : (
              followers.map((follower) => (
                <div
                  key={follower.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={follower.image}
                      alt={follower.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">{follower.name}</p>
                      <p className="text-sm text-muted-foreground">{follower.location}</p>
                      <p className="text-xs text-muted-foreground">Followed {follower.savedDate}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedFollower({ id: follower.id, name: follower.name });
                        setShareDialogOpen(true);
                      }}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      Share Coupon
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProfile(follower.id)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Map view coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
      {selectedFollower && (
        <ShareCouponDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          shopperId={selectedFollower.id}
          shopperName={selectedFollower.name}
        />
      )}
    </Dialog>
  );
};

export default VendorFollowersList;
