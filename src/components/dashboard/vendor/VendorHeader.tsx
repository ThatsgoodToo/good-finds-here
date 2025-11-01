import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Upload, ExternalLink, Edit2, RefreshCw, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ShopperSignupPrompt from "@/components/ShopperSignupPrompt";
import DashboardInfoDialog from "@/components/DashboardInfoDialog";
import { cn } from "@/lib/utils";

interface VendorHeaderProps {
  vendorName: string;
  vendorImage: string;
  location: string;
  externalUrl: string;
  description: string;
  vendorUserId: string;
  onUploadImage: () => void;
  onUpdateLocation: (location: string) => void;
  onUpdateExternalUrl: (url: string) => void;
  onUpdateDescription: (desc: string) => void;
}

const VendorHeader = ({
  vendorName,
  vendorImage,
  location,
  externalUrl,
  description,
  vendorUserId,
  onUploadImage,
  onUpdateLocation,
  onUpdateExternalUrl,
  onUpdateDescription,
}: VendorHeaderProps) => {
  const navigate = useNavigate();
  const { roles } = useAuth();
  const [showShopperSignupPrompt, setShowShopperSignupPrompt] = React.useState(false);
  const [showInfoAnimation, setShowInfoAnimation] = React.useState(false);
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const key = "tgt_dashboard_info_seen_vendor";
    const hasSeenInfo = localStorage.getItem(key);
    
    if (!hasSeenInfo) {
      setShowInfoAnimation(true);
    }
  }, []);

  const handleInfoClick = () => {
    const key = "tgt_dashboard_info_seen_vendor";
    localStorage.setItem(key, "true");
    setShowInfoAnimation(false);
    setInfoDialogOpen(true);
  };

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
                data-tour="vendor-image-upload"
              >
                <Upload className="h-3 w-3" />
              </Button>
            </div>
            <div>
        <h1 
          className="text-2xl sm:text-3xl font-bold hover:text-primary cursor-pointer transition-colors"
          onClick={() => navigate(`/vendor/${vendorUserId}`)}
        >
          {vendorName} Goods
        </h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
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
            <Button
              variant="outline"
              size="icon"
              onClick={handleInfoClick}
              className={cn(
                "relative",
                showInfoAnimation && "animate-pulse ring-2 ring-primary ring-offset-2"
              )}
              aria-label="Dashboard guide and help"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate(`/vendor/${vendorUserId}`)}>
                  View Public Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings/account")}>Account Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/notifications")}>Notification Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/vendor")}>Vendor Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/privacy")}>Privacy Controls</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {description && (
          <div className="max-w-2xl group relative">
            <p className="text-sm text-muted-foreground pr-8">{description}</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => {
                const newDesc = prompt("Edit description:", description);
                if (newDesc !== null && newDesc.trim()) {
                  onUpdateDescription(newDesc);
                }
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <ShopperSignupPrompt 
        open={showShopperSignupPrompt} 
        onOpenChange={setShowShopperSignupPrompt}
      />
      <DashboardInfoDialog 
        open={infoDialogOpen}
        onOpenChange={setInfoDialogOpen}
        dashboardType="vendor"
      />
    </div>
  );
};

export default VendorHeader;
