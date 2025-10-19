import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, FolderHeart, Grid3x3, List, MapPin, Settings, RefreshCw, Tag, Sparkles, X } from "lucide-react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";

const ShopperDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [activeTab, setActiveTab] = useState("high-fives");

  // Mock data
  const shopperName = user?.user_metadata?.display_name || "Your";
  const folders = [
    { id: "1", name: "Travel", count: 12 },
    { id: "2", name: "Kid Snacks", count: 8 },
    { id: "3", name: "Free Shipping", count: 15 },
    { id: "4", name: "Music", count: 6 },
  ];

  const activeCoupons = [
    { id: "1", vendor: "Clay & Co.", code: "SAVE15", discount: "15% off", expires: "Dec 31, 2025" },
    { id: "2", vendor: "Bee Happy Farms", code: "FREESHIP", discount: "Free Shipping", expires: "Jan 15, 2026" },
  ];

  const preferences = ["Handcrafted", "Eco-friendly", "Local", "Budget-friendly", "Free Shipping"];

  const newOffers = [
    { id: "1", title: "New Artisan Pottery", vendor: "Studio Ceramics", discount: "20% off" },
    { id: "2", title: "Organic Honey Bundle", vendor: "Bee Happy Farms", discount: "Buy 2 Get 1" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Dashboard Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
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
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate("/dashboard/vendor")}
                >
                  <RefreshCw className="h-4 w-4" />
                  Switch to Vendor
                </Button>
                
                {/* Settings Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>Account Settings</DropdownMenuItem>
                    <DropdownMenuItem>Notification Settings</DropdownMenuItem>
                    <DropdownMenuItem>Platform Messages</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                    <DropdownMenuItem>Privacy Controls</DropdownMenuItem>
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
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">My High Fives</span>
                <span className="sm:hidden">High Fives</span>
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

            {/* My High Fives */}
            <TabsContent value="high-fives" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My High Fives</h2>
                <div className="flex items-center gap-2">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <Card key={folder.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-lg">{folder.name}</span>
                        <Badge variant="secondary">{folder.count}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FolderHeart className="h-4 w-4" />
                        Saved items
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Active Coupons */}
            <TabsContent value="coupons" className="space-y-6">
              <h2 className="text-2xl font-bold">Active Coupons</h2>
              <div className="space-y-4">
                {activeCoupons.map((coupon) => (
                  <Card key={coupon.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{coupon.vendor}</h3>
                          <p className="text-sm text-muted-foreground">
                            Code: <span className="font-mono font-bold">{coupon.code}</span>
                          </p>
                          <p className="text-sm text-primary">{coupon.discount}</p>
                          <p className="text-xs text-muted-foreground">Expires: {coupon.expires}</p>
                        </div>
                        <Button className="w-full sm:w-auto">
                          Claim & Visit Store
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
                <Button variant="outline" size="sm">
                  Edit Filters
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Filters</CardTitle>
                  <CardDescription>
                    These filters affect your dashboard content and search results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {preferences.map((pref, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-2 text-sm flex items-center gap-2">
                        {pref}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Offers */}
            <TabsContent value="new-offers" className="space-y-6">
              <h2 className="text-2xl font-bold">New Offers</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {newOffers.map((offer) => (
                  <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{offer.title}</CardTitle>
                      <CardDescription>{offer.vendor}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="text-sm">
                          {offer.discount}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Offer
                        </Button>
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
    </div>
  );
};

export default ShopperDashboard;
