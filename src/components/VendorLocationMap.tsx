import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

interface VendorLocationMapProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  vendorName: string;
}

const VendorLocationMap = ({ isOpen, onClose, location, vendorName }: VendorLocationMapProps) => {
  // In a real implementation, you would use a mapping service like Mapbox or Google Maps
  // For now, we'll show a placeholder with the location details
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            {vendorName} Location
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
            {/* Placeholder for map - integrate with Mapbox or Google Maps */}
            <div className="text-center space-y-2">
              <MapPin className="h-12 w-12 text-primary mx-auto" />
              <div>
                <p className="font-semibold text-lg">{location}</p>
                <p className="text-sm text-muted-foreground">Map integration coming soon</p>
              </div>
            </div>
            
            {/* Mock map background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-primary/20" />
            </div>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Location Details</h4>
            <p className="text-sm text-muted-foreground">{location}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Note: Vendor locations are verified by TGT for accuracy
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorLocationMap;
