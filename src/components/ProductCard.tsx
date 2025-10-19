import { useState } from "react";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  category: CategoryType;
  vendor: string;
}

const ProductCard = ({ id, title, price, image, category, vendor }: ProductCardProps) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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
      <div className="group relative overflow-hidden rounded-lg bg-card border border-border transition-all hover:shadow-lg hover:scale-[1.02] animate-scale-in">
        {/* Category Dot */}
        <div className="absolute top-3 left-3 z-10">
          <div className={cn("w-3 h-3 rounded-full", categoryColors[category])} />
        </div>

        {/* High-Five Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleHighFive}
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background/90 text-foreground"
        >
          <Hand className="h-4 w-4" />
        </Button>

        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-foreground/90 backdrop-blur-sm p-4">
            <h3 className="text-background font-semibold text-sm mb-1 truncate">
              {title}
            </h3>
            <p className="text-background/80 text-xs">{vendor}</p>
            <p className="text-background font-bold mt-1">{price}</p>
          </div>
        </div>
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
