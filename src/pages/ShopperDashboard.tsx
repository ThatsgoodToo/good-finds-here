import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import SignupModal from "@/components/SignupModal";
import OnboardingTutorial from "@/components/OnboardingTutorial";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Hand, 
  FolderHeart, 
  Grid3x3, 
  List, 
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
  ChevronRight,
  Edit2,
  Trash2
} from "lucide-react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import VendorSignupPrompt from "@/components/VendorSignupPrompt";

interface FolderItem {
  id: string;
  title: string;
  vendor: string;
  vendorId: string;
  image: string;
  type: "product" | "service" | "experience";
  saved: boolean;
}

interface Folder {
  id: string;
  name: string;
  count: number;
  items: FolderItem[];
}

const ShopperDashboard = () => {
  const { user, userRole, roles, activeRole, setActiveRole } = useAuth();
  const [showVendorSignupPrompt, setShowVendorSignupPrompt] = useState(false);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [activeTab, setActiveTab] = useState("high-fives");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [showEditFolderDialog, setShowEditFolderDialog] = useState(false);
  const [showAddPreferenceDialog, setShowAddPreferenceDialog] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [customFilterInput, setCustomFilterInput] = useState("");
  const [profileSettings, setProfileSettings] = useState({
    location: "Honolulu, Hawaii",
    locationPublic: true,
    externalLink: "",
    bio: "",
    highFivesPublic: true,
  });

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Set active role to shopper when on this page
  useEffect(() => {
    if (roles.includes("shopper") && activeRole !== "shopper") {
      setActiveRole("shopper");
    }
  }, [roles, activeRole, setActiveRole]);

  // Load privacy settings and location from backend
  useEffect(() => {
    const loadPrivacySettings = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("location_public, high_fives_public, city, state_region, country")
        .eq("id", user.id)
        .single();

      if (data && !error) {
        // Build location string from city, state, country
        const locationParts = [data.city, data.state_region, data.country].filter(Boolean);
        const locationString = locationParts.length > 0 ? locationParts.join(", ") : "";
        
        setProfileSettings((prev) => ({
          ...prev,
          location: locationString,
          locationPublic: data.location_public ?? true,
          highFivesPublic: data.high_fives_public ?? true,
        }));
      }
    };

    loadPrivacySettings();
  }, [user]);

  // Load user profile data
  const [shopperName, setShopperName] = useState("");
  const [shopperImage, setShopperImage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, profile_picture_url")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setShopperName(data.display_name || user.email?.split('@')[0] || "Shopper");
        setShopperImage(data.profile_picture_url || data.avatar_url || "");
      }
    };

    loadProfile();
  }, [user]);

  // Standard filter categories with options
  const standardFilters = {
    "Size": ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
    "Color": ["Red", "Blue", "Green", "Yellow", "Black", "White", "Brown", "Pink", "Purple", "Orange"],
    "Material": ["Cotton", "Wool", "Silk", "Leather", "Wood", "Metal", "Glass", "Ceramic", "Plastic"],
    "Price Range": ["Under $25", "$25-$50", "$50-$100", "$100-$200", "Over $200"],
    "Shipping": ["Free Shipping", "Ships Worldwide", "Local Pickup", "Same Day"],
    "Sustainability": ["Eco-friendly", "Recycled Materials", "Low-waste", "Carbon Neutral"],
    "Ownership": ["Women-Owned", "BIPOC-Owned", "LGBTQ+-Owned", "Veteran-Owned", "Family-Owned"],
    "Type": ["Handcrafted", "Vintage", "Custom Made", "Small Batch", "Mass Produced"],
  };

  const [preferences, setPreferences] = useState<Array<{ id: string; name: string; category: string }>>([]);

  const [folders, setFolders] = useState<Folder[]>([]);

  const [activeCoupons, setActiveCoupons] = useState<Array<{
    id: string;
    vendor: string;
    vendorId: string;
    code: string;
    discount: string;
    expires: string;
    claimed: boolean;
    vendorUrl: string;
    thumbnail: string;
    listingTitle: string;
  }>>([]);

  const [newOffers, setNewOffers] = useState<Array<{
    id: string;
    title: string;
    vendor: string;
    vendorId: string;
    discount: string;
    image: string;
    matchedFilters: string[];
  }>>([]);

  const getTypeDotColor = (type: "product" | "service" | "experience" | "sale") => {
    switch (type) {
      case "product": return "bg-[hsl(var(--product))]";
      case "service": return "bg-[hsl(var(--service))]";
      case "experience": return "bg-[hsl(var(--experience))]";
      case "sale": return "bg-[hsl(var(--sale))]";
      default: return "bg-foreground";
    }
  };

  const handleToggleSave = (folderId: string, itemId: string) => {
    setFolders(folders.map(folder => {
      if (folder.id === folderId) {
        return {
          ...folder,
          items: folder.items.map(item => 
            item.id === itemId ? { ...item, saved: !item.saved } : item
          ),
          count: folder.items.filter(item => 
            item.id === itemId ? !item.saved : item.saved
          ).length
        };
      }
      return folder;
    }));
    
    const item = folders.find(f => f.id === folderId)?.items.find(i => i.id === itemId);
    if (item) {
      toast.success(item.saved ? "Removed from folder" : "Added back to folder");
    }
  };

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
    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      count: 0,
      items: []
    };
    setFolders([...folders, newFolder]);
    toast.success(`Folder "${newFolderName}" created!`);
    setNewFolderName("");
    setShowAddFolderDialog(false);
  };

  const handleEditFolder = () => {
    if (!editingFolder || !newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    setFolders(folders.map(f => 
      f.id === editingFolder.id ? { ...f, name: newFolderName } : f
    ));
    toast.success("Folder name updated!");
    setNewFolderName("");
    setEditingFolder(null);
    setShowEditFolderDialog(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder && window.confirm(`Delete folder "${folder.name}"?`)) {
      setFolders(folders.filter(f => f.id !== folderId));
      toast.success("Folder deleted");
    }
  };

  const handleRemovePreference = (prefId: string) => {
    setPreferences(preferences.filter(p => p.id !== prefId));
    toast.success("Preference removed");
  };

  const handleAddPreference = (category: string, value: string) => {
    const newPref = {
      id: Date.now().toString(),
      name: value,
      category: category
    };
    setPreferences([...preferences, newPref]);
    toast.success(`Added ${value} to preferences`);
  };

  const handleAddCustomFilter = () => {
    if (!customFilterInput.trim()) {
      toast.error("Please enter a filter");
      return;
    }
    const newPref = {
      id: Date.now().toString(),
      name: customFilterInput.trim(),
      category: "Custom"
    };
    setPreferences([...preferences, newPref]);
    toast.success(`Added "${customFilterInput}" to preferences`);
    setCustomFilterInput("");
  };

  const openFolderDetails = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const selectedFolder = folders.find(f => f.id === selectedFolderId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <OnboardingTutorial />
      
      <main className="pt-16 sm:pt-20 pb-24">
        {/* Dashboard Header */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={shopperImage} />
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {shopperName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={async () => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (!file || !user) return;

                        try {
                          const { uploadFile, getUserPath } = await import("@/lib/storage");
                          const path = getUserPath(user.id, file.name);
                          const { url } = await uploadFile({
                            bucket: "profile-pictures",
                            file,
                            path,
                          });

                          const { error } = await supabase
                            .from("profiles")
                            .update({ avatar_url: url })
                            .eq("id", user.id);

                          if (error) throw error;

                          toast.success("Profile picture updated!");
                        } catch (error) {
                          console.error("Upload failed:", error);
                          toast.error("Failed to upload profile picture");
                        }
                      };

                      input.click();
                    }}
                  >
                    <Upload className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h1 
                    className="text-2xl sm:text-3xl font-bold hover:text-primary cursor-pointer transition-colors"
                    onClick={() => navigate(`/shopper/${shopperName.toLowerCase().replace(/\s/g, '-')}`)}
                  >
                    {shopperName} Goods
                  </h1>
                  <p className="text-sm text-muted-foreground">Shopper Dashboard</p>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{profileSettings.location}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      title={profileSettings.locationPublic ? "Visible to public" : "Hidden from public"}
                      onClick={async () => {
                        const newValue = !profileSettings.locationPublic;
                        // Optimistic update
                        setProfileSettings({
                          ...profileSettings,
                          locationPublic: newValue
                        });
                        
                        // Update backend
                        const { error } = await supabase
                          .from("profiles")
                          .update({ location_public: newValue })
                          .eq("id", user?.id);
                        
                        if (error) {
                          // Revert on error
                          setProfileSettings({
                            ...profileSettings,
                            locationPublic: !newValue
                          });
                          toast.error("Failed to update location visibility");
                        } else {
                          toast.success(newValue ? "Location visible to public" : "Location hidden from public");
                        }
                      }}
                    >
                      {profileSettings.locationPublic ? (
                        <Eye className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <EyeOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  
                  {/* External Link */}
                  {profileSettings.externalLink && (
                    <a
                      href={profileSettings.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Toggle between Vendor and Shopper - Always visible */}
                <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                  <Button
                    variant={activeRole === "shopper" || !roles.includes("vendor") ? "default" : "ghost"}
                    size="sm"
                    className="px-4"
                    onClick={() => {
                      if (roles.includes("vendor")) {
                        setActiveRole("shopper");
                        navigate("/dashboard/shopper");
                      } else {
                        setShowVendorSignupPrompt(true);
                      }
                    }}
                  >
                    Shopper
                  </Button>
                  <Button
                    variant={activeRole === "vendor" ? "default" : "ghost"}
                    size="sm"
                    className="px-4"
                    onClick={() => {
                      if (roles.includes("vendor")) {
                        setActiveRole("vendor");
                        navigate("/dashboard/vendor");
                      } else {
                        setShowVendorSignupPrompt(true);
                      }
                    }}
                  >
                    Vendor
                  </Button>
                </div>
                
                {/* Settings Gear Icon */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {roles.includes("vendor") && (
                      <>
                        <DropdownMenuItem onClick={() => {
                          setActiveRole("vendor");
                          navigate("/dashboard/vendor");
                        }}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Switch to Vendor Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => navigate(`/shopper/${shopperName.toLowerCase().replace(/\s/g, '-')}`)}>
                      View Public Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowSettingsDialog(true)}>
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Notification Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Platform Messages
                    </DropdownMenuItem>
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
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Hand className="h-6 w-6" />
                  My Shop
                  <Button
                    variant="ghost"
                    size="icon"
                    title={profileSettings.highFivesPublic ? "Shop visible to public" : "Shop hidden from public"}
                    onClick={async () => {
                      const newValue = !profileSettings.highFivesPublic;
                      // Optimistic update
                      setProfileSettings({
                        ...profileSettings,
                        highFivesPublic: newValue
                      });
                      
                      // Update backend
                      const { error } = await supabase
                        .from("profiles")
                        .update({ high_fives_public: newValue })
                        .eq("id", user?.id);
                      
                      if (error) {
                        // Revert on error
                        setProfileSettings({
                          ...profileSettings,
                          highFivesPublic: !newValue
                        });
                        toast.error("Failed to update shop visibility");
                      } else {
                        toast.success(newValue ? "Shop visible to public" : "Shop hidden from public");
                      }
                    }}
                  >
                    {profileSettings.highFivesPublic ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </h2>
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
                    Map
                  </Button>
                </div>
              </div>

              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {folders.map((folder) => (
                    <Card 
                      key={folder.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow group"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-lg">
                          <span onClick={() => openFolderDetails(folder.id)}>{folder.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{folder.count}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingFolder(folder);
                                  setNewFolderName(folder.name);
                                  setShowEditFolderDialog(true);
                                }}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit Name
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteFolder(folder.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Folder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent onClick={() => openFolderDetails(folder.id)}>
                        {folder.items.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {folder.items.slice(0, 4).map((item) => (
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
                      onClick={() => openFolderDetails(folder.id)}
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
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Listing Thumbnail */}
                        <div 
                          className="relative w-full sm:w-32 h-32 rounded-lg overflow-hidden cursor-pointer group shrink-0"
                          onClick={() => navigate(`/listing/product/${coupon.id}`)}
                        >
                          <img 
                            src={coupon.thumbnail} 
                            alt={coupon.listingTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <Badge className="absolute top-2 right-2 bg-primary text-xs">
                            {coupon.discount}
                          </Badge>
                        </div>
                        
                        {/* Coupon Details */}
                        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                            <p 
                              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-2"
                              onClick={() => navigate(`/listing/product/${coupon.id}`)}
                            >
                              {coupon.listingTitle}
                            </p>
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">
                                Code: <span className="font-mono font-bold text-foreground">{coupon.code}</span>
                              </p>
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => setShowAddPreferenceDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Browse Filters
                </Button>
              </div>

              {/* Add Custom Filter */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Custom Filter</CardTitle>
                  <CardDescription>
                    Type your own custom filter preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Vegan, Organic, Local Artist..."
                      value={customFilterInput}
                      onChange={(e) => setCustomFilterInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddCustomFilter();
                        }
                      }}
                    />
                    <Button onClick={handleAddCustomFilter}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Filters</CardTitle>
                  <CardDescription>
                    Your personalized filters for search and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {preferences.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No filters added yet. Add some to personalize your experience!
                      </p>
                    ) : (
                      preferences.map((pref) => (
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
                      ))
                    )}
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
          isCentered={false}
          onWhatsgoodClick={() => navigate("/")}
        />
      </main>

      {/* Folder Details Dialog */}
      <Dialog open={!!selectedFolderId} onOpenChange={() => setSelectedFolderId(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedFolder?.name}</DialogTitle>
            <DialogDescription>
              {selectedFolder?.count} saved items
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedFolder?.items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-40 cursor-pointer" onClick={() => navigate(`/listing/product/${item.id}`)}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 left-2">
                    <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(item.type))} />
                  </div>
                  <button
                    className={cn(
                      "absolute top-2 right-2 p-2 rounded-full shadow-md transition-all",
                      item.saved
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-background/90 hover:bg-background text-foreground"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSave(selectedFolder.id, item.id);
                    }}
                  >
                    <Hand 
                      className={cn("h-5 w-5", item.saved && "fill-current")} 
                    />
                  </button>
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p 
                    className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
                    onClick={() => navigate(`/vendor/${item.vendorId}`)}
                  >
                    {item.vendor}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {shopperName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Button>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Your Location</Label>
              <Input
                id="location"
                value={profileSettings.location}
                onChange={(e) =>
                  setProfileSettings({ ...profileSettings, location: e.target.value })
                }
                placeholder="City, State"
              />
              <p className="text-xs text-muted-foreground">
                This will be shown on your profile based on your privacy settings below.
              </p>
            </div>

            {/* External Link */}
            <div className="space-y-2">
              <Label htmlFor="external-link">External Link</Label>
              <div className="flex gap-2">
                <Input
                  id="external-link"
                  value={profileSettings.externalLink}
                  onChange={(e) =>
                    setProfileSettings({ ...profileSettings, externalLink: e.target.value })
                  }
                  placeholder="https://yourwebsite.com or @username"
                />
                <Button variant="outline" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add a link to your website, social profile, or portfolio
              </p>
            </div>

            {/* Bio/Description */}
            <div className="space-y-2">
              <Label htmlFor="bio">Description</Label>
              <Textarea
                id="bio"
                value={profileSettings.bio}
                onChange={(e) =>
                  setProfileSettings({ ...profileSettings, bio: e.target.value })
                }
                placeholder="Write a short bio about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Share a little about yourself (optional)
              </p>
            </div>

            {/* Privacy Controls */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Privacy Controls</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage what others can see on your public profile
                </p>
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Location</Label>
                    <p className="text-xs text-muted-foreground">
                      Display your location on your public profile
                    </p>
                  </div>
                  <Switch
                    checked={profileSettings.locationPublic}
                    onCheckedChange={(checked) =>
                      setProfileSettings({ ...profileSettings, locationPublic: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show High-Fives</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow others to see your saved items and activity
                    </p>
                  </div>
                  <Switch
                    checked={profileSettings.highFivesPublic}
                    onCheckedChange={(checked) =>
                      setProfileSettings({ ...profileSettings, highFivesPublic: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success("Profile settings saved!");
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

      {/* Edit Folder Dialog */}
      <Dialog open={showEditFolderDialog} onOpenChange={setShowEditFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Folder Name</DialogTitle>
            <DialogDescription>
              Rename "{editingFolder?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editFolderName">Folder Name</Label>
              <Input
                id="editFolderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter new folder name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setNewFolderName("");
                  setEditingFolder(null);
                  setShowEditFolderDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleEditFolder}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Preference Dialog */}
      <Dialog open={showAddPreferenceDialog} onOpenChange={setShowAddPreferenceDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Filter Preferences</DialogTitle>
            <DialogDescription>
              Select from standard filters to customize your experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {Object.entries(standardFilters).map(([category, options]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-semibold text-sm">{category}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {options.map((option) => {
                    const isSelected = preferences.some(
                      p => p.category === category && p.name === option
                    );
                    return (
                      <Button
                        key={option}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => {
                          if (isSelected) {
                            const pref = preferences.find(
                              p => p.category === category && p.name === option
                            );
                            if (pref) handleRemovePreference(pref.id);
                          } else {
                            handleAddPreference(category, option);
                          }
                        }}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
      <VendorSignupPrompt 
        open={showVendorSignupPrompt} 
        onOpenChange={setShowVendorSignupPrompt}
      />
    </div>
  );
};

export default ShopperDashboard;
