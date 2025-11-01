import { 
  Hand, 
  Tag, 
  FolderHeart, 
  Sparkles,
  User,
  MapPin,
  Settings,
  Eye,
  EyeOff,
  FolderPlus,
  Grid3x3,
  List,
  BarChart3,
  Package,
  Send,
  TrendingUp,
  Edit2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardType: "shopper" | "vendor";
}

const DashboardInfoDialog = ({ open, onOpenChange, dashboardType }: DashboardInfoDialogProps) => {
  const shopperContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Tabs</CardTitle>
          <CardDescription>Navigate between different sections of your shopper dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Hand className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">My Shop</p>
              <p className="text-sm text-muted-foreground">Your saved items and vendors organized in folders. Toggle visibility to control who can see your favorites.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Active Coupons</p>
              <p className="text-sm text-muted-foreground">Exclusive coupon codes from vendors you've Hi-Fived. Claim and use them before they expire!</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FolderHeart className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">My Preferences</p>
              <p className="text-sm text-muted-foreground">Set your filter preferences to get personalized recommendations matching your style and interests.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">New Offers</p>
              <p className="text-sm text-muted-foreground">Discover special deals and promotions from vendors based on your saved preferences.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile & Controls</CardTitle>
          <CardDescription>Manage your profile and dashboard settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Profile Avatar</p>
              <p className="text-sm text-muted-foreground">Click to upload a new profile picture. Hover to see the edit icon.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Edit2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Display Name & Location</p>
              <p className="text-sm text-muted-foreground">Click the edit icon next to your name or location to change them. Changes are saved automatically.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Settings Gear</p>
              <p className="text-sm text-muted-foreground">Access profile settings, account management, notifications, and privacy controls.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Visibility Toggle</p>
              <p className="text-sm text-muted-foreground">Show or hide your shop from public view on the Hi-Fives page. Only you can see your shop when hidden.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <FolderPlus className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">New Folder</p>
              <p className="text-sm text-muted-foreground">Create folders to organize your saved items by category, vendor, or any way you like.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Grid3x3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">View Toggle</p>
              <p className="text-sm text-muted-foreground">Switch between grid and list view for your folders and items to find the best layout for you.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const vendorContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard Tabs</CardTitle>
          <CardDescription>Navigate between different sections of your vendor dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Overview</p>
              <p className="text-sm text-muted-foreground">View your performance metrics including clicks, sales, active offers, and followers. Click any metric to see detailed charts.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Listings</p>
              <p className="text-sm text-muted-foreground">Manage all your products, services, and experiences. Add new listings or edit existing ones.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Active Offers</p>
              <p className="text-sm text-muted-foreground">Create and manage coupon codes to attract customers with special promotions and exclusive deals.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Hand className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Your Hi Fives</p>
              <p className="text-sm text-muted-foreground">See shoppers who saved you as a favorite. Send them exclusive offers to boost engagement!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile & Controls</CardTitle>
          <CardDescription>Manage your vendor profile and settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Profile Avatar</p>
              <p className="text-sm text-muted-foreground">Upload your brand logo or business image. This appears on your vendor page. Hover over your avatar to see the edit icon.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Settings Gear</p>
              <p className="text-sm text-muted-foreground">Access vendor settings, account management, notifications, and business profile options.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Metrics Cards</p>
              <p className="text-sm text-muted-foreground">Click any metric card on the Overview tab to see detailed charts and trends over time.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Edit2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Description Editor</p>
              <p className="text-sm text-muted-foreground">Hover over your business description to see the edit icon. Update your description to better showcase your brand.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">New Listing</p>
              <p className="text-sm text-muted-foreground">Add a new product, service, or experience to your vendor profile. Showcase what you offer!</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Tag className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">New Coupon</p>
              <p className="text-sm text-muted-foreground">Create promotional codes with custom discounts, expiration dates, and usage limits.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Send className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Send Offer</p>
              <p className="text-sm text-muted-foreground">Share exclusive deals directly with shoppers who Hi-Fived your listings. Build customer loyalty!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {dashboardType === "shopper" ? "Shopper" : "Vendor"} Dashboard Guide
          </DialogTitle>
          <DialogDescription>
            Learn about all the features and controls available on your dashboard
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {dashboardType === "shopper" ? shopperContent : vendorContent}
        </ScrollArea>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardInfoDialog;
