import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { List, Map as MapIcon } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Demo data
  const followers: Follower[] = [
    {
      id: "1",
      name: "Sarah Martinez",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
      location: "Portland, OR",
      savedDate: "2 days ago",
    },
    {
      id: "2",
      name: "Michael Chen",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
      location: "Seattle, WA",
      savedDate: "5 days ago",
    },
    {
      id: "3",
      name: "Emma Wilson",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
      location: "Eugene, OR",
      savedDate: "1 week ago",
    },
  ];

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
            {followers.map((follower) => (
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewProfile(follower.id)}
                >
                  View Profile
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="map" className="mt-4">
            <div className="w-full h-[400px] bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Map view coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VendorFollowersList;
