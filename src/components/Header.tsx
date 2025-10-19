import { Hand, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
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
  
  const handleYourGoodsClick = () => {
    if (!user) {
      setShowSignupModal(true);
    } else {
      onYourGoodsClick?.();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Back Button and Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="focus:outline-none group"
            type="button"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-foreground opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
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
            onClick={onHighFiveClick}
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
            <DropdownMenuContent align="end" className="bg-card border-border w-48">
              {user && (
                <>
                  <DropdownMenuItem className="text-xs text-muted-foreground">
                    Signed in as {userRole}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Account Settings</DropdownMenuItem>
                  <DropdownMenuItem>Preferences</DropdownMenuItem>
                  <DropdownMenuItem>Notifications</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>About Us</DropdownMenuItem>
              <DropdownMenuItem>Contact</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Privacy Policy</DropdownMenuItem>
              <DropdownMenuItem>Terms of Service</DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    Sign Out
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SignupModal open={showSignupModal} onOpenChange={setShowSignupModal} />
    </header>
  );
};

export default Header;
