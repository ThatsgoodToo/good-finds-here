import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, RefreshCw, Upload, ExternalLink, MapPin } from "lucide-react";

interface VendorHeaderProps {
  vendorName: string;
  vendorImage: string;
  location: string;
  externalUrl: string;
  description: string;
  onUploadImage: () => void;
  onUpdateLocation: (location: string) => void;
  onUpdateExternalUrl: (url: string) => void;
  onUpdateDescription: (desc: string) => void;
  hasShopperRole: boolean;
}

const VendorHeader = ({
  vendorName,
  vendorImage,
  location,
  externalUrl,
  description,
  onUploadImage,
  onUpdateLocation,
  onUpdateExternalUrl,
  onUpdateDescription,
  hasShopperRole,
}: VendorHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-20 w-20 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src={vendorImage} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {vendorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onUploadImage}
              >
                <Upload className="h-3 w-3" />
              </Button>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{vendorName} Goods</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{location}</span>
              </div>
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline mt-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Visit Website
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasShopperRole && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline">Switch Dashboard</span>
                    <span className="sm:hidden">Switch</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard/vendor")} className="font-semibold">
                    Vendor Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/shopper")}>
                    Shopper Dashboard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>Account Settings</DropdownMenuItem>
                <DropdownMenuItem>Notification Settings</DropdownMenuItem>
                <DropdownMenuItem>Platform Messages</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem>Privacy Controls</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl">{description}</p>
        )}
      </div>
    </div>
  );
};

export default VendorHeader;
