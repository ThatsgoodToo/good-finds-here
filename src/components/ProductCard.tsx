import { useState } from "react";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

const ProductCard = ({ id, title, price, image, categories, vendor, vendorId }: ProductCardProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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
    setShowSaveDialog(true);
  };

  const handleSave = (folder: string) => {
    toast.success(`Saved to ${folder}!`, {
      description: `${title} has been added to your collection.`,
    });
    setShowSaveDialog(false);
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
        </div>

        {/* High-Five Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleHighFive}
          className="absolute top-2 right-2 z-10 bg-background/90 hover:bg-background text-foreground shadow-md"
        >
          <Hand className="h-5 w-5" />
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
            <Link 
              to={`/vendor/${vendorId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-muted-foreground hover:text-foreground text-xs leading-tight truncate max-w-[120px] block transition-colors"
            >
              {vendor}
            </Link>
          </div>
        </Link>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Save to My Shop</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose a folder to save this item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Button
              onClick={() => handleSave("Favorites")}
              variant="outline"
              className="w-full justify-start bg-background hover:bg-muted text-foreground"
            >
              Favorites
            </Button>
            <Button
              onClick={() => handleSave("Wishlist")}
              variant="outline"
              className="w-full justify-start bg-background hover:bg-muted text-foreground"
            >
              Wishlist
            </Button>
            <Button
              onClick={() => handleSave("For Later")}
              variant="outline"
              className="w-full justify-start bg-background hover:bg-muted text-foreground"
            >
              For Later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
