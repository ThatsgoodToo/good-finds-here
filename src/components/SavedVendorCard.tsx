import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, MapPin } from "lucide-react";

interface SavedVendorCardProps {
  saveId: string;
  vendor?: {
    user_id: string;
    business_name: string;
    profile_picture_url: string;
    city: string;
    state_region: string;
    business_description: string;
  };
  onUnsave: () => void;
  isDeleting: boolean;
}

const SavedVendorCard = ({ saveId, vendor, onUnsave, isDeleting }: SavedVendorCardProps) => {
  const navigate = useNavigate();

  if (!vendor) {
    return (
      <Card className="overflow-hidden opacity-50">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Vendor not found</p>
        </CardContent>
      </Card>
    );
  }

  const handleClick = () => {
    navigate(`/vendor/${vendor.user_id}`);
  };

  const handleUnsave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Remove "${vendor.business_name}" from your saved vendors?`)) {
      onUnsave();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarImage src={vendor.profile_picture_url} alt={vendor.business_name} />
              <AvatarFallback className="text-2xl bg-primary/10">
                {getInitials(vendor.business_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="w-full">
              <h3 className="font-bold text-lg mb-1 line-clamp-2">
                {vendor.business_name}
              </h3>
              
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-3">
                <MapPin className="h-3 w-3" />
                <span>{vendor.city}, {vendor.state_region}</span>
              </div>
              
              {vendor.business_description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {vendor.business_description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default SavedVendorCard;
