import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hand, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ShareListingDialog from "@/components/ShareListingDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useFolders } from "@/hooks/useFolders";
import { useSaves } from "@/hooks/useSaves";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { folders, createFolder } = useFolders();
  const { checkIsSaved, saveItem, unsaveItem } = useSaves();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [saved, setSaved] = useState(isSaved);
  const [hasActiveCoupon, setHasActiveCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  // Check if already saved
  useEffect(() => {
    const loadSaveStatus = async () => {
      if (!user) return;
      const isSaved = await checkIsSaved('listing', id);
      setSaved(isSaved);
    };

    loadSaveStatus();
  }, [user, id, checkIsSaved]);

  // Check for active coupon
  useEffect(() => {
    const checkActiveCoupon = async () => {
      console.log('[ProductCard] Checking active coupon for listing:', id);
      
      const { data: couponData, error } = await supabase
        .from("coupons")
        .select("id, code, listing_id")
        .eq("listing_id", id)
        .eq("active_status", true)
        .gte("end_date", new Date().toISOString())
        .limit(1);

      console.log('[ProductCard] Coupon query result:', { couponData, error });

      if (couponData && couponData.length > 0) {
      console.log('[ProductCard] Active coupon found:', couponData[0]);
      setHasActiveCoupon(true);
      setCouponCode(couponData[0].code);
      
      // Get source URL
      const { data: listingData } = await supabase
        .from("listings")
        .select("source_url")
        .eq("id", id)
        .single();
      
      console.log('[ProductCard] Source URL:', listingData?.source_url);
      setSourceUrl(listingData?.source_url || null);
      } else {
        console.log('[ProductCard] No active coupon found for this listing');
        setHasActiveCoupon(false);
        setCouponCode(null);
      }
    };

    checkActiveCoupon();
  }, [id]);

  const getListingPath = () => {
    return `/listing/${id}`;
  };

  const categoryColors: Record<CategoryType, string> = {
    product: "bg-category-product",
    service: "bg-category-service",
    experience: "bg-category-experience",
    sale: "bg-category-sale",
  };

  const handleHighFive = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save items");
      navigate("/auth");
      return;
    }

    if (saved) {
      // Unsave the listing
      unsaveItem({ saveType: 'listing', targetId: id }, {
        onSuccess: () => {
          setSaved(false);
          if (onSaveToggle) {
            onSaveToggle();
          }
          toast.success("Removed from collection");
        }
      });
    } else {
      // Show dialog to choose folder
      setShowSaveDialog(true);
    }
  };

  const handleSave = async (folderId: string, folderName: string) => {
    if (!user) {
      toast.error("Please sign in to save items");
      return;
    }

    saveItem({ 
      saveType: 'listing', 
      targetId: id, 
      folderId,
      emailOnSave: false 
    }, {
      onSuccess: () => {
        setSaved(true);
        if (onSaveToggle) {
          onSaveToggle();
        }
        toast.success(`Saved to ${folderName}!`, {
          description: `${title} has been added to your collection.`,
        });
        setShowSaveDialog(false);
        setNewFolderName("");
        setNewFolderDescription("");
      }
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    createFolder({ 
      name: newFolderName.trim(), 
      description: newFolderDescription.trim() || undefined 
    }, {
      onSuccess: (newFolder) => {
        handleSave(newFolder.id, newFolder.name);
      }
    });
  };

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg bg-transparent border-none transition-all hover:shadow-lg animate-scale-in">
        {/* Category Dots - Multiple if applicable */}
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
          {categories.map((cat, index) => (
            <div 
              key={`${cat}-${index}`}
              className={cn("w-2 h-2 rounded-full ring-1 ring-border", categoryColors[cat])} 
            />
          ))}
          {hasActiveCoupon && (
            <div
              className={cn(
                "w-2 h-2 rounded-full ring-1 ring-border bg-category-sale cursor-pointer hover:scale-110 transition-transform"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (sourceUrl) {
                  window.open(sourceUrl, "_blank");
                } else {
                  toast.info("Active coupon available - view listing for details");
                }
              }}
              title={sourceUrl ? "Click to view vendor website" : "Active coupon available"}
            />
          )}
        </div>

        {/* High-Five and Share Buttons */}
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowShareDialog(true);
            }}
            className="bg-background/90 hover:bg-background text-foreground shadow-md transition-all"
            title="Share this deal"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHighFive}
            className={cn(
              "shadow-md transition-all",
              saved
                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                : "bg-background/90 hover:bg-background text-foreground"
            )}
            data-tour="hi-five-icon"
          >
            <Hand className={cn("h-5 w-5", saved && "fill-current")} />
          </Button>
        </div>

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
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-muted-foreground hover:text-foreground text-xs leading-tight truncate max-w-[120px] block transition-colors text-left"
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
              Choose a folder to save this item or create a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                onClick={() => handleSave(folder.id, folder.name)}
                variant="outline"
                className="w-full justify-start bg-background hover:bg-muted text-foreground"
              >
                {folder.name}
              </Button>
            ))}
            
            {/* Create New Folder Section */}
            <div className="pt-4 border-t border-border space-y-2">
              <p className="text-sm font-medium text-foreground">Create New Folder</p>
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      handleCreateFolder();
                    }
                  }}
                />
                <Input
                  type="text"
                  placeholder="Description (optional)"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      handleCreateFolder();
                    }
                  }}
                />
                <Button onClick={handleCreateFolder} className="w-full">
                  Create
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <ShareListingDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        listingId={id}
        listingTitle={title}
        couponCode={couponCode || undefined}
      />
    </>
  );
};

export default ProductCard;
