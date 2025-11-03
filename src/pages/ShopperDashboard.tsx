import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useVendorAccess } from "@/hooks/useVendorAccess";
import { useSavedItemsWithDetails } from "@/hooks/useSaves";
import { useFolders } from "@/hooks/useFolders";
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
  Trash2,
  HelpCircle
} from "lucide-react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import VendorSignupPrompt from "@/components/VendorSignupPrompt";
import DashboardInfoDialog from "@/components/DashboardInfoDialog";

const ShopperDashboard = () => {
  const { user, userRole, roles, activeRole, setActiveRole, loading } = useAuth();
  const { status: vendorStatus, isPending, isRejected } = useVendorAccess();
  const { savedItems, isLoading: isSavedItemsLoading, deleteSave, isDeleting } = useSavedItemsWithDetails();
  const { folders: dbFolders, isLoading: isFoldersLoading, createFolder, updateFolder, deleteFolder } = useFolders();
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
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [customFilterInput, setCustomFilterInput] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showInfoAnimation, setShowInfoAnimation] = useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [profileSettings, setProfileSettings] = useState({
    location: "Honolulu, Hawaii",
    locationPublic: true,
    externalLink: "",
    bio: "",
    highFivesPublic: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      setShowSignupModal(true);
    }
  }, [user, loading]);

  // Check if user has seen the info animation
  useEffect(() => {
    const key = "tgt_dashboard_info_seen_shopper";
    const hasSeenInfo = localStorage.getItem(key);
    
    if (!hasSeenInfo) {
      setShowInfoAnimation(true);
    }
  }, []);

  const handleInfoClick = () => {
    const key = "tgt_dashboard_info_seen_shopper";
    localStorage.setItem(key, "true");
    setShowInfoAnimation(false);
    setInfoDialogOpen(true);
  };

  // Verify user has shopper access (vendors also have shopper access)
  useEffect(() => {
    if (loading) return;
    
    const canAccessShopperDashboard = roles.includes("shopper") || roles.includes("vendor");
    
    if (!canAccessShopperDashboard && user) {
      toast.error("You need to be a shopper to access this page");
      navigate("/");
      return;
    }
    
    if (canAccessShopperDashboard && activeRole !== "shopper") {
      setActiveRole("shopper");
    }
  }, [roles, activeRole, setActiveRole, loading, user, navigate]);

  // Load privacy settings and location from backend
  useEffect(() => {
    const loadPrivacySettings = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("location_public, high_fives_public, location")
        .eq("id", user.id)
        .single();

      if (data && !error) {
        setProfileSettings((prev) => ({
          ...prev,
          location: data.location || "",
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
  const location = useLocation();

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, profile_picture_url, interests")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setShopperName(data.display_name || user.email?.split('@')[0] || "Shopper");
        setShopperImage(data.profile_picture_url || data.avatar_url || "");
        
        // Load interests from database and transform to preferences format
        if (data.interests && Array.isArray(data.interests) && data.interests.length > 0) {
          const loadedPreferences = data.interests.map((interest, index) => ({
            id: `interest-${index}-${Date.now()}`,
            name: interest,
            category: "Custom"
          }));
          setPreferences(loadedPreferences);
        } else {
          // If no interests yet, keep preferences empty
          setPreferences([]);
        }
      }
    };

    // Load profile when user is available or when returning to this route
    loadProfile();
  }, [user, location.pathname]);

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

  const handleUnsave = async (saveId: string, itemTitle: string) => {
    const confirmed = window.confirm(`Remove "${itemTitle}" from your saved items?`);
    if (!confirmed) return;
    
    await deleteSave(saveId);
  };

  // Group saved items by folder
  const groupedSavedItems = savedItems.reduce((acc, item) => {
    const folderId = item.folder_id || 'unsorted';
    if (!acc[folderId]) {
      acc[folderId] = {
        folder: item.folder_id ? dbFolders.find(f => f.id === item.folder_id) || { id: item.folder_id, name: 'Unknown', description: null } : { id: null, name: 'Unsorted', description: null },
        items: []
      };
    }
    acc[folderId].items.push(item);
    return acc;
  }, {} as Record<string, { folder: { id: string | null; name: string; description: string | null }; items: typeof savedItems }>);

  const folderGroups = Object.values(groupedSavedItems).sort((a, b) => {
    if (a.folder.id === null) return 1;
    if (b.folder.id === null) return -1;
    return 0;
  });

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
    createFolder({ name: newFolderName });
    setNewFolderName("");
    setShowAddFolderDialog(false);
  };

  const handleEditFolder = () => {
    if (!editingFolder || !newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    updateFolder({ id: editingFolder.id, name: newFolderName });
    setNewFolderName("");
    setEditingFolder(null);
    setShowEditFolderDialog(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = dbFolders.find(f => f.id === folderId);
    if (folder && window.confirm(`Delete folder "${folder.name}"?`)) {
      deleteFolder(folderId);
    }
  };

  const handleRemovePreference = async (prefId: string) => {
    const updatedPreferences = preferences.filter(p => p.id !== prefId);
    setPreferences(updatedPreferences);
    toast.success("Preference removed");
    
    // Sync to database
    if (user) {
      const interests = updatedPreferences.map(p => p.name);
      await supabase
        .from("profiles")
        .update({ interests })
        .eq("id", user.id);
    }
  };

  const handleAddPreference = async (category: string, value: string) => {
    const newPref = {
      id: Date.now().toString(),
      name: value,
      category: category
    };
    const updatedPreferences = [...preferences, newPref];
    setPreferences(updatedPreferences);
    toast.success(`Added ${value} to preferences`);
    
    // Sync to database
    if (user) {
      const interests = updatedPreferences.map(p => p.name);
      await supabase
        .from("profiles")
        .update({ interests })
        .eq("id", user.id);
    }
  };

  const handleAddCustomFilter = async () => {
    if (!customFilterInput.trim()) {
      toast.error("Please enter a filter");
      return;
    }
    const newPref = {
      id: Date.now().toString(),
      name: customFilterInput.trim(),
      category: "Custom"
    };
    const updatedPreferences = [...preferences, newPref];
    setPreferences(updatedPreferences);
    toast.success(`Added "${customFilterInput}" to preferences`);
    setCustomFilterInput("");
    
    // Sync to database
    if (user) {
      const interests = updatedPreferences.map(p => p.name);
      await supabase
        .from("profiles")
        .update({ interests })
        .eq("id", user.id);
    }
  };

  const openFolderDetails = (folderId: string) => {
    setSelectedFolderId(folderId);
  };

  const selectedFolderGroup = Object.values(groupedSavedItems).find(g => 
    g.folder.id === selectedFolderId || (selectedFolderId === 'unsorted' && g.folder.id === null)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                  <div className="flex items-center gap-2">
                    {!isEditingName ? (
                      <>
                        <h1 
                          className="text-2xl sm:text-3xl font-bold hover:text-primary cursor-pointer transition-colors"
                          onClick={() => navigate(`/shopper/${shopperName.toLowerCase().replace(/\s/g, '-')}`)}
                        >
                          {shopperName}
                        </h1>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            setIsEditingName(true);
                            setNameInput(shopperName);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              const trimmedName = nameInput.trim();
                              if (trimmedName.length < 2) {
                                toast.error("Name must be at least 2 characters");
                                return;
                              }
                              
                              if (!user) return;
                              
                              const oldName = shopperName;
                              setShopperName(trimmedName);
                              setIsEditingName(false);

                              const { error } = await supabase
                                .from('profiles')
                                .update({ display_name: trimmedName })
                                .eq('id', user.id);

                              if (error) {
                                setShopperName(oldName);
                                toast.error("Failed to update name");
                              } else {
                                toast.success("Name updated successfully");
                              }
                            } else if (e.key === 'Escape') {
                              setIsEditingName(false);
                              setNameInput(shopperName);
                            }
                          }}
                          className="h-10 text-2xl sm:text-3xl font-bold"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={async () => {
                            const trimmedName = nameInput.trim();
                            if (trimmedName.length < 2) {
                              toast.error("Name must be at least 2 characters");
                              return;
                            }
                            
                            if (!user) return;
                            
                            const oldName = shopperName;
                            setShopperName(trimmedName);
                            setIsEditingName(false);

                            const { error } = await supabase
                              .from('profiles')
                              .update({ display_name: trimmedName })
                              .eq('id', user.id);

                            if (error) {
                              setShopperName(oldName);
                              toast.error("Failed to update name");
                            } else {
                              toast.success("Name updated successfully");
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsEditingName(false);
                            setNameInput(shopperName);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Shopper Dashboard</p>
                  
                  {/* Location */}
                  <div className="flex items-center gap-2 mt-1">
                    {!isEditingLocation ? (
                      <>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>{profileSettings.location || "Add location"}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => {
                            setLocationInput(profileSettings.location);
                            setIsEditingLocation(true);
                          }}
                        >
                          <Edit2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
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
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          value={locationInput}
                          onChange={(e) => setLocationInput(e.target.value)}
                          placeholder="City, State"
                          className="h-7 text-sm max-w-[200px]"
                          autoFocus
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              const trimmedLocation = locationInput.trim();
                              
                              // Update backend
                              const { error } = await supabase
                                .from("profiles")
                                .update({ location: trimmedLocation })
                                .eq("id", user?.id);
                              
                              if (error) {
                                toast.error("Failed to update location");
                              } else {
                                setProfileSettings({
                                  ...profileSettings,
                                  location: trimmedLocation
                                });
                                setIsEditingLocation(false);
                                toast.success("Location updated");
                              }
                            } else if (e.key === "Escape") {
                              setIsEditingLocation(false);
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={async () => {
                            const trimmedLocation = locationInput.trim();
                            
                            // Update backend
                            const { error } = await supabase
                              .from("profiles")
                              .update({ location: trimmedLocation })
                              .eq("id", user?.id);
                            
                            if (error) {
                              toast.error("Failed to update location");
                            } else {
                              setProfileSettings({
                                ...profileSettings,
                                location: trimmedLocation
                              });
                              setIsEditingLocation(false);
                              toast.success("Location updated");
                            }
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => setIsEditingLocation(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
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
                    variant={activeRole === "shopper" ? "default" : "ghost"}
                    size="sm"
                    className="px-4"
                    onClick={() => {
                      if (roles.includes("shopper")) {
                        setActiveRole("shopper");
                        // Already on shopper dashboard
                      } else {
                        navigate("/signup/shopper");
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
                        // Check vendor application status
                        if (vendorStatus === "approved") {
                          setActiveRole("vendor");
                          navigate("/dashboard/vendor");
                        } else if (vendorStatus === "pending") {
                          toast.info("Your vendor application is pending approval");
                          navigate("/dashboard/vendor");
                        } else if (vendorStatus === "rejected") {
                          toast.error("Your vendor application was not approved");
                          navigate("/dashboard/vendor");
                        } else {
                          setActiveRole("vendor");
                          navigate("/dashboard/vendor");
                        }
                      } else {
                        setShowVendorSignupPrompt(true);
                      }
                    }}
                  >
                    Vendor
                  </Button>
                </div>
                
                {/* Info Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleInfoClick}
                  className={cn(
                    "relative",
                    showInfoAnimation && "animate-pulse ring-2 ring-primary ring-offset-2"
                  )}
                  aria-label="Dashboard guide and help"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
                
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
                    <DropdownMenuItem onClick={() => navigate('/settings/profile')}>
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings/account')}>
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings/notifications')}>
                      Notification Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings/privacy')}>
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
                  {isSavedItemsLoading || isFoldersLoading ? (
                    <div className="col-span-full text-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading your saved items...</p>
                    </div>
                  ) : folderGroups.length === 0 && dbFolders.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <FolderHeart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No folders yet. Create one to organize your saved items!</p>
                      <Button onClick={() => setShowAddFolderDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Folder
                      </Button>
                    </div>
                  ) : (
                    <>
                      {folderGroups.map((group) => {
                        const folderId = group.folder.id || 'unsorted';
                        return (
                          <Card 
                            key={folderId} 
                            className="cursor-pointer hover:shadow-lg transition-shadow group"
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between text-lg">
                                <span onClick={() => openFolderDetails(folderId)}>{group.folder.name}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">{group.items.length}</Badge>
                                  {group.folder.id && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Settings className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                          setEditingFolder({ id: group.folder.id!, name: group.folder.name });
                                          setNewFolderName(group.folder.name);
                                          setShowEditFolderDialog(true);
                                        }}>
                                          <Edit2 className="h-4 w-4 mr-2" />
                                          Edit Name
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteFolder(group.folder.id!)}
                                          className="text-destructive"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Folder
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent onClick={() => openFolderDetails(folderId)}>
                              {group.items.length > 0 ? (
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  {group.items.slice(0, 4).map((item) => {
                                    const imageUrl = item.save_type === 'listing' 
                                      ? item.listing?.image_url 
                                      : item.vendor?.profile_picture_url;
                                    const title = item.save_type === 'listing'
                                      ? item.listing?.title
                                      : item.vendor?.business_name;
                                    const type = item.save_type === 'listing'
                                      ? (item.listing?.listing_type as "product" | "service" | "experience" | "sale")
                                      : "service";
                                      
                                    return (
                                      <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                                        <img 
                                          src={imageUrl || '/placeholder.svg'} 
                                          alt={title || 'Saved item'}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-1 left-1">
                                          <div className={cn("h-2 w-2 rounded-full", getTypeDotColor(type))} />
                                        </div>
                                      </div>
                                    );
                                  })}
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
                        );
                      })}
                    </>
                  )}
                </div>
              )}

              {viewMode === "list" && (
                <div className="space-y-2">
                  {isSavedItemsLoading || isFoldersLoading ? (
                    <div className="text-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading your saved items...</p>
                    </div>
                  ) : folderGroups.length === 0 && dbFolders.length === 0 ? (
                    <div className="text-center py-12">
                      <FolderHeart className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No folders yet. Create one to organize your saved items!</p>
                      <Button onClick={() => setShowAddFolderDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Folder
                      </Button>
                    </div>
                  ) : (
                    folderGroups.map((group) => {
                      const folderId = group.folder.id || 'unsorted';
                      return (
                        <Card 
                          key={folderId}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => openFolderDetails(folderId)}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FolderHeart className="h-5 w-5 text-primary" />
                                <div>
                                  <h3 className="font-semibold">{group.folder.name}</h3>
                                  <p className="text-sm text-muted-foreground">{group.items.length} items</p>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
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
            <DialogTitle>{selectedFolderGroup?.folder.name}</DialogTitle>
            <DialogDescription>
              {selectedFolderGroup?.items.length || 0} saved items
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedFolderGroup?.items.map((item) => {
              const isListing = item.save_type === 'listing';
              const imageUrl = isListing 
                ? item.listing?.image_url 
                : item.vendor?.profile_picture_url;
              const title = isListing
                ? item.listing?.title
                : item.vendor?.business_name;
              const listingId = isListing ? item.target_id : null;
              const vendorId = !isListing ? item.target_id : item.listing?.vendor_id;
              const type = isListing
                ? (item.listing?.listing_type as "product" | "service" | "experience" | "sale")
                : "service";
                
              return (
                <Card key={item.id} className="overflow-hidden">
                  <div 
                    className="relative h-40 cursor-pointer" 
                    onClick={() => {
                      if (isListing && listingId) {
                        navigate(`/listing/product/${listingId}`);
                      } else if (vendorId) {
                        navigate(`/vendor/${vendorId}`);
                      }
                    }}
                  >
                    <img 
                      src={imageUrl || '/placeholder.svg'} 
                      alt={title || 'Saved item'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 left-2">
                      <div className={cn("h-3 w-3 rounded-full", getTypeDotColor(type))} />
                    </div>
                    <button
                      className="absolute top-2 right-2 p-2 rounded-full shadow-md transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsave(item.id, title || 'this item');
                      }}
                      disabled={isDeleting}
                    >
                      <Hand className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold mb-1">{title}</h3>
                    {isListing && vendorId && (
                      <p 
                        className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
                        onClick={() => navigate(`/vendor/${vendorId}`)}
                      >
                        View Vendor
                      </p>
                    )}
                    {!isListing && item.vendor && (
                      <p className="text-sm text-muted-foreground">
                        {item.vendor.city}, {item.vendor.state_region}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
      <DashboardInfoDialog 
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        dashboardType="shopper"
      />
    </div>
  );
};

export default ShopperDashboard;
