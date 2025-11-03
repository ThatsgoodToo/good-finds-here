import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SavedListingCardProps {
  saveId: string;
  listing?: {
    id: string;
    title: string;
    image_url: string;
    price: number;
    vendor_id: string;
    listing_type: string;
    category: string;
  };
  onUnsave: () => void;
  isDeleting: boolean;
}

const SavedListingCard = ({ saveId, listing, onUnsave, isDeleting }: SavedListingCardProps) => {
  const navigate = useNavigate();

  if (!listing) {
    return (
      <Card className="overflow-hidden opacity-50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Listing not found</p>
        </CardContent>
      </Card>
    );
  }

  const handleClick = () => {
    navigate(`/listing/${listing.id}`);
  };

  const handleUnsave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Remove "${listing.title}" from your saved items?`)) {
      onUnsave();
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleUnsave}
        disabled={isDeleting}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div onClick={handleClick}>
        <div className="aspect-square relative overflow-hidden bg-muted">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-muted-foreground text-sm">No image</p>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
            {listing.title}
          </h3>
          
          <div className="flex items-center justify-between mt-2">
            <p className="text-lg font-bold text-primary">
              ${listing.price?.toFixed(2) || '0.00'}
            </p>
            <span className="text-xs text-muted-foreground capitalize">
              {listing.listing_type}
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default SavedListingCard;
