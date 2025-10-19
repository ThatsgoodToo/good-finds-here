import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SignupModal from "@/components/SignupModal";
import Header from "@/components/Header";
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
import { AlertCircle, Upload, X, Plus, ChevronLeft, Hand, CheckCircle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type ListingType = "product" | "service" | "viewerbase";

const VendorNewListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    if (!user) {
      setShowSignupModal(true);
    }
  }, [user]);
  
  // Mock vendor data
  const vendor = {
    name: "Your Vendor Name",
    logo: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=100",
    website: "https://yourwebsite.com",
    location: "Sacramento, CA",
    verified: true,
    ownership: "Family Owned",
    expertise: "Traditional Craftsmanship",
  };

  // Mock: Check if vendor has existing active offers
  const hasExistingActiveOffers = false; // This would come from backend

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

  // Auto-fill content from URL metadata
  const autoFillFromUrl = async (url: string) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      
      if (!title) {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const suggestedTitle = pathParts[pathParts.length - 1]?.replace(/[-_]/g, ' ') || hostname;
        setTitle(suggestedTitle.charAt(0).toUpperCase() + suggestedTitle.slice(1));
      }
      
      if (!description) {
        setDescription(`Content from ${hostname}`);
      }
    } catch (e) {
      // Invalid URL, skip auto-fill
    }
  };

  const handleAddImage = () => {
    if (newImageUrl && images.length < 5) {
      setImages([...images, newImageUrl]);
      autoFillFromUrl(newImageUrl);
      setNewImageUrl("");
    } else if (images.length >= 5) {
      toast.error("Maximum 5 images allowed");
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && images.length < 5) {
        const url = URL.createObjectURL(file);
        setImages([...images, url]);
        toast.success("Image added");
      } else if (images.length >= 5) {
        toast.error("Maximum 5 images allowed");
      }
    };
    input.click();
  };

  const handleAddVideo = () => {
    if (newVideoUrl && videoEmbeds.length < 5) {
      setVideoEmbeds([...videoEmbeds, newVideoUrl]);
      autoFillFromUrl(newVideoUrl);
      setNewVideoUrl("");
    } else if (videoEmbeds.length >= 5) {
      toast.error("Maximum 5 videos allowed");
    }
  };

  const handleAddAudio = () => {
    if (newAudioUrl && audioEmbeds.length < 5) {
      setAudioEmbeds([...audioEmbeds, newAudioUrl]);
      autoFillFromUrl(newAudioUrl);
      setNewAudioUrl("");
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

  const handleSubmit = () => {
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
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    // Submit listing
    toast.success("Listing created successfully! Awaiting TGT approval.");
    navigate("/dashboard/vendor");
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

          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Create New Listing</h1>

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
                    <Label className="text-base font-semibold">Media (At least 1 image required)</Label>
                    
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
                <Button variant="outline" onClick={() => navigate("/dashboard/vendor")} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  Submit for Approval
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
                <div className="border-b border-border bg-card rounded-t-lg mb-4">
                  <div className="p-4">
                    <div className="flex flex-col items-center text-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={vendor.logo} alt={vendor.name} />
                        <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-xl font-bold">{vendor.name}</h3>
                          {vendor.verified && (
                            <Badge variant="default" className="gap-1 text-xs">
                              <CheckCircle className="h-3 w-3" />
                              TGT Verified
                            </Badge>
                          )}
                        </div>
                        
                        <Button
                          variant="link"
                          className="text-xs gap-1 h-auto p-0"
                          onClick={() => window.open(vendor.website, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                          website
                        </Button>
                        
                        <p className="text-xs text-muted-foreground">
                          location {vendor.location}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

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
                      <p className="text-sm text-muted-foreground">No images yet</p>
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

                    <div>
                      <h4 className="font-semibold mb-1">shops ownership</h4>
                      <p className="text-muted-foreground">{vendor.ownership}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-1">shops expertise</h4>
                      <p className="text-muted-foreground">{vendor.expertise}</p>
                    </div>

                    {shippingOptions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Shops shipping option</h4>
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
