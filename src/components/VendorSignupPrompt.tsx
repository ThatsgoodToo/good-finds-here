import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";

type VendorSignupPromptProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const VendorSignupPrompt = ({ open, onOpenChange }: VendorSignupPromptProps) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Store className="h-6 w-6 text-primary" />
            <DialogTitle>Become a Vendor on That's Good Too!</DialogTitle>
          </div>
          <DialogDescription>
            Share your goods, services, or content with our community and start reaching new customers today.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4">
          <Button
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate("/signup/vendor");
            }}
          >
            Sign Up as Vendor
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

export default VendorSignupPrompt;
