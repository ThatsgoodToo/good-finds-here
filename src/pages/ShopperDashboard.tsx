import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Hand, 
  FolderHeart, 
  Grid3x3, 
  List, 
  MapPin, 
  Settings, 
  RefreshCw, 
  Tag, 
  Sparkles, 
  X, 
  Plus,
  ExternalLink,
  Eye,
  EyeOff,
  Upload,
  Ticket,
  ChevronRight
} from "lucide-react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ShopperDashboard = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [activeTab, setActiveTab] = useState("high-fives");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [profileSettings, setProfileSettings] = useState({
    location: "Portland, Oregon",
    locationEnabled: true,
    externalLink: "",
    bio: "",
    activityPublic: false,
  });

  // Mock data - In production, fetch from Supabase
  const shopperName = user?.user_metadata?.display_name || "Your";
  const shopperImage = user?.user_metadata?.avatar_url || "";

  const folders = [
    { 
      id: "1", 
      name: "Travel", 
      count: 12,
      items: [
        { id: "1", title: "Portable Speaker", vendor: "Audio Co.", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200", type: "product" as const },
        { id: "2", title: "Travel Journal", vendor: "Paper Goods", image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200", type: "product" as const },
      ]
    },
    { 
      id: "2", 
      name: "Kid Snacks", 
      count: 8,
      items: [
        { id: "3", title: "Organic Fruit Bars", vendor: "Healthy Bites", image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=200", type: "product" as const },
      ]
    },
    { 
      id: "3", 
      name: "Free Shipping", 
      count: 15,
      items: []
    },
    { 
      id: "4", 
      name: "Music", 
      count: 6,
      items: []
    },
    { 
      id: "5", 
      name: "First Nation Vendors", 
      count: 10,
      items: []
    },
  ];

  const activeCoupons = [
    { 
      id: "1", 
      vendor: "Clay & Co.", 
      vendorId: "1",
      code: "SAVE15", 
      discount: "15% off", 
      expires: "Dec 31, 2025",
      claimed: false,
      vendorUrl: "https://clayandco.example.com"
    },
    { 
      id: "2", 
      vendor: "GINEW", 
      vendorId: "2",
      code: "HERITAGE20", 
      discount: "20% off heritage items", 
      expires: "Jan 15, 2026",
      claimed: true,
      vendorUrl: "https://ginew.example.com"
    },
    { 
      id: "3", 
      vendor: "Studio Ceramics", 
      vendorId: "3",
      code: "FREESHIP", 
      discount: "Free Shipping", 
      expires: "Feb 28, 2026",
      claimed: false,
      vendorUrl: "https://studioceramics.example.com"
    },
  ];

  const preferences = [
    { id: "1", name: "Handcrafted", category: "Type" },
    { id: "2", name: "Eco-friendly", category: "Sustainability" },
    { id: "3", name: "Local", category: "Location" },
    { id: "4", name: "Budget-friendly", category: "Price" },
    { id: "5", name: "Free Shipping", category: "Shipping" },
    { id: "6", name: "Women-Owned", category: "Ownership" },
  ];

  const newOffers = [
    { 
      id: "1", 
      title: "New Artisan Pottery Collection", 
      vendor: "Studio Ceramics", 
      vendorId: "3",
      discount: "20% off",
      image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300",
      matchedFilters: ["Handcrafted", "Local"]
    },
    { 
      id: "2", 
      title: "Organic Honey Bundle", 
      vendor: "Bee Happy Farms", 
      vendorId: "4",
      discount: "Buy 2 Get 1",
      image: "https://images.unsplash.com/photo-1587049352846-4a222e784e38?w=300",
      matchedFilters: ["Eco-friendly", "Local"]
    },
    { 
      id: "3", 
      title: "Heritage Shirt Collection", 
      vendor: "GINEW", 
      vendorId: "2",
      discount: "15% off",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300",
      matchedFilters: ["Handcrafted"]
    },
  ];

  const handleClaimCoupon = (coupon: typeof activeCoupons[0]) => {
    toast.success("Coupon claimed! Redirecting to vendor...", {
      description: `Code: ${coupon.code}`,
    });
    setTimeout(() => {
      window.open(coupon.vendorUrl, "_blank");
    }, 1000);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    toast.success(`Folder "${newFolderName}" created!`);
    setNewFolderName("");
    setShowAddFolderDialog(false);
  };

  const handleRemovePreference = (prefId: string) => {
    toast.success("Preference removed");
  };

  const getTypeDotColor = (type: "product" | "service" | "experience") => {
    switch (type) {
      case "product": return "bg-green-500";
      case "service": return "bg-blue-500";
      case "experience": return "bg-purple-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Dashboard Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity">
                  <AvatarImage src={shopperImage} />
                  <AvatarFallback className="text-lg">
                    {shopperName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{shopperName} Goods</h1>
                  <p className="text-sm text-muted-foreground">Shopper Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Toggle Vendor/Shopper */}
                {userRole === "vendor" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate("/dashboard/vendor")}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Switch to Vendor</span>
                    <span className="sm:hidden">Vendor</span>
                  </Button>
                )}
                
                {/* Settings Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>Notification Settings</DropdownMenuItem>
                    <DropdownMenuItem>Platform Messages</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                      Privacy Controls
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8">
              <TabsTrigger value="high-fives" className="gap-2">
                <Hand className="h-4 w-4" />
                <span className="hidden sm:inline">My Shop</span>
                <span className="sm:hidden">Shop</span>
              </TabsTrigger>
              <TabsTrigger value="coupons" className="gap-2">
                <Tag className="h-4 w-4" />
                <span className="hidden sm:inline">Active Coupons</span>
                <span className="sm:hidden">Coupons</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <FolderHeart className="h-4 w-4" />
                <span className="hidden sm:inline">My Preferences</span>
                <span className="sm:hidden">Filters</span>
              </TabsTrigger>
              <TabsTrigger value="new-offers" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">New Offers</span>
                <span className="sm:hidden">Offers</span>
              </TabsTrigger>
            </TabsList>

            {/* My Shop (High Fives) */}
            <TabsContent value="high-fives" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Shop</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setShowAddFolderDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Folder</span>
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "map" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("map")}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folders.map((folder) => (
                    <Card 
                      key={folder.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow group"
                      onClick={() => {
                        // Navigate to folder contents
                        toast.info(`Opening ${folder.name} folder`);
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span>{folder.name}</span>
                          <Badge variant="secondary">{folder.count}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {folder.items.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {folder.items.slice(0, 2).map((item) => (
                              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                                <img 
                                  src={item.image} 
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-1 left-1">
                                  <div className={cn("h-2 w-2 rounded-full", getTypeDotColor(item.type))} />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-24 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <FolderHeart className="h-8 w-8 opacity-50" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Hand className="h-4 w-4" />
                          Saved items
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {viewMode === "list" && (
                <div className="space-y-2">
                  {folders.map((folder) => (
                    <Card 
                      key={folder.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FolderHeart className="h-5 w-5 text-primary" />
                            <div>
                              <h3 className="font-semibold">{folder.name}</h3>
                              <p className="text-sm text-muted-foreground">{folder.count} items</p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {viewMode === "map" && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                        <p className="text-muted-foreground">Map view coming soon</p>
                        <p className="text-sm text-muted-foreground">View your saved vendors by location</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Active Coupons */}
            <TabsContent value="coupons" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Active Coupons</h2>
                <Badge variant="secondary">{activeCoupons.filter(c => !c.claimed).length} available</Badge>
              </div>
              <div className="space-y-4">
                {activeCoupons.map((coupon) => (
                  <Card key={coupon.id} className={cn(
                    "transition-all",
                    coupon.claimed && "opacity-60"
                  )}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 
                              className="font-semibold text-lg hover:text-primary cursor-pointer transition-colors"
                              onClick={() => navigate(`/vendor/${coupon.vendorId}`)}
                            >
                              {coupon.vendor}
                            </h3>
                            {coupon.claimed && (
                              <Badge variant="secondary">Claimed</Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">
                              Code: <span className="font-mono font-bold text-foreground">{coupon.code}</span>
                            </p>
                            <p className="text-sm text-primary font-medium">{coupon.discount}</p>
                            <p className="text-xs text-muted-foreground">Expires: {coupon.expires}</p>
                          </div>
                        </div>
                        <Button 
                          className="w-full sm:w-auto gap-2"
                          onClick={() => handleClaimCoupon(coupon)}
                          disabled={coupon.claimed}
                        >
                          <Ticket className="h-4 w-4" />
                          {coupon.claimed ? "Visit Store" : "Claim & Visit"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* My Preferences */}
            <TabsContent value="preferences" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Preferences</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Filter
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Filters</CardTitle>
                  <CardDescription>
                    These filters affect your New Offers, search results, and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["Type", "Sustainability", "Location", "Price", "Shipping", "Ownership"].map((category) => {
                      const categoryFilters = preferences.filter(p => p.category === category);
                      if (categoryFilters.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <h4 className="font-semibold text-sm mb-2 text-muted-foreground">{category}</h4>
                          <div className="flex flex-wrap gap-2">
                            {categoryFilters.map((pref) => (
                              <Badge 
                                key={pref.id} 
                                variant="secondary" 
                                className="px-3 py-2 text-sm flex items-center gap-2 hover:bg-muted transition-colors"
                              >
                                {pref.name}
                                <button
                                  onClick={() => handleRemovePreference(pref.id)}
                                  className="hover:text-destructive transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Offers */}
            <TabsContent value="new-offers" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">New Offers</h2>
                  <p className="text-sm text-muted-foreground">Based on your preferences and saved vendors</p>
                </div>
                <Badge variant="secondary">{newOffers.length} new</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {newOffers.map((offer) => (
                  <Card 
                    key={offer.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/vendor/${offer.vendorId}`)}
                  >
                    <div className="relative h-48">
                      <img 
                        src={offer.image} 
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-primary">
                        {offer.discount}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <CardDescription>{offer.vendor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {offer.matchedFilters.map((filter, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <SearchBar
          onSearch={() => {}}
          onToggleMap={() => {}}
          isMapView={false}
          isCentered={false}
          onWhatsgoodClick={() => navigate("/")}
        />
      </main>

      {/* Profile Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Profile & Privacy Settings</DialogTitle>
            <DialogDescription>
              Customize your profile and control what others can see
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={shopperImage} />
                  <AvatarFallback className="text-xl">
                    {shopperName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Or choose from TGT templates
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="location">Location</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="location-toggle"
                    checked={profileSettings.locationEnabled}
                    onCheckedChange={(checked) =>
                      setProfileSettings({ ...profileSettings, locationEnabled: checked })
                    }
                  />
                  <Label htmlFor="location-toggle" className="text-sm text-muted-foreground">
                    {profileSettings.locationEnabled ? "Visible" : "Hidden"}
                  </Label>
                </div>
              </div>
              <Input
                id="location"
                value={profileSettings.location}
                onChange={(e) =>
                  setProfileSettings({ ...profileSettings, location: e.target.value })
                }
                disabled={!profileSettings.locationEnabled}
                placeholder="City, State"
              />
              <p className="text-xs text-muted-foreground">
                Location syncs with map view
              </p>
            </div>

            {/* External Link */}
            <div className="space-y-2">
              <Label htmlFor="externalLink">External Link (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="externalLink"
                  value={profileSettings.externalLink}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, externalLink: e.target.value })
                  }
                  placeholder="https://yourwebsite.com"
                />
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={profileSettings.bio}
                onChange={(e) =>
                  setProfileSettings({ ...profileSettings, bio: e.target.value })
                }
                placeholder="Tell others about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {profileSettings.bio.length}/500 characters
              </p>
            </div>

            {/* Privacy Controls */}
            <div className="space-y-4">
              <h4 className="font-semibold">Privacy Controls</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {profileSettings.activityPublic ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div>
                      <Label>Activity Visibility</Label>
                      <p className="text-xs text-muted-foreground">
                        Who can see your High Fives and saved items
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={profileSettings.activityPublic}
                    onCheckedChange={(checked) =>
                      setProfileSettings({ ...profileSettings, activityPublic: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSettingsDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  toast.success("Settings saved!");
                  setShowSettingsDialog(false);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Folder Dialog */}
      <Dialog open={showAddFolderDialog} onOpenChange={setShowAddFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Organize your saved items with custom folders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Gift Ideas, Favorites, etc."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setNewFolderName("");
                  setShowAddFolderDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddFolder}
              >
                Create Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShopperDashboard;
