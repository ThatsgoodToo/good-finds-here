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
import CouponEditForm from "@/components/dashboard/vendor/CouponEditForm";
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
import { AlertCircle, Upload, X, Plus, ChevronLeft, Hand, CheckCircle, ExternalLink, Link, Info, Tag, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LocationLink from "@/components/LocationLink";
type CategoryType = "product" | "service" | "experience";
type MediaType = "product" | "video" | "audio";
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
  const [loadingActiveCoupon, setLoadingActiveCoupon] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>("product");
  const [listingTypes, setListingTypes] = useState<CategoryType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [inventory, setInventory] = useState("");
  const [category, setCategory] = useState("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [shippingOptions, setShippingOptions] = useState<string[]>([]);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponCreated, setCouponCreated] = useState(false);
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [pendingCouponData, setPendingCouponData] = useState<any>(null);
  const [noActiveCoupons, setNoActiveCoupons] = useState(false);
  const [activeCouponDetails, setActiveCouponDetails] = useState<any>(null);
  const [showEditCoupon, setShowEditCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string>("");

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

  // Fetch all vendor's active coupons for selection
  const fetchAvailableCoupons = async () => {
    if (!user) return;
    
    setLoadingCoupons(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("vendor_id", user.id)
        .eq("active_status", true)
        .gte("end_date", new Date().toISOString())
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setAvailableCoupons(data || []);
      setNoActiveCoupons(!data || data.length === 0);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Check if vendor has active coupons
  useEffect(() => {
    fetchAvailableCoupons();
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
          // Load media type
          if (data.listing_type === "video" || data.listing_type === "audio" || data.listing_type === "product") {
            setMediaType(data.listing_type as MediaType);
          }
          
          const types = data.listing_types && data.listing_types.length > 0 
            ? data.listing_types 
            : (data.listing_type ? [data.listing_type] : []);
          setListingTypes(types as CategoryType[]);
          setTitle(data.title);
          setDescription(data.description || "");
          setPrice(data.price?.toString() || "");
          setIsFree(!data.price || data.price === 0);
          setCategory(data.category || "");
          setSubcategories(data.categories || []);
          setSourceUrl(data.source_url || "");

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

          // Check for active coupon and fetch details
          if (data.id) {
            await fetchActiveCoupon();
          }
          
          // Load available coupons for selection
          await fetchAvailableCoupons();
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

  // Fetch active coupon details
  const fetchActiveCoupon = async () => {
    if (!listingId || !user) return;
    
    setLoadingActiveCoupon(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("listing_id", listingId)
        .eq("vendor_id", user.id)
        .eq("active_status", true)
        .gte("end_date", new Date().toISOString())
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors
      
      if (data) {
        setActiveCouponDetails(data);
        setHasActiveCoupon(true);
        setCouponCreated(true);
      }
    } catch (error) {
      console.error("Error fetching active coupon:", error);
    } finally {
      setLoadingActiveCoupon(false);
    }
  };

  // Remove active coupon
  const handleRemoveCoupon = async () => {
    if (!activeCouponDetails || !user) return;
    
    const confirmed = confirm(
      "Are you sure you want to remove this coupon? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from("coupons")
        .delete()
        .eq("id", activeCouponDetails.id)
        .eq("vendor_id", user.id);
      
      if (error) throw error;
      
      setActiveCouponDetails(null);
      setHasActiveCoupon(false);
      setCouponCreated(false);
      setSelectedCouponId("");
      await fetchAvailableCoupons(); // Refresh the list
      toast.success("Coupon removed successfully");
    } catch (error) {
      console.error("Error removing coupon:", error);
      toast.error("Failed to remove coupon");
    }
  };

  // Handle attaching a selected coupon
  const handleAttachCoupon = async () => {
    if (!selectedCouponId) {
      toast.error("Please select a coupon");
      return;
    }

    // If listing exists, update coupon's listing_id in database
    if (listingId && user) {
      try {
        const { error } = await supabase
          .from("coupons")
          .update({ listing_id: listingId })
          .eq("id", selectedCouponId)
          .eq("vendor_id", user.id);

        if (error) throw error;

        // Fetch the full coupon details
        const selectedCoupon = availableCoupons.find(c => c.id === selectedCouponId);
        setActiveCouponDetails(selectedCoupon);
        setHasActiveCoupon(true);
        toast.success("Coupon attached to listing!");
        await fetchActiveCoupon();
      } catch (error) {
        console.error("Error attaching coupon:", error);
        toast.error("Failed to attach coupon");
      }
    } else {
      // For new listings, store the selected coupon ID to attach on save
      const selectedCoupon = availableCoupons.find(c => c.id === selectedCouponId);
      setActiveCouponDetails(selectedCoupon);
      setHasActiveCoupon(true);
      setPendingCouponData({ couponId: selectedCouponId });
      toast.info("Coupon will be attached when you save the listing");
    }
  };

  // Handle Free/No Cost toggle with cleanup
  const handleFreeToggle = async (checked: boolean) => {
    if (checked) {
      // Check if there's existing coupon data
      const hasCouponData = pendingCouponData || couponCreated || hasActiveCoupon;
      
      if (hasCouponData) {
        // Show confirmation dialog
        const confirmed = confirm(
          "Marking this as free will remove any active coupons. Continue?"
        );
        
        if (!confirmed) {
          return; // Don't toggle to free
        }
        
        // Delete associated coupons if in edit mode
        if (listingId && user) {
          try {
            await supabase
              .from("coupons")
              .delete()
              .eq("listing_id", listingId)
              .eq("vendor_id", user.id);
            
            toast.success("Associated coupons removed");
          } catch (error) {
            console.error("Error removing coupons:", error);
            toast.error("Failed to remove coupons");
          }
        }
      }
      
      // Clear all coupon states
      setPendingCouponData(null);
      setShowCouponForm(false);
      setCouponCreated(false);
      setHasActiveCoupon(false);
      setActiveCouponDetails(null);
      setSelectedCouponId("");
      setPrice("");
    }
    
    setIsFree(checked);
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
        
        // Auto-set source URL from import
        setSourceUrl(importUrl.trim());

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

        // Auto-detect and set media type based on URL
        const hostname = new URL(importUrl).hostname.toLowerCase();
        if (hostname.includes('youtube') || hostname.includes('youtu.be')) {
          setMediaType('video');
          toast.info('Video listing detected and set');
        } else if (hostname.includes('spotify') || hostname.includes('soundcloud')) {
          setMediaType('audio');
          toast.info('Audio listing detected and set');
        }

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
        // Preserve the URL even on error
        setSourceUrl(importUrl.trim());
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
    try {
      new URL(sourceUrl);
    } catch {
      toast.error("Source URL must be a valid URL");
      return;
    }

    // Validate mediaType matches content for video/audio
    if (mediaType === 'video' || mediaType === 'audio') {
      const url = sourceUrl.toLowerCase();
      if (!url.includes('youtube') && !url.includes('youtu.be') && 
          !url.includes('spotify') && !url.includes('soundcloud')) {
        const confirmed = confirm(
          `You selected ${mediaType} but the URL doesn't appear to be from a media platform. Continue anyway?`
        );
        if (!confirmed) return;
      }
    }

    // Validate price format if not free
    if (!isFree && price) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        toast.error("Price must be a valid positive number");
        return;
      }
    }

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
        listing_type: mediaType,
        listing_types: listingTypes,
        price: isFree ? 0 : parseFloat(price) || null,
        category: category || null,
        categories: subcategories,
        image_url: images[0] || null,
        source_url: sourceUrl.trim(),
        listing_link: sourceUrl.trim(), // Use source_url as listing_link
        website_url: vendorProfile?.website || null, // Include vendor website
        status: "active"
      };

      console.log('[SAVE LISTING] Preparing to save:', {
        isEditMode,
        listingId,
        listingData,
        mediaType,
        listingTypes,
        pendingCouponData,
        imageCount: images.length,
        vendorWebsite: vendorProfile?.website
      });
      if (isEditMode && listingId) {
        // Update existing listing
        const {
          error
        } = await supabase.from("listings").update(listingData).eq("id", listingId);
        if (error) throw error;

        // Handle coupon attachment for existing listings
        if (pendingCouponData?.couponId) {
          // Attach existing coupon
          try {
            const { error: couponError } = await supabase
              .from("coupons")
              .update({ listing_id: listingId })
              .eq("id", pendingCouponData.couponId)
              .eq("vendor_id", user.id);

            if (couponError) {
              console.error("Error attaching coupon:", couponError);
              toast.error("Listing updated but failed to attach coupon");
            } else {
              toast.success("Listing updated and coupon attached!");
            }
          } catch (error) {
            console.error("Error in coupon attachment:", error);
          }
        } else if (pendingCouponData && !pendingCouponData.couponId) {
          // Create new coupon
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

        // Handle coupon attachment for new listings
        if (pendingCouponData?.couponId && newListing) {
          // Attach existing coupon with verification
          try {
            // First verify the coupon still exists and is valid
            const { data: couponCheck, error: checkError } = await supabase
              .from("coupons")
              .select("id, active_status")
              .eq("id", pendingCouponData.couponId)
              .eq("vendor_id", user.id)
              .maybeSingle();
            
            if (checkError) {
              console.error("Error checking coupon:", checkError);
              throw new Error("Failed to verify coupon");
            }

            if (!couponCheck) {
              throw new Error("Selected coupon no longer exists");
            }

            if (!couponCheck.active_status) {
              throw new Error("Selected coupon is no longer active");
            }

            // Now attach the coupon
            const { error: couponError } = await supabase
              .from("coupons")
              .update({ listing_id: newListing.id })
              .eq("id", pendingCouponData.couponId)
              .eq("vendor_id", user.id);

            if (couponError) {
              console.error("Error attaching coupon:", couponError);
              throw couponError;
            }
            
            console.log('[COUPON ATTACHED] Successfully attached coupon to listing:', {
              couponId: pendingCouponData.couponId,
              listingId: newListing.id
            });
            
            toast.success("Listing created and coupon attached!");
          } catch (error: any) {
            console.error("Error in coupon attachment:", error);
            toast.warning(`Listing created but coupon attachment failed: ${error.message}`);
          }
        } else if (pendingCouponData && newListing && !pendingCouponData.couponId) {
          // Create new coupon
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
                    {/* Media Type Selection - Compact */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Content Type *</Label>
                      <RadioGroup value={mediaType} onValueChange={(value) => setMediaType(value as MediaType)} className="flex gap-2">
                        <div className="flex items-center">
                          <RadioGroupItem value="product" id="media-product" className="peer sr-only" />
                          <Label htmlFor="media-product" className="flex items-center gap-2 px-3 py-2 border-2 rounded-md cursor-pointer hover:bg-accent transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent text-sm">
                            <Tag className="h-4 w-4" />
                            Product
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="video" id="media-video" className="peer sr-only" />
                          <Label htmlFor="media-video" className="flex items-center gap-2 px-3 py-2 border-2 rounded-md cursor-pointer hover:bg-accent transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent text-sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Video
                          </Label>
                        </div>
                        <div className="flex items-center">
                          <RadioGroupItem value="audio" id="media-audio" className="peer sr-only" />
                          <Label htmlFor="media-audio" className="flex items-center gap-2 px-3 py-2 border-2 rounded-md cursor-pointer hover:bg-accent transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent text-sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                            Audio
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Import Button */}
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
                    <Checkbox id="isFree" checked={isFree} onCheckedChange={handleFreeToggle} />
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
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeSubcategory(sub)} />
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

              {/* Active Coupon Management Section */}
              {isEditMode && hasActiveCoupon && !isFree && activeCouponDetails && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Active Coupon</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          This listing has an active coupon
                        </p>
                      </div>
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                    
                    {/* Display coupon details */}
                    <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-muted-foreground">Coupon Code</Label>
                          <p className="font-mono font-semibold">{activeCouponDetails.code}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Discount</Label>
                          <p className="font-semibold">
                            {activeCouponDetails.discount_type === 'percentage' 
                              ? `${activeCouponDetails.discount_value}%` 
                              : `$${activeCouponDetails.discount_value}`}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Expires</Label>
                          <p>{new Date(activeCouponDetails.end_date).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Uses</Label>
                          <p>
                            {activeCouponDetails.used_count}
                            {activeCouponDetails.max_uses ? ` / ${activeCouponDetails.max_uses}` : ' (unlimited)'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setHasActiveCoupon(false);
                          setActiveCouponDetails(null);
                          setSelectedCouponId("");
                          fetchAvailableCoupons();
                        }}
                      >
                        Change Coupon
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowEditCoupon(true)}
                      >
                        Edit Coupon
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleRemoveCoupon}
                      >
                        Remove Coupon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active Coupon Selection Section */}
              {listingTypes.length > 0 && !isFree && !hasActiveCoupon && (
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">Active Coupon</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Select an existing coupon or create a new one
                        </p>
                      </div>
                    </div>

                    {/* Coupon selection UI */}
                    <div className="space-y-4">
                      {loadingCoupons ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : availableCoupons.length === 0 ? (
                        <div className="text-center py-6 border rounded-lg bg-muted/30">
                          <Gift className="h-10 w-10 mx-auto mb-3 opacity-50 text-muted-foreground" />
                          <p className="font-medium">No active coupons available</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Create a coupon first to attach to this listing
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={() => setShowCouponForm(true)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Coupon
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Label>Select from your active coupons:</Label>
                          <RadioGroup value={selectedCouponId} onValueChange={setSelectedCouponId}>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                              {availableCoupons.map((coupon) => (
                                <Label
                                  key={coupon.id}
                                  htmlFor={coupon.id}
                                  className={cn(
                                    "flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                                    selectedCouponId === coupon.id && "border-primary bg-accent"
                                  )}
                                >
                                  <RadioGroupItem value={coupon.id} id={coupon.id} />
                                  <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="font-mono text-xs">
                                        {coupon.code}
                                      </Badge>
                                      <span className="font-semibold text-sm">
                                        {coupon.discount_type === 'percentage' 
                                          ? `${coupon.discount_value}% off` 
                                          : `$${coupon.discount_value} off`}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Expires: {new Date(coupon.end_date).toLocaleDateString()} • 
                                      Uses: {coupon.used_count}/{coupon.max_uses || '∞'}
                                    </p>
                                  </div>
                                </Label>
                              ))}
                            </div>
                          </RadioGroup>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={handleAttachCoupon}
                              disabled={!selectedCouponId}
                              className="flex-1"
                            >
                              Attach Selected Coupon
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowCouponForm(true)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create New
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Create New Coupon Dialog */}
              <Dialog open={showCouponForm} onOpenChange={setShowCouponForm}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                    <DialogDescription>
                      Create a new coupon that can be attached to this listing
                    </DialogDescription>
                  </DialogHeader>
                  <CouponForm 
                    onSuccess={() => {
                      if (listingId) {
                        setCouponCreated(true);
                        setHasActiveCoupon(true);
                        setShowCouponForm(false);
                        fetchAvailableCoupons();
                        fetchActiveCoupon();
                        toast.success("Coupon created and linked to listing!");
                      }
                    }} 
                    onCancel={() => {
                      setShowCouponForm(false);
                      setPendingCouponData(null);
                    }} 
                    listingId={listingId} 
                    autoLinkListing={true} 
                    deferSubmission={!listingId} 
                    onCouponDataReady={data => {
                      setPendingCouponData(data);
                      toast.info("Coupon ready - save the listing to create it");
                    }} 
                  />
                </DialogContent>
              </Dialog>

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
                          
                          <LocationLink 
                            location={vendorProfile.location}
                            iconSize="sm"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>}

                {/* Main Content Preview */}
                <div className="space-y-4">
                  {/* Listing Type Dots */}
                  {listingTypes.length > 0 && <div className="flex gap-1.5 items-center">
                      {listingTypes.map(type => <div key={type} className={cn("w-3 h-3 rounded-full ring-1 ring-border", type === "product" && "bg-category-product", type === "service" && "bg-category-service", type === "experience" && "bg-category-experience")} />)}
                      {(couponCreated || hasActiveCoupon || activeCouponDetails) && <div className="w-3 h-3 rounded-full bg-category-sale ring-1 ring-border cursor-pointer hover:scale-110 transition-transform" onClick={() => sourceUrl && window.open(sourceUrl, "_blank")} title="Active coupon available" />}
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

                    {sourceUrl && <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(sourceUrl, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Source
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
                        {sourceUrl && <Button variant="link" size="sm" onClick={() => window.open(sourceUrl, "_blank")} className="h-auto p-0 text-xs">
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

      {/* Edit Coupon Dialog */}
      <Dialog open={showEditCoupon} onOpenChange={setShowEditCoupon}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          {activeCouponDetails && (
            <CouponEditForm
              coupon={activeCouponDetails}
              onSuccess={() => {
                setShowEditCoupon(false);
                fetchActiveCoupon(); // Refresh coupon details
                toast.success("Coupon updated successfully");
              }}
              onCancel={() => setShowEditCoupon(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </div>;
};
export default VendorNewListing;