import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SignupModal from "@/components/SignupModal";
import Header from "@/components/Header";
import VendorPendingApproval from "@/components/VendorPendingApproval";
import VendorApplicationRejected from "@/components/VendorApplicationRejected";
import { useVendorAccess } from "@/hooks/useVendorAccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Upload, X, Plus, ChevronLeft, Hand, CheckCircle, ExternalLink, Link, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ListingType = "product" | "service" | "viewerbase";

const VendorNewListing = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const { user } = useAuth();
  const { status: vendorStatus, isLoading: checkingStatus } = useVendorAccess();
  const isEditMode = !!listingId;
  const [loading, setLoading] = useState(false);
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [inventory, setInventory] = useState("");
  const [category, setCategory] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [shippingOptions, setShippingOptions] = useState<string[]>([]);
  const [hasActiveOffer, setHasActiveOffer] = useState(false);
  const [offerDetails, setOfferDetails] = useState("");
  const [offerExpiry, setOfferExpiry] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoEmbeds, setVideoEmbeds] = useState<string[]>([]);
  const [audioEmbeds, setAudioEmbeds] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newAudioUrl, setNewAudioUrl] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customSubcategory, setCustomSubcategory] = useState("");
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(0);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [importError, setImportError] = useState<{
    show: boolean;
    message: string;
    suggestedTitle: string | null;
    sourceUrl: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);
  
  // Load existing listing data if in edit mode
  useEffect(() => {
    const loadListing = async () => {
      if (!isEditMode || !listingId) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", listingId)
          .single();

        if (error) throw error;

        if (data) {
          setListingType(data.listing_type as ListingType);
          setTitle(data.title);
          setDescription(data.description || "");
          setPrice(data.price?.toString() || "");
          setIsFree(!data.price || data.price === 0);
          setCategory(data.category || "");
          setSubcategories(data.categories || []);
          setSourceUrl(data.source_url || "");
          
          // Load media
          if (data.image_url) {
            setImages([data.image_url]);
          }
        }
      } catch (error) {
        console.error("Error loading listing:", error);
        toast.error("Failed to load listing");
        navigate("/dashboard/vendor");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [isEditMode, listingId, navigate]);
  
  // Load real vendor data
  const [vendorProfile, setVendorProfile] = useState<{
    name: string;
    logo: string;
    website: string;
    location: string;
    verified: boolean;
    ownership: string;
    expertise: string;
  } | null>(null);

  const [hasExistingActiveOffers, setHasExistingActiveOffers] = useState(false);

  // Load vendor profile data
  useEffect(() => {
    const loadVendorProfile = async () => {
      if (!user) return;
      
      const { data: vendor } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, profile_picture_url")
        .eq("id", user.id)
        .maybeSingle();

      if (vendor) {
        setVendorProfile({
          name: vendor.business_type || profile?.display_name || "Your Business",
          logo: profile?.profile_picture_url || profile?.avatar_url || "",
          website: vendor.website || "",
          location: `${vendor.city}, ${vendor.state_region}`,
          verified: vendor.status === "active",
          ownership: vendor.business_type || "",
          expertise: vendor.area_of_expertise?.[0] || vendor.business_duration || "",
        });
      }
    };

    loadVendorProfile();
  }, [user]);

  // Load real active offers status
  useEffect(() => {
    const checkActiveOffers = async () => {
      if (!user) return;
      
      const { data: activeCoupons } = await supabase
        .from("coupons")
        .select("id")
        .eq("vendor_id", user.id)
        .eq("active_status", true)
        .limit(1);

      setHasExistingActiveOffers((activeCoupons?.length || 0) > 0);
    };

    checkActiveOffers();
  }, [user]);

  const categories = [
    "Textiles & Apparel",
    "Ceramics & Pottery",
    "Culinary & Food",
    "Music & Audio",
    "Art & Visual",
    "Crafts & Handmade",
    "Wellness & Beauty",
    "Home & Decor",
    "Experiences & Workshops",
    "Other",
  ];

  const shippingOptionsAvailable = [
    "Shipping",
    "Local Pickup",
    "In Person",
    "Virtual/Digital",
    "Other",
  ];

  const requiresActiveOffer = (listingType === "product" || listingType === "service") && !hasExistingActiveOffers && !isFree;

  // Extract metadata from URL for auto-fill
  const extractUrlMetadata = async (url: string): Promise<{
    title: string;
    description: string;
    image: string | null;
    price?: string | null;
    currency?: string;
  } | null> => {
    try {
      console.log('Fetching metadata for URL:', url);
      
      const { data, error } = await supabase.functions.invoke('fetch-url-metadata', {
        body: { url }
      });

      if (error) {
        console.error('Error fetching URL metadata:', error);
        toast.error('Could not fetch URL details. Please enter manually.');
        return null;
      }

      if (data.error) {
        console.warn('Metadata fetch returned error:', data.error);
        toast.warning(data.error);
        return null;
      }

      console.log('Metadata fetched successfully:', data);
      return {
        title: data.title,
        description: data.description,
        image: data.image,
        price: data.price,
        currency: data.currency
      };
    } catch (e) {
      console.error('Exception fetching URL metadata:', e);
      toast.error('Could not fetch URL details. Please enter manually.');
      return null;
    }
  };

  // Import product from URL
  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    const loadingToast = toast.loading('Importing product details...');
    
    try {
      const metadata = await extractUrlMetadata(importUrl);
      
      if (metadata) {
        // Success path - same as before
        setTitle(metadata.title);
        setDescription(metadata.description);
        
        if (metadata.image) {
          setImages([metadata.image]);
        }
        
        if (metadata.price) {
          setPrice(metadata.price);
          setIsFree(false);
        }
        
        // Add URL to appropriate media type
        const hostname = new URL(importUrl).hostname.toLowerCase();
        if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
          setVideoEmbeds([importUrl]);
        } else if (hostname.includes('spotify') || hostname.includes('soundcloud')) {
          setAudioEmbeds([importUrl]);
        }
        
        setShowImportDialog(false);
        setImportUrl("");
        setImportError(null);
        toast.success('Product details imported successfully!', { id: loadingToast });
      } else {
        // ENHANCED FAILURE PATH
        toast.dismiss(loadingToast);
        
        // Try to extract basic info from URL
        const urlObj = new URL(importUrl);
        const hostname = urlObj.hostname.replace('www.', '');
        const pathname = urlObj.pathname;
        
        // Extract potential title from URL slug
        const urlParts = pathname.split('/').filter(p => p.length > 0);
        const lastPart = urlParts[urlParts.length - 1];
        const potentialTitle = lastPart
          ?.replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .replace(/\.\w+$/, ''); // Remove file extensions
        
        // Detect site type for better messaging
        const isEcommerce = hostname.includes('etsy') || 
                           hostname.includes('amazon') || 
                           hostname.includes('ebay') ||
                           hostname.includes('shopify');
        
        // Show manual entry option with pre-filled data
        setImportError({
          show: true,
          message: isEcommerce 
            ? `${hostname} blocks automatic imports. Let's create your listing manually!`
            : `We couldn't read this page automatically. Let's create your listing manually!`,
          suggestedTitle: potentialTitle || null,
          sourceUrl: importUrl
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      
      // Parse error for better messaging
      try {
        const urlObj = new URL(importUrl);
        const hostname = urlObj.hostname.replace('www.', '');
        
        setImportError({
          show: true,
          message: 'There was a problem reading this URL. Let\'s create your listing manually!',
          suggestedTitle: null,
          sourceUrl: importUrl
        });
      } catch {
        toast.error('Invalid URL format', { id: loadingToast });
      }
    }
  };

  // Generate preview image from URL
  const generateUrlPreview = (url: string, type: 'video' | 'audio'): string | null => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '').toLowerCase();
      
      // Check for YouTube
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
      
      // Check for Vimeo
      if (hostname.includes('vimeo.com')) {
        // Vimeo thumbnails require API call, so we'll use a placeholder for now
        return `https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=450&fit=crop`;
      }
      
      // Check for Spotify
      if (hostname.includes('spotify.com')) {
        return `https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&h=800&fit=crop`;
      }
      
      // Check for SoundCloud
      if (hostname.includes('soundcloud.com')) {
        return `https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop`;
      }
      
      // Generic placeholder based on type
      if (type === 'video') {
        return `https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&h=450&fit=crop`;
      } else {
        return `https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop`;
      }
    } catch (e) {
      return null;
    }
  };

  // Extract YouTube video ID from various URL formats
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleAddImage = async () => {
    if (newImageUrl && images.length < 5) {
      setImages([...images, newImageUrl]);
      
      // Extract metadata and auto-fill
      const metadata = await extractUrlMetadata(newImageUrl);
      if (metadata) {
        if (!title.trim()) {
          setTitle(metadata.title);
          toast.info("Title auto-filled from image URL");
        }
        if (!description.trim()) {
          setDescription(metadata.description);
          toast.info("Description auto-filled from image URL");
        }
      }
      
      setNewImageUrl("");
    } else if (images.length >= 5) {
      toast.error("Maximum 5 images allowed");
    }
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      
      if (files.length + images.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      if (!user) {
        toast.error("You must be logged in to upload images");
        return;
      }

      const uploadPromises = files.map(async (file) => {
        try {
          const { uploadFile, getUserPath } = await import("@/lib/storage");
          const path = getUserPath(user.id, file.name);
          const { url } = await uploadFile({
            bucket: "product-images",
            file,
            path,
          });
          return url;
        } catch (error) {
          console.error("Upload failed:", error);
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(Boolean) as string[];
      if (uploadedUrls.length > 0) {
        setImages(prev => [...prev, ...uploadedUrls]);
        toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
      }
    };

    input.click();
  };

  const handleAddVideo = async () => {
    if (newVideoUrl && videoEmbeds.length < 5) {
      const loadingToast = toast.loading('Fetching video details...');
      
      try {
        setVideoEmbeds([...videoEmbeds, newVideoUrl]);
        
        // Extract metadata and auto-fill
        const metadata = await extractUrlMetadata(newVideoUrl);
        
        if (metadata) {
          // Auto-fill title if empty
          if (!title.trim()) {
            setTitle(metadata.title);
            toast.success('Title auto-filled from video', { id: loadingToast });
          } else {
            toast.dismiss(loadingToast);
          }
          
          // Auto-fill description if empty
          if (!description.trim()) {
            setDescription(metadata.description);
          }
          
          // Add preview image if available
          if (metadata.image && images.length < 5) {
            setImages([...images, metadata.image]);
            toast.success('Preview image added from video');
          }
        } else {
          toast.dismiss(loadingToast);
        }
        
        setNewVideoUrl("");
      } catch (error) {
        toast.error('Failed to process video URL', { id: loadingToast });
      }
    } else if (videoEmbeds.length >= 5) {
      toast.error("Maximum 5 videos allowed");
    }
  };

  const handleAddAudio = async () => {
    if (newAudioUrl && audioEmbeds.length < 5) {
      const loadingToast = toast.loading('Fetching audio details...');
      
      try {
        setAudioEmbeds([...audioEmbeds, newAudioUrl]);
        
        // Extract metadata and auto-fill
        const metadata = await extractUrlMetadata(newAudioUrl);
        
        if (metadata) {
          // Auto-fill title if empty
          if (!title.trim()) {
            setTitle(metadata.title);
            toast.success('Title auto-filled from audio', { id: loadingToast });
          } else {
            toast.dismiss(loadingToast);
          }
          
          // Auto-fill description if empty
          if (!description.trim()) {
            setDescription(metadata.description);
          }
          
          // Add preview image if available
          if (metadata.image && images.length < 5) {
            setImages([...images, metadata.image]);
            toast.success('Preview image added from audio');
          }
        } else {
          toast.dismiss(loadingToast);
        }
        
        setNewAudioUrl("");
      } catch (error) {
        toast.error('Failed to process audio URL', { id: loadingToast });
      }
    } else if (audioEmbeds.length >= 5) {
      toast.error("Maximum 5 audio embeds allowed (including 1 playlist)");
    }
  };

  const toggleSubcategory = (sub: string) => {
    if (subcategories.includes(sub)) {
      setSubcategories(subcategories.filter((s) => s !== sub));
    } else {
      setSubcategories([...subcategories, sub]);
    }
  };

  const toggleShipping = (option: string) => {
    if (shippingOptions.includes(option)) {
      setShippingOptions(shippingOptions.filter((o) => o !== option));
    } else {
      setShippingOptions([...shippingOptions, option]);
    }
  };

  // Check vendor access status
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (vendorStatus === "pending") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <VendorPendingApproval />
      </div>
    );
  }

  if (vendorStatus === "rejected") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <VendorApplicationRejected />
      </div>
    );
  }

  if (vendorStatus === "no-application") {
    navigate("/signup/vendor");
    return null;
  }

  const handleSubmit = async () => {
    // Validation
    if (!listingType) {
      toast.error("Please select a listing type");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (requiresActiveOffer && !hasActiveOffer) {
      toast.error("You must add an active offer for this listing");
      return;
    }
    if (hasActiveOffer && !offerDetails.trim()) {
      toast.error("Please provide offer details");
      return;
    }
    // Validation - require at least one media item (image, video, or audio URL)
    if (images.length === 0 && videoEmbeds.length === 0 && audioEmbeds.length === 0) {
      toast.error("Please provide at least one media item: image, video URL, or audio URL");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to save a listing");
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        vendor_id: user.id,
        title: title.trim(),
        description: description.trim(),
        listing_type: listingType,
        price: isFree ? 0 : parseFloat(price) || null,
        category: category || null,
        categories: subcategories,
        image_url: images[0] || null,
        source_url: sourceUrl.trim() || null,
        status: "active"
      };

      if (isEditMode && listingId) {
        // Update existing listing
        const { error } = await supabase
          .from("listings")
          .update(listingData)
          .eq("id", listingId);

        if (error) throw error;
        toast.success("Listing updated successfully!");
      } else {
        // Create new listing
        const { error } = await supabase
          .from("listings")
          .insert([listingData]);

        if (error) throw error;
        toast.success("Listing created successfully!");
      }
      
      navigate("/dashboard/vendor");
    } catch (error) {
      console.error("Error saving listing:", error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} listing`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16 sm:pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate("/dashboard/vendor")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-4"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-6">
            {isEditMode ? "Edit Listing" : "Create New Listing"}
          </h1>

          {/* Import from URL Button */}
          <div className="mb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="w-full sm:w-auto"
            >
              <Link className="h-4 w-4 mr-2" />
              Import Product from URL
            </Button>
          </div>

          {/* Import Dialog */}
          <Dialog open={showImportDialog} onOpenChange={(open) => {
            setShowImportDialog(open);
            if (!open) {
              setImportError(null);
              setImportUrl("");
            }
          }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Product from URL</DialogTitle>
                <DialogDescription>
                  {!importError?.show ? (
                    "Paste a product URL and we'll try to automatically fill in the details."
                  ) : (
                    "No problem! Let's create your listing manually."
                  )}
                </DialogDescription>
              </DialogHeader>
              
              {!importError?.show ? (
                // Standard import view
                <div className="space-y-4">
                  <Input
                    placeholder="https://www.etsy.com/listing/..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleImportFromUrl()}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => {
                      setShowImportDialog(false);
                      setImportUrl("");
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleImportFromUrl}>
                      Import Product
                    </Button>
                  </div>
                </div>
              ) : (
                // Manual entry guidance view
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {importError.message}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <p className="font-medium text-sm">📝 Quick Tips:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Open the product page in another tab</li>
                      <li>• Copy the title, description, and price</li>
                      <li>• Right-click images and copy image URLs</li>
                    </ul>
                  </div>
                  
                  {importError.suggestedTitle && (
                    <div className="space-y-2">
                      <Label>We found this in the URL:</Label>
                      <Input 
                        value={importError.suggestedTitle}
                        readOnly
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        You can use this as your title or change it
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Reference URL (saved for your records)</Label>
                    <Input 
                      value={importError.sourceUrl}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll save this URL so you can reference it later
                    </p>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setImportError(null);
                        setImportUrl("");
                      }}
                    >
                      Try Different URL
                    </Button>
                    <Button 
                      onClick={() => {
                        // Apply suggested data and close dialog
                        if (importError.suggestedTitle) {
                          setTitle(importError.suggestedTitle);
                        }
                        setSourceUrl(importError.sourceUrl);
                        setShowImportDialog(false);
                        setImportError(null);
                        setImportUrl("");
                        toast.success('Ready to fill in the details!');
                      }}
                    >
                      Fill Form Manually
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Split Layout - Form & Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT - Form */}
            <div className="space-y-6">
              {/* Listing Type */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="listingType" className="text-base font-semibold">Listing Type *</Label>
                    <Select value={listingType} onValueChange={(val) => setListingType(val as ListingType)}>
                      <SelectTrigger id="listingType" className="mt-2">
                        <SelectValue placeholder="Select listing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="viewerbase">Viewer Base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {listingType && (
                    <div className="flex items-center gap-2">
                      <Checkbox id="free" checked={isFree} onCheckedChange={(checked) => setIsFree(checked as boolean)} />
                      <Label htmlFor="free" className="text-sm font-normal">
                        Free/No Cost
                      </Label>
                    </div>
                  )}

                  {requiresActiveOffer && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        You must add an active offer since you have no existing active offers
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Media */}
              {listingType && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <Label className="text-base font-semibold">Media (Provide at least one image or URL)</Label>
                    <p className="text-sm text-muted-foreground">Images are optional if you provide video or audio URLs</p>
                    
                    {/* Images */}
                    <div>
                      <Label className="text-sm">Images (Max 5) - Upload or URL</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Image URL"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                        />
                        <Button type="button" onClick={handleAddImage} size="icon" variant="secondary">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="secondary" onClick={handleImageUpload}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-3">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border">
                            <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => setImages(images.filter((_, i) => i !== idx))}
                              className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Video Embeds */}
                    <div>
                      <Label className="text-sm">Video Embeds (Max 5, YouTube/Vimeo)</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="YouTube or Vimeo URL"
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddVideo()}
                        />
                        <Button type="button" onClick={handleAddVideo} size="icon" variant="secondary">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {videoEmbeds.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {videoEmbeds.map((url, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                              <span className="truncate flex-1">{url}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setVideoEmbeds(videoEmbeds.filter((_, i) => i !== idx))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Audio Embeds */}
                    <div>
                      <Label className="text-sm">Audio Embeds (Max 5, Spotify/SoundCloud/Apple Music/Bandcamp)</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          placeholder="Audio platform URL"
                          value={newAudioUrl}
                          onChange={(e) => setNewAudioUrl(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddAudio()}
                        />
                        <Button type="button" onClick={handleAddAudio} size="icon" variant="secondary">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {audioEmbeds.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {audioEmbeds.map((url, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                              <span className="truncate flex-1">{url}</span>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setAudioEmbeds(audioEmbeds.filter((_, i) => i !== idx))}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Basic Info */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter listing title"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description * (Max 150 words)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your listing..."
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sourceUrl">Source URL (Optional)</Label>
                    <Input
                      id="sourceUrl"
                      type="url"
                      placeholder="https://example.com/product"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Reference link to the original product or content
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price {!isFree && "*"}</Label>
                      <Input
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder={isFree ? "Free" : "$0.00"}
                        disabled={isFree}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inventory">Inventory/Availability</Label>
                      <Input
                        id="inventory"
                        value={inventory}
                        onChange={(e) => setInventory(e.target.value)}
                        placeholder="e.g., 10 available"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category & Filters */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="category">Creative Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger id="category" className="mt-2">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Or add custom category..."
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customCategory.trim()) {
                            setCategory(customCategory.trim());
                            setCustomCategory("");
                            toast.success("Custom category added");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (customCategory.trim()) {
                            setCategory(customCategory.trim());
                            setCustomCategory("");
                            toast.success("Custom category added");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Subcategories</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["Handcrafted", "Sustainable", "Local", "Custom", "Limited Edition", "Organic"].map(
                        (sub) => (
                          <div key={sub} className="flex items-center gap-2">
                            <Checkbox
                              id={sub}
                              checked={subcategories.includes(sub)}
                              onCheckedChange={() => toggleSubcategory(sub)}
                            />
                            <Label htmlFor={sub} className="text-sm font-normal">
                              {sub}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Or add custom subcategory..."
                        value={customSubcategory}
                        onChange={(e) => setCustomSubcategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && customSubcategory.trim() && !subcategories.includes(customSubcategory.trim())) {
                            setSubcategories([...subcategories, customSubcategory.trim()]);
                            setCustomSubcategory("");
                            toast.success("Custom subcategory added");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          if (customSubcategory.trim() && !subcategories.includes(customSubcategory.trim())) {
                            setSubcategories([...subcategories, customSubcategory.trim()]);
                            setCustomSubcategory("");
                            toast.success("Custom subcategory added");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {subcategories.map((sub) => (
                          <Badge key={sub} variant="secondary" className="gap-1">
                            {sub}
                            <button
                              onClick={() => setSubcategories(subcategories.filter(s => s !== sub))}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Shipping/Delivery Options *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {shippingOptionsAvailable.map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox
                            id={option}
                            checked={shippingOptions.includes(option)}
                            onCheckedChange={() => toggleShipping(option)}
                          />
                          <Label htmlFor={option} className="text-sm font-normal">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Offer */}
              {listingType && (listingType !== "viewerbase" || !isFree) && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Label className="text-base font-semibold">
                          Active Offer {requiresActiveOffer && "*"}
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          {requiresActiveOffer
                            ? "Required - you must add an offer to this listing"
                            : "Add an optional offer to this listing"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="hasOffer"
                        checked={hasActiveOffer}
                        onCheckedChange={(checked) => setHasActiveOffer(checked as boolean)}
                      />
                      <Label htmlFor="hasOffer">Add an active offer/coupon to this listing</Label>
                    </div>

                    {hasActiveOffer && (
                      <>
                        <div>
                          <Label htmlFor="offerDetails">Offer Details *</Label>
                          <Input
                            id="offerDetails"
                            value={offerDetails}
                            onChange={(e) => setOfferDetails(e.target.value)}
                            placeholder="e.g., 15% off, Buy 2 Get 1 Free, Free Shipping"
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="offerExpiry">Expiration Date (Optional)</Label>
                          <Input
                            id="offerExpiry"
                            type="date"
                            value={offerExpiry}
                            onChange={(e) => setOfferExpiry(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 sticky bottom-4 bg-background p-4 rounded-lg border shadow-lg">
                <Button variant="outline" onClick={() => navigate("/dashboard/vendor")} className="flex-1" disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : isEditMode ? "Update Listing" : "Create Listing"}
                </Button>
              </div>
            </div>

            {/* RIGHT - Live Preview */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-card/50">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live Preview
                </h2>

                {/* Vendor Header Preview */}
                {vendorProfile && (
                  <div className="border-b border-border bg-card rounded-t-lg mb-4">
                    <div className="p-4">
                      <div className="flex flex-col items-center text-center gap-3">
                        {vendorProfile.logo && (
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={vendorProfile.logo} alt={vendorProfile.name} />
                            <AvatarFallback>{vendorProfile.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <h3 className="text-xl font-bold">{vendorProfile.name}</h3>
                            {vendorProfile.verified && (
                              <Badge variant="default" className="gap-1 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                TGT Verified
                              </Badge>
                            )}
                          </div>
                          
                          {vendorProfile.website && (
                            <Button
                              variant="link"
                              className="text-xs gap-1 h-auto p-0"
                              onClick={() => window.open(vendorProfile.website, "_blank")}
                            >
                              <ExternalLink className="h-3 w-3" />
                              website
                            </Button>
                          )}
                          
                          <p className="text-xs text-muted-foreground">
                            location {vendorProfile.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Content Preview */}
                <div className="space-y-4">
                  {/* Images Preview */}
                  {images.length > 0 ? (
                    <div className="flex gap-2">
                      <div className="flex flex-col gap-2 w-12">
                        {images.slice(0, 5).map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedPreviewImage(index)}
                            className={`border-2 rounded overflow-hidden transition-all ${
                              selectedPreviewImage === index
                                ? "border-primary"
                                : "border-border"
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-12 object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      <div className="flex-1">
                        <img
                          src={images[selectedPreviewImage]}
                          alt={title || "Preview"}
                          className="w-full rounded-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        {videoEmbeds.length > 0 || audioEmbeds.length > 0 
                          ? "Preview will show URL content" 
                          : "No media yet - add images, video URLs, or audio URLs above"}
                      </p>
                    </div>
                  )}

                  {/* Details Preview */}
                  <div className="space-y-3 text-sm">
                    <h3 className="text-lg font-bold">
                      {title || "Your listing title will appear here"}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Hand className="h-4 w-4" />
                        0
                      </Button>
                    </div>

                    {description && (
                      <div>
                        <h4 className="font-semibold mb-1">description of item:</h4>
                        <p className="text-muted-foreground">{description}</p>
                      </div>
                    )}

                    {vendorProfile && vendorProfile.ownership && (
                      <div>
                        <h4 className="font-semibold mb-1">Ownership</h4>
                        <p className="text-muted-foreground">{vendorProfile.ownership}</p>
                      </div>
                    )}

                    {vendorProfile && vendorProfile.expertise && (
                      <div>
                        <h4 className="font-semibold mb-1">Expertise</h4>
                        <p className="text-muted-foreground">{vendorProfile.expertise}</p>
                      </div>
                    )}

                    {shippingOptions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Shipping Options</h4>
                        <div className="flex flex-wrap gap-2">
                          {shippingOptions.map((option, index) => (
                            <Badge key={index} variant="secondary">{option}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {price && !isFree && (
                      <div>
                        <h4 className="font-semibold mb-1">Price</h4>
                        <p className="text-muted-foreground">{price}</p>
                      </div>
                    )}

                    {hasActiveOffer && offerDetails && (
                      <div>
                        <h4 className="font-semibold mb-2">Active Offer</h4>
                        <Card>
                          <CardContent className="pt-3 pb-3">
                            <p className="font-medium text-xs">{offerDetails}</p>
                            {offerExpiry && (
                              <p className="text-xs text-muted-foreground mt-1">Expires: {offerExpiry}</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {subcategories.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Filters: {subcategories.join(", ")}</h4>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>
  );
};

export default VendorNewListing;
