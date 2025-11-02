import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export type CategoryType = "product" | "service" | "experience" | "sale";

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  image: string;
  categories: CategoryType[];
  vendor: string;
  vendorId: string;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

const ProductCard = ({ id, title, price, image, categories, vendor, vendorId, isSaved = false, onSaveToggle }: ProductCardProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState(["Favorites", "Wishlist", "For Later"]);
  const [saved, setSaved] = useState(isSaved);
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [listingLink, setListingLink] = useState<string | null>(null);

  // Check for active coupon
  useEffect(() => {
    const checkActiveCoupon = async () => {
      const { data: couponData } = await supabase
        .from("coupons")
        .select("id")
        .eq("listing_id", id)
        .eq("active_status", true)
        .gte("end_date", new Date().toISOString())
        .limit(1);

      if (couponData && couponData.length > 0) {
        setHasActiveCoupon(true);
        
        // Get listing link
        const { data: listingData } = await supabase
          .from("listings")
          .select("listing_link")
          .eq("id", id)
          .single();
        
        setListingLink(listingData?.listing_link || null);
      }
    };

    checkActiveCoupon();
  }, [id]);

  // Determine listing path based on categories
  const getListingPath = () => {
    // For demo purposes, map categories to listing types
    if (categories.includes("service") || categories.includes("experience")) {
      return `/listing/video/${id}`;
    }
    return `/listing/product/${id}`;
  };

  const categoryColors: Record<CategoryType, string> = {
    product: "bg-category-product",
    service: "bg-category-service",
    experience: "bg-category-experience",
    sale: "bg-category-sale",
  };

  const handleHighFive = () => {
    if (saved) {
      // If already saved, toggle it off directly
      setSaved(false);
      if (onSaveToggle) {
        onSaveToggle();
      }
      toast.success("Removed from collection");
    } else {
      // If not saved, show dialog to choose folder
      setShowSaveDialog(true);
    }
  };

  const handleSave = (folder: string) => {
    setSaved(true);
    if (onSaveToggle) {
      onSaveToggle();
    }
    toast.success(`Saved to ${folder}!`, {
      description: `${title} has been added to your collection.`,
    });
    setShowSaveDialog(false);
    setNewFolderName("");
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      const folderName = newFolderName.trim();
      setFolders([...folders, folderName]);
      handleSave(folderName);
    } else if (folders.includes(newFolderName.trim())) {
      toast.error("Folder already exists");
    } else {
      toast.error("Please enter a folder name");
    }
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg bg-transparent border-none transition-all hover:shadow-lg animate-scale-in">
        {/* Category Dots - Multiple if applicable */}
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
          {categories.map((cat, index) => (
            <div 
              key={`${cat}-${index}`}
              className={cn("w-3 h-3 rounded-full ring-1 ring-border", categoryColors[cat])} 
            />
          ))}
          {hasActiveCoupon && (
            <div
              className={cn(
                "w-3 h-3 rounded-full ring-1 ring-border bg-category-sale cursor-pointer hover:scale-110 transition-transform"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (listingLink) {
                  window.open(listingLink, "_blank");
                } else {
                  toast.info("Active coupon available - view listing for details");
                }
              }}
              title={listingLink ? "Click to view offer" : "Active coupon available"}
            />
          )}
        </div>

        {/* High-Five Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleHighFive}
          className={cn(
            "absolute top-2 right-2 z-10 shadow-md transition-all",
            saved
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : "bg-background/90 hover:bg-background text-foreground"
          )}
          data-tour="hi-five-icon"
        >
          <Hand className={cn("h-5 w-5", saved && "fill-current")} />
        </Button>

        {/* Image with max width constraint */}
        <Link to={getListingPath()} className="block relative w-full max-w-[400px] overflow-hidden rounded-lg">
          <img
            src={image}
            alt={title}
            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
            style={{ maxWidth: '400px' }}
          />
          
          {/* Bottom Right Overlay */}
          <div className="absolute bottom-3 right-3 bg-background/95 backdrop-blur-sm rounded-md p-2 shadow-md">
            <p className="font-bold text-foreground text-sm leading-tight">{price}</p>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/vendor/${vendorId}`;
              }}
              className="text-muted-foreground hover:text-foreground text-xs leading-tight truncate max-w-[120px] block transition-colors text-left"
            >
              {vendor}
            </button>
          </div>
        </Link>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Save to My Shop</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose a folder to save this item or create a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {folders.map((folder) => (
              <Button
                key={folder}
                onClick={() => handleSave(folder)}
                variant="outline"
                className="w-full justify-start bg-background hover:bg-muted text-foreground"
              >
                {folder}
              </Button>
            ))}
            
            {/* Create New Folder Section */}
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-sm font-medium text-foreground">Create New Folder</p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateFolder();
                    }
                  }}
                  className="flex-1"
                />
                <Button onClick={handleCreateFolder} className="shrink-0">
                  Create
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
