import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SignupModal from "@/components/SignupModal";
import Header from "@/components/Header";
import VendorPendingApproval from "@/components/VendorPendingApproval";
import VendorApplicationRejected from "@/components/VendorApplicationRejected";
import { useVendorAccess } from "@/hooks/useVendorAccess";
import CouponForm from "@/components/dashboard/vendor/CouponForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertCircle, Upload, X, Plus, ChevronLeft, Hand, CheckCircle, ExternalLink, Link, Info, Tag, Gift } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
type CategoryType = "product" | "service" | "experience";
type ListingType = CategoryType;
const VendorNewListing = () => {
  const navigate = useNavigate();
  const {
    listingId
  } = useParams();
  const {
    user
  } = useAuth();
  const {
    status: vendorStatus,
    isLoading: checkingStatus
  } = useVendorAccess();
  const isEditMode = !!listingId;

  // State variables
  const [loading, setLoading] = useState(false);
  const [listingTypes, setListingTypes] = useState<CategoryType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [inventory, setInventory] = useState("");
  const [category, setCategory] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [shippingOptions, setShippingOptions] = useState<string[]>([]);
  const [listingLink, setListingLink] = useState("");
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponCreated, setCouponCreated] = useState(false);
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [pendingCouponData, setPendingCouponData] = useState<any>(null);
  const [noActiveCoupons, setNoActiveCoupons] = useState(false);

  // Unified media handling - images only (max 5)
  const [mediaItems, setMediaItems] = useState<Array<{
    type: 'image';
    url: string;
  }>>([]);
  const [mediaUrl, setMediaUrl] = useState("");

  // Autocomplete subcategories
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState("");
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
  const predefinedSubcategories = ["Handcrafted", "Sustainable", "Local", "Custom", "Limited Edition", "Organic", "Eco-Friendly", "Vintage", "Artisan", "Fair Trade"];
  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);

  // Check if vendor has active coupons
  useEffect(() => {
    const checkActiveCoupons = async () => {
      if (!user) return;
      const {
        data: coupons
      } = await supabase.from("coupons").select("id").eq("vendor_id", user.id).eq("active_status", true);
      setNoActiveCoupons(!coupons || coupons.length === 0);
    };
    checkActiveCoupons();
  }, [user]);

  // Load existing listing data if in edit mode
  useEffect(() => {
    const loadListing = async () => {
      if (!isEditMode || !listingId) return;
      setLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.from("listings").select("*").eq("id", listingId).single();
        if (error) throw error;
        if (data) {
          const type = data.listing_type as ListingType;
          setListingTypes([type]);
          setTitle(data.title);
          setDescription(data.description || "");
          setPrice(data.price?.toString() || "");
          setIsFree(!data.price || data.price === 0);
          setCategory(data.category || "");
          setSubcategories(data.categories || []);
          setSourceUrl(data.source_url || "");
          setListingLink(data.listing_link || "");

          // Load media - convert to unified format (images only now)
          const items: Array<{
            type: 'image';
            url: string;
          }> = [];
          if (data.image_url) {
            items.push({
              type: 'image',
              url: data.image_url
            });
          }
          setMediaItems(items);

          // Check for active coupon
          const {
            data: couponData
          } = await supabase.from("coupons").select("id").eq("listing_id", listingId).eq("active_status", true).gte("end_date", new Date().toISOString()).limit(1);
          if (couponData && couponData.length > 0) {
            setHasActiveCoupon(true);
            setCouponCreated(true);
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
      const {
        data: vendor
      } = await supabase.from("vendor_profiles").select("*").eq("user_id", user.id).maybeSingle();
      const {
        data: profile
      } = await supabase.from("profiles").select("display_name, avatar_url, profile_picture_url").eq("id", user.id).maybeSingle();
      if (vendor) {
        setVendorProfile({
          name: vendor.business_type || profile?.display_name || "Your Business",
          logo: profile?.profile_picture_url || profile?.avatar_url || "",
          website: vendor.website || "",
          location: `${vendor.city}, ${vendor.state_region}`,
          verified: vendor.status === "active",
          ownership: vendor.business_type || "",
          expertise: vendor.area_of_expertise?.[0] || vendor.business_duration || ""
        });
      }
    };
    loadVendorProfile();
  }, [user]);

  // Load real active offers status
  useEffect(() => {
    const checkActiveOffers = async () => {
      if (!user) return;
      const {
        data: activeCoupons
      } = await supabase.from("coupons").select("id").eq("vendor_id", user.id).eq("active_status", true).limit(1);
      setHasExistingActiveOffers((activeCoupons?.length || 0) > 0);
    };
    checkActiveOffers();
  }, [user]);
  const categories = ["Textiles & Apparel", "Ceramics & Pottery", "Culinary & Food", "Music & Audio", "Art & Visual", "Crafts & Handmade", "Wellness & Beauty", "Home & Decor", "Experiences & Workshops", "Other"];
  const shippingOptionsAvailable = ["Shipping", "Local Pickup", "In Person", "Virtual/Digital", "Other"];
  const toggleListingType = (type: CategoryType) => {
    if (listingTypes.includes(type)) {
      setListingTypes(listingTypes.filter(t => t !== type));
    } else {
      setListingTypes([...listingTypes, type]);
    }
  };
  const addMediaItem = () => {
    if (mediaUrl.trim()) {
      if (mediaItems.length >= 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }
      setMediaItems([...mediaItems, {
        type: 'image',
        url: mediaUrl.trim()
      }]);
      setMediaUrl("");
      toast.success(`Image ${mediaItems.length + 1}/5 added`);
    }
  };
  const removeMediaItem = (index: number) => {
    setMediaItems(mediaItems.filter((_, i) => i !== index));
  };
  const handleSubcategoryAutocomplete = (input: string) => {
    setSubcategoryInput(input);
    if (input.length > 0) {
      const filtered = predefinedSubcategories.filter(sub => sub.toLowerCase().startsWith(input.toLowerCase()) && !subcategories.includes(sub));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };
  const addSubcategory = (sub: string) => {
    if (!subcategories.includes(sub)) {
      setSubcategories([...subcategories, sub]);
    }
    setSubcategoryInput("");
    setShowSuggestions(false);
  };
  const removeSubcategory = (sub: string) => {
    setSubcategories(subcategories.filter(s => s !== sub));
  };
  const toggleShipping = (option: string) => {
    if (shippingOptions.includes(option)) {
      setShippingOptions(shippingOptions.filter(o => o !== option));
    } else {
      setShippingOptions([...shippingOptions, option]);
    }
  };

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
      const {
        data,
        error
      } = await supabase.functions.invoke('fetch-url-metadata', {
        body: {
          url
        }
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
    const loadingToast = toast.loading('Importing listing details...');
    try {
      const metadata = await extractUrlMetadata(importUrl);
      if (metadata) {
        setTitle(metadata.title);
        setDescription(metadata.description);

        // Only add image if under 5 limit
        if (metadata.image && !mediaItems.some(m => m.url === metadata.image)) {
          if (mediaItems.length >= 5) {
            toast.warning("Image found but you already have 5 images (maximum reached)");
          } else {
            setMediaItems([...mediaItems, {
              type: 'image',
              url: metadata.image
            }]);
          }
        }
        if (metadata.price) {
          setPrice(metadata.price);
          setIsFree(false);
        }

        // Check if URL is video/audio and show info (don't add to mediaItems)
        const hostname = new URL(importUrl).hostname.toLowerCase();
        if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
          toast.info('Video metadata imported (video embeds not supported in image gallery)');
        } else if (hostname.includes('spotify') || hostname.includes('soundcloud')) {
          toast.info('Audio metadata imported (audio embeds not supported in image gallery)');
        }

        // Set source URL if not already set
        if (!sourceUrl) setSourceUrl(importUrl);
        setShowImportDialog(false);
        setImportUrl("");
        setImportError(null);
        toast.success('Listing details imported successfully!', {
          id: loadingToast
        });
      } else {
        toast.dismiss(loadingToast);
        const urlObj = new URL(importUrl);
        const hostname = urlObj.hostname.replace('www.', '');
        const pathname = urlObj.pathname;
        const urlParts = pathname.split('/').filter(p => p.length > 0);
        const lastPart = urlParts[urlParts.length - 1];
        const potentialTitle = lastPart?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\.\w+$/, '');
        const isEcommerce = hostname.includes('etsy') || hostname.includes('amazon') || hostname.includes('ebay') || hostname.includes('shopify');
        setImportError({
          show: true,
          message: isEcommerce ? `${hostname} blocks automatic imports. Let's create your listing manually!` : `We couldn't read this page automatically. Let's create your listing manually!`,
          suggestedTitle: potentialTitle || null,
          sourceUrl: importUrl
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
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
        toast.error('Invalid URL format', {
          id: loadingToast
        });
      }
    }
  };
  const handleImageUpload = async () => {
    if (mediaItems.length >= 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = async e => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length + mediaItems.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }
      if (!user) {
        toast.error("You must be logged in to upload images");
        return;
      }
      const uploadPromises = files.map(async file => {
        try {
          const {
            uploadFile,
            getUserPath
          } = await import("@/lib/storage");
          const path = getUserPath(user.id, file.name);
          const {
            url
          } = await uploadFile({
            bucket: "product-images",
            file,
            path
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
        const newItems = uploadedUrls.map(url => ({
          type: 'image' as const,
          url
        }));
        setMediaItems(prev => [...prev, ...newItems]);
        toast.success(`Uploaded ${uploadedUrls.length} image(s)`);
      }
    };
    input.click();
  };

  // Check vendor access status
  if (checkingStatus) {
    return <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 container mx-auto px-4 py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  if (vendorStatus === "pending") {
    return <div className="min-h-screen bg-background">
        <Header />
        <VendorPendingApproval />
      </div>;
  }
  if (vendorStatus === "rejected") {
    return <div className="min-h-screen bg-background">
        <Header />
        <VendorApplicationRejected />
      </div>;
  }
  if (vendorStatus === "no-application") {
    navigate("/signup/vendor");
    return null;
  }
  const handleSubmit = async () => {
    // Validation
    if (listingTypes.length === 0) {
      toast.error("Please select at least one listing type");
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
    if (!category || !category.trim()) {
      toast.error("Please select a category");
      return;
    }
    if (!sourceUrl.trim()) {
      toast.error("Source URL is required");
      return;
    }
    if (!listingLink.trim()) {
      toast.error("Listing Link is required - this is where shoppers will be directed");
      return;
    }
    try {
      new URL(listingLink);
    } catch {
      toast.error("Listing Link must be a valid URL");
      return;
    }

    // Images are now optional - no validation needed

    if (!user) {
      toast.error("You must be logged in to save a listing");
      return;
    }
    setLoading(true);
    try {
      // Separate media items by type for database
      const images = mediaItems.filter(m => m.type === 'image').map(m => m.url);
      const listingData = {
        vendor_id: user.id,
        title: title.trim(),
        description: description.trim(),
        listing_type: listingTypes[0],
        // Primary type
        price: isFree ? 0 : parseFloat(price) || null,
        category: category || null,
        categories: subcategories,
        image_url: images[0] || null,
        source_url: sourceUrl.trim(),
        listing_link: listingLink.trim(),
        status: "active"
      };
      if (isEditMode && listingId) {
        // Update existing listing
        const {
          error
        } = await supabase.from("listings").update(listingData).eq("id", listingId);
        if (error) throw error;

        // If there's pending coupon data, create it now
        if (pendingCouponData) {
          try {
            const response = await supabase.functions.invoke('manage-coupons', {
              body: {
                action: 'create',
                coupon: {
                  ...pendingCouponData,
                  listing_id: listingId,
                  start_date: pendingCouponData.start_date.toISOString(),
                  end_date: pendingCouponData.end_date.toISOString()
                }
              }
            });
            if (response.error) throw response.error;
            toast.success("Listing updated and coupon created!");
          } catch (couponError: any) {
            console.error('Error creating coupon:', couponError);
            toast.error("Listing updated but coupon creation failed: " + couponError.message);
          }
        } else {
          toast.success("Listing updated successfully!");
        }
      } else {
        // Create new listing
        const {
          data: newListing,
          error
        } = await supabase.from("listings").insert([listingData]).select().single();
        if (error) throw error;

        // If there's pending coupon data, create it with the new listing ID
        if (pendingCouponData && newListing) {
          try {
            const response = await supabase.functions.invoke('manage-coupons', {
              body: {
                action: 'create',
                coupon: {
                  ...pendingCouponData,
                  listing_id: newListing.id,
                  start_date: pendingCouponData.start_date.toISOString(),
                  end_date: pendingCouponData.end_date.toISOString()
                }
              }
            });
            if (response.error) throw response.error;
            toast.success("Listing and coupon created successfully!");
          } catch (couponError: any) {
            console.error('Error creating coupon:', couponError);
            toast.error("Listing created but coupon creation failed: " + couponError.message);
          }
        } else {
          toast.success("Listing created successfully!");
        }
      }
      navigate("/dashboard/vendor");
    } catch (error: any) {
      console.error("Error saving listing:", error);

      // Show detailed error message
      const errorMessage = error?.message || error?.error_description || `Failed to ${isEditMode ? 'update' : 'create'} listing`;
      toast.error(errorMessage);

      // Log full error for debugging
      console.error("Full error details:", {
        error,
        user: user?.id,
        isEditMode,
        listingId
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16 sm:pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          {/* Back Button */}
          <button onClick={() => navigate("/dashboard/vendor")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-4">
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-2xl sm:text-3xl font-bold mb-6">
            {isEditMode ? "Edit Listing" : "Create New Listing"}
          </h1>

          {/* Import Dialog */}
          <Dialog open={showImportDialog} onOpenChange={open => {
          setShowImportDialog(open);
          if (!open) {
            setImportError(null);
            setImportUrl("");
          }
        }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Import Listing from URL</DialogTitle>
                <DialogDescription>
                  {!importError?.show ? "Paste a product, image, video, or audio URL and we'll try to automatically fill in the details." : "No problem! Let's create your listing manually."}
                </DialogDescription>
              </DialogHeader>
              
              {!importError?.show ? <div className="space-y-4">
                  <Input placeholder="https://www.etsy.com/listing/..." value={importUrl} onChange={e => setImportUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && handleImportFromUrl()} />
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
                </div> : <div className="space-y-4">
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
                  
                  {importError.suggestedTitle && <div className="space-y-2">
                      <Label>We found this in the URL:</Label>
                      <Input value={importError.suggestedTitle} readOnly className="bg-muted" />
                      <p className="text-xs text-muted-foreground">
                        You can use this as your title or change it
                      </p>
                    </div>}
                  
                  <div className="space-y-2">
                    <Label>Reference URL (saved for your records)</Label>
                    <Input value={importError.sourceUrl} readOnly className="bg-muted" />
                    <p className="text-xs text-muted-foreground">
                      We'll save this URL so you can reference it later
                    </p>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => {
                  setImportError(null);
                  setImportUrl("");
                }}>
                      Try Different URL
                    </Button>
                    <Button onClick={() => {
                  if (importError.suggestedTitle) {
                    setTitle(importError.suggestedTitle);
                  }
                  setSourceUrl(importError.sourceUrl);
                  setShowImportDialog(false);
                  setImportError(null);
                  setImportUrl("");
                  toast.success('Ready to fill in the details!');
                }}>
                      Fill Form Manually
                    </Button>
                  </div>
                </div>}
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
                    <Label className="text-base font-semibold">Listing Type *</Label>
                    <p className="text-sm text-muted-foreground mt-1">Select one or more types</p>
                    <div className="grid grid-cols-1 gap-3 mt-3">
                      {(["product", "service", "experience"] as CategoryType[]).map(type => <div key={type} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors">
                          <Checkbox id={type} checked={listingTypes.includes(type)} onCheckedChange={() => toggleListingType(type)} />
                          <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer flex-1 text-base font-normal">
                            <div className={cn("w-3 h-3 rounded-full ring-1 ring-border", type === "product" && "bg-category-product", type === "service" && "bg-category-service", type === "experience" && "bg-category-experience")} />
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Label>
                        </div>)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Images Section - Now Optional */}
              {listingTypes.length > 0 && <Card>
                  <CardContent className="pt-6 space-y-4">
                    {/* Import Button - Moved Inside */}
                    <Button type="button" variant="outline" onClick={() => setShowImportDialog(true)} className="w-full">
                      <Link className="h-4 w-4 mr-2" />
                      Import Listing URL (product, image, video, audio)
                    </Button>

                    <div className="h-px bg-border my-4" />

                    <Label className="text-base font-semibold">Images (5 Max)</Label>
                    <p className="text-sm text-muted-foreground">
                      Upload images to showcase your listing (optional, maximum 5)
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input type="url" placeholder="Paste image URL..." value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} onKeyPress={e => e.key === 'Enter' && addMediaItem()} disabled={mediaItems.length >= 5} />
                        <Button type="button" onClick={addMediaItem} className="shrink-0" disabled={mediaItems.length >= 5}>
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="outline" onClick={handleImageUpload} disabled={mediaItems.length >= 5}>
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Image Counter */}
                      <p className="text-xs text-muted-foreground text-right">
                        {mediaItems.length} / 5 images
                      </p>
                    </div>
                    
                    {mediaItems.length > 0 && <div className="grid grid-cols-3 gap-4">
                        {mediaItems.map((item, idx) => <div key={idx} className="relative group">
                            <img src={item.url} alt={`Image ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeMediaItem(idx)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>)}
                      </div>}
                  </CardContent>
                </Card>}

              {/* Basic Info */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter listing title" className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description * (Max 150 words)</Label>
                    <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your listing..." rows={4} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="sourceUrl">Source URL *</Label>
                    <Input id="sourceUrl" type="url" placeholder="https://example.com/original-product" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} className="mt-2" />
                    <p className="text-sm text-muted-foreground mt-1">RWhere shoppers can purchase or view this listing (required for coupon functionality)

                  </p>
                  </div>

                  

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price {!isFree && "*"}</Label>
                      <Input id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder={isFree ? "Free" : "$0.00"} disabled={isFree} className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="inventory">Inventory/Availability</Label>
                      <Input id="inventory" value={inventory} onChange={e => setInventory(e.target.value)} placeholder="e.g., 10 available" className="mt-2" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox id="isFree" checked={isFree} onCheckedChange={checked => {
                    setIsFree(checked as boolean);
                    if (checked) setPrice("");
                  }} />
                    <Label htmlFor="isFree" className="text-sm font-normal cursor-pointer">
                      Free / No Cost
                    </Label>
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
                        {categories.map(cat => <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Or add custom category..." value={customCategory} onChange={e => setCustomCategory(e.target.value)} onKeyDown={e => {
                      if (e.key === "Enter" && customCategory.trim()) {
                        setCategory(customCategory.trim());
                        setCustomCategory("");
                        toast.success("Custom category added");
                      }
                    }} />
                      <Button type="button" size="sm" variant="secondary" onClick={() => {
                      if (customCategory.trim()) {
                        setCategory(customCategory.trim());
                        setCustomCategory("");
                        toast.success("Custom category added");
                      }
                    }}>
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Label htmlFor="subcategories">Subcategories</Label>
                    <Input id="subcategories" value={subcategoryInput} onChange={e => handleSubcategoryAutocomplete(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter' && subcategoryInput.trim()) {
                      e.preventDefault();
                      addSubcategory(subcategoryInput.trim());
                    }
                  }} placeholder="Type subcategories (e.g., 'Handcrafted', 'Organic')..." className="mt-2" />
                    
                    {showSuggestions && suggestions.length > 0 && <div className="absolute z-10 w-full border rounded-lg mt-1 bg-card shadow-lg">
                        {suggestions.map(suggestion => <button key={suggestion} type="button" onClick={() => addSubcategory(suggestion)} className="w-full text-left px-3 py-2 hover:bg-accent text-sm">
                            {suggestion}
                          </button>)}
                      </div>}

                    {subcategories.length > 0 && <div className="flex flex-wrap gap-2 mt-2">
                        {subcategories.map(sub => <Badge key={sub} variant="secondary" className="gap-1">
                            {sub}
                            
                          </Badge>)}
                      </div>}
                  </div>

                  <div>
                    <Label>Shipping/Delivery Options *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {shippingOptionsAvailable.map(option => <div key={option} className="flex items-center gap-2">
                          <Checkbox id={option} checked={shippingOptions.includes(option)} onCheckedChange={() => toggleShipping(option)} />
                          <Label htmlFor={option} className="text-sm font-normal">
                            {option}
                          </Label>
                        </div>)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Create Coupon Section */}
              {listingTypes.length > 0 && !isFree && <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Create Coupon for This Listing</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional: Add a coupon that will be linked to this listing
                        </p>
                      </div>
                      {couponCreated && <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Coupon Created
                        </Badge>}
                    </div>

                {/* Encourage coupon creation if vendor has no active coupons */}
                {noActiveCoupons && !couponCreated && !showCouponForm && <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Gift className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                          Boost your listing with a coupon code!
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                          Listings with coupons get a red sale dot that attracts more shoppers. 
                          Create one now to stand out in the marketplace.
                        </p>
                      </div>
                    </div>
                  </div>}
                
                {couponCreated && <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">Coupon Created</span>
                  </div>}

                {!couponCreated && <div className="space-y-3">
                    {!listingId && showCouponForm && <p className="text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded flex items-center gap-2 border border-yellow-200 dark:border-yellow-800">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        Coupon will be created when you save the listing
                      </p>}
                    
                    <div className="flex items-center gap-2">
                      <Checkbox id="showCoupon" checked={showCouponForm} onCheckedChange={checked => setShowCouponForm(checked as boolean)} />
                      <Label htmlFor="showCoupon">Create a coupon for this listing</Label>
                    </div>
                    
                    {showCouponForm && <div className="border rounded-lg p-4 bg-muted/50">
                        <CouponForm onSuccess={() => {
                      if (listingId) {
                        setCouponCreated(true);
                        setHasActiveCoupon(true);
                        setShowCouponForm(false);
                        toast.success("Coupon created and linked to listing!");
                      }
                    }} onCancel={() => {
                      setShowCouponForm(false);
                      setPendingCouponData(null);
                    }} listingId={listingId} autoLinkListing={true} deferSubmission={!listingId} onCouponDataReady={data => {
                      setPendingCouponData(data);
                      toast.info("Coupon ready - save the listing to create it");
                    }} />
                      </div>}
                  </div>}
              </CardContent>
                </Card>}

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
                {vendorProfile && <div className="border-b border-border bg-card rounded-t-lg mb-4">
                    <div className="p-4">
                      <div className="flex flex-col items-center text-center gap-3">
                        {vendorProfile.logo && <Avatar className="h-16 w-16">
                            <AvatarImage src={vendorProfile.logo} alt={vendorProfile.name} />
                            <AvatarFallback>{vendorProfile.name.charAt(0)}</AvatarFallback>
                          </Avatar>}
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <h3 className="text-xl font-bold">{vendorProfile.name}</h3>
                            {vendorProfile.verified && <Badge variant="default" className="gap-1 text-xs">
                                <CheckCircle className="h-3 w-3" />
                                TGT Verified
                              </Badge>}
                          </div>
                          
                          {vendorProfile.website}
                          
                          <p className="text-xs text-muted-foreground">
                            location {vendorProfile.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>}

                {/* Main Content Preview */}
                <div className="space-y-4">
                  {/* Listing Type Dots */}
                  {listingTypes.length > 0 && <div className="flex gap-1.5 items-center">
                      {listingTypes.map(type => <div key={type} className={cn("w-3 h-3 rounded-full ring-1 ring-border", type === "product" && "bg-category-product", type === "service" && "bg-category-service", type === "experience" && "bg-category-experience")} />)}
                      {(couponCreated || hasActiveCoupon) && listingLink && <div className="w-3 h-3 rounded-full bg-category-sale ring-1 ring-border cursor-pointer hover:scale-110 transition-transform" onClick={() => window.open(listingLink, "_blank")} title="Active coupon - Click to view offer" />}
                    </div>}

                  {/* Media Preview */}
                  {mediaItems.find(m => m.type === 'image') ? <div className="w-full">
                      <img src={mediaItems.find(m => m.type === 'image')?.url} alt={title || "Preview"} className="w-full rounded-lg" />
                    </div> : <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">
                        {mediaItems.length > 0 ? "Preview will show URL content" : "No media yet - add images, video URLs, or audio URLs above"}
                      </p>
                    </div>}

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

                    {description && <div>
                        <h4 className="font-semibold mb-1">description of item:</h4>
                        <p className="text-muted-foreground">{description}</p>
                      </div>}

                    {listingLink && <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(listingLink, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Listing
                      </Button>}

                    {shippingOptions.length > 0 && <div>
                        <h4 className="font-semibold mb-2">Shipping Options</h4>
                        <div className="flex flex-wrap gap-2">
                          {shippingOptions.map((option, index) => <Badge key={index} variant="secondary">{option}</Badge>)}
                        </div>
                      </div>}

                    {price && !isFree && <div>
                        <h4 className="font-semibold mb-1">Price</h4>
                        <p className="text-muted-foreground">{price}</p>
                      </div>}

                    {(couponCreated || hasActiveCoupon) && <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="gap-1">
                          <div className="w-2 h-2 rounded-full bg-white" />
                          Active Coupon
                        </Badge>
                        {listingLink && <Button variant="link" size="sm" onClick={() => window.open(listingLink, "_blank")} className="h-auto p-0 text-xs">
                            View Offer <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>}
                      </div>}

                    {subcategories.length > 0 && <div>
                        <h4 className="font-semibold mb-2">Filters: {subcategories.join(", ")}</h4>
                      </div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>;
};
export default VendorNewListing;