import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

type ShopperSignupPromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ShopperSignupPrompt = ({ open, onOpenChange }: ShopperSignupPromptProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <DialogTitle>Become a Shopper Too!</DialogTitle>
          </div>
          <Badge className="w-fit mb-2" variant="secondary">
            🎉 $2 OFF for having both accounts!
          </Badge>
          <DialogDescription>
            Discover and save your favorite vendors, get exclusive deals, and never miss what's good!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4">
          <Button
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate("/signup/shopper?promo=DUAL_ROLE");
            }}
          >
            Sign Up as Shopper
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShopperSignupPrompt;
