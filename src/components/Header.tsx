import { Hand, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import VendorFollowersList from "@/components/VendorFollowersList";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";
import squirrelIcon from "@/assets/squirrel-shopping.png";
import SignupModal from "@/components/SignupModal";

interface HeaderProps {
  showGoodToday?: boolean;
  onWhatsgoodClick?: () => void;
  onHighFiveClick?: () => void;
  onYourGoodsClick?: () => void;
}

const Header = ({ showGoodToday = true, onWhatsgoodClick, onHighFiveClick, onYourGoodsClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showFollowersList, setShowFollowersList] = useState(false);
  
  const handleYourGoodsClick = () => {
    if (!user) {
      setShowSignupModal(true);
    } else {
      // Navigate based on user role
      if (userRole === "vendor") {
        navigate("/dashboard/vendor");
      } else {
        navigate("/dashboard/shopper");
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/")} 
            className="focus:outline-none"
            type="button"
          >
            <img src={logo} alt="That's Good Too" className="h-8 w-8 sm:h-10 sm:w-10 hover:opacity-80 transition-opacity cursor-pointer" />
          </button>
        </div>

        {/* Right: Icons */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Your Goods - Squirrel Icon */}
          <button 
            onClick={handleYourGoodsClick}
            className="group focus:outline-none"
            type="button"
          >
            <img 
              src={squirrelIcon} 
              alt="Your goods" 
              className="h-6 w-6 sm:h-7 sm:w-7 opacity-70 group-hover:opacity-100 transition-opacity"
            />
          </button>

          {/* Hi Fives - Hand Icon */}
          <button 
            onClick={() => {
              if (userRole === "vendor") {
                setShowFollowersList(true);
              } else {
                navigate("/high-fives");
              }
            }}
            className="group focus:outline-none"
            type="button"
          >
            <Hand className="h-5 w-5 sm:h-6 sm:w-6 text-foreground opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all" strokeWidth={1.5} />
          </button>
          
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-foreground hover:text-primary h-8 w-8 sm:h-10 sm:w-10"
                title="Settings"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-sm border-border w-56 z-[100] shadow-lg">
              {user && (
                <>
                  <DropdownMenuItem className="text-xs font-medium pointer-events-none">
                    <div className={`px-2 py-1 rounded ${userRole === 'vendor' ? 'bg-vendor-active text-vendor-active-foreground' : userRole === 'shopper' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      Signed in as {userRole}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="cursor-pointer">
                About Us
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Contact Support
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Help & FAQ
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Privacy Policy
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Terms of Service
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={signOut} 
                    className="text-destructive cursor-pointer font-medium"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
      <VendorFollowersList open={showFollowersList} onOpenChange={setShowFollowersList} />
    </header>
  );
};

export default Header;
