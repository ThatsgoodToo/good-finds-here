import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Upload, X, Plus, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

type ListingType = "product" | "service" | "content";

const VendorNewListing = () => {
  const navigate = useNavigate();
  const [listingType, setListingType] = useState<ListingType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [isNonProfit, setIsNonProfit] = useState(false);
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

  const requiresActiveOffer = listingType === "product" || listingType === "service";
  const isOfferExempt = isFree || isNonProfit;

  const handleAddImage = () => {
    if (newImageUrl && images.length < 5) {
      setImages([...images, newImageUrl]);
      setNewImageUrl("");
    } else if (images.length >= 5) {
      toast.error("Maximum 5 images allowed");
    }
  };

  const handleAddVideo = () => {
    if (newVideoUrl && videoEmbeds.length < 5) {
      setVideoEmbeds([...videoEmbeds, newVideoUrl]);
      setNewVideoUrl("");
    } else if (videoEmbeds.length >= 5) {
      toast.error("Maximum 5 videos allowed");
    }
  };

  const handleAddAudio = () => {
    if (newAudioUrl && audioEmbeds.length < 5) {
      setAudioEmbeds([...audioEmbeds, newAudioUrl]);
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
    if (requiresActiveOffer && !isOfferExempt && !hasActiveOffer) {
      toast.error("Products and Services require an active offer (unless free or non-profit)");
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
        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate("/dashboard/vendor")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group mb-6"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-3xl font-bold mb-2">Create New Listing</h1>
          <p className="text-muted-foreground mb-8">
            Add a new product, service, or content listing to your vendor profile
          </p>

          <div className="space-y-6">
            {/* Listing Type */}
            <Card>
              <CardHeader>
                <CardTitle>Listing Type *</CardTitle>
                <CardDescription>Choose the type of listing you're creating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={listingType} onValueChange={(val) => setListingType(val as ListingType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="content">Content/Media (Music, Video, Art)</SelectItem>
                  </SelectContent>
                </Select>

                {requiresActiveOffer && !isOfferExempt && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Products and Services require at least one active offer unless marked as free or
                      non-profit
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="free" checked={isFree} onCheckedChange={(checked) => setIsFree(checked as boolean)} />
                    <Label htmlFor="free" className="text-sm font-normal">
                      Free/No Cost
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="nonprofit"
                      checked={isNonProfit}
                      onCheckedChange={(checked) => setIsNonProfit(checked as boolean)}
                    />
                    <Label htmlFor="nonprofit" className="text-sm font-normal">
                      Non-Profit/Viewer-Based
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Essential details about your listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter listing title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description * (Max 150 words)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your listing..."
                    rows={5}
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="inventory">Inventory/Availability</Label>
                    <Input
                      id="inventory"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      placeholder="e.g., 10 available, Made to order"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category & Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Category & Filters</CardTitle>
                <CardDescription>Help shoppers discover your listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Creative Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
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
                </div>

                <div>
                  <Label>Subcategories (Select all that apply)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
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
            {listingType && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Active Offer {requiresActiveOffer && !isOfferExempt && "*"}
                  </CardTitle>
                  <CardDescription>
                    {requiresActiveOffer && !isOfferExempt
                      ? "Required for products and services"
                      : "Optional for content listings"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                        />
                      </div>
                      <div>
                        <Label htmlFor="offerExpiry">Expiration Date (Optional)</Label>
                        <Input
                          id="offerExpiry"
                          type="date"
                          value={offerExpiry}
                          onChange={(e) => setOfferExpiry(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Media Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Media * (At least 1 image required)</CardTitle>
                <CardDescription>Add images, videos, and audio to showcase your listing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Images */}
                <div>
                  <Label>Images (Max 5)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Image URL or upload"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddImage()}
                    />
                    <Button type="button" onClick={handleAddImage} variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
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
                  <Label>Video Embeds (Max 5, YouTube/Vimeo)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="YouTube or Vimeo URL"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddVideo()}
                    />
                    <Button type="button" onClick={handleAddVideo} variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {videoEmbeds.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {videoEmbeds.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                          <span className="text-sm truncate flex-1">{url}</span>
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
                  <Label>Audio Embeds (Max 5, Spotify/SoundCloud/Apple Music/Bandcamp)</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Audio platform URL"
                      value={newAudioUrl}
                      onChange={(e) => setNewAudioUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddAudio()}
                    />
                    <Button type="button" onClick={handleAddAudio} variant="secondary">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {audioEmbeds.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {audioEmbeds.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 border rounded-lg">
                          <span className="text-sm truncate flex-1">{url}</span>
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

            {/* Submit */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate("/dashboard/vendor")} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Submit for Approval
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorNewListing;
