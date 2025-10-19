import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SignupModal = ({ open, onOpenChange }: SignupModalProps) => {
  const navigate = useNavigate();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // When modal is closed without signing in, redirect to homepage
      navigate("/");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to That's Good Too!</DialogTitle>
          <DialogDescription className="text-base pt-2">
            That's Good Too is a member-based discovery platform. Sign up to explore local goods, artists, and experiences.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate("/auth?mode=signin");
            }}
            variant="outline"
          >
            Sign In
          </Button>
          <Button
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate("/signup/shopper");
            }}
          >
            Sign Up as Shopper
          </Button>
          <Button
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate("/signup/vendor");
            }}
            variant="secondary"
          >
            Sign Up as Vendor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
