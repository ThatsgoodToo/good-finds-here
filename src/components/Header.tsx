import { Hand, Settings, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

interface HeaderProps {
  showGoodToday?: boolean;
  onWhatsgoodClick?: () => void;
  onHighFiveClick?: () => void;
  onYourGoodsClick?: () => void;
}

const Header = ({ showGoodToday = true, onWhatsgoodClick, onHighFiveClick, onYourGoodsClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const handleYourGoodsClick = () => {
    if (!user) {
      navigate("/auth");
    } else {
      onYourGoodsClick?.();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <img src={logo} alt="That's Good Too" className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>

        {/* Center: What's Good Today */}
        {showGoodToday && (
          <Button 
            onClick={onWhatsgoodClick}
            variant="outline"
            className="hidden sm:flex text-foreground hover:text-primary border-border/50 rounded-full px-4 sm:px-8 text-xs sm:text-sm bg-transparent hover:bg-muted/50"
          >
            WHAT'S GOOD TODAY
          </Button>
        )}

        {/* Right: Icons */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Your Goods */}
          <button 
            onClick={handleYourGoodsClick}
            className="flex flex-col items-center gap-0.5 sm:gap-1 group"
          >
            <Store className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <span className="text-muted-foreground text-[10px] sm:text-xs group-hover:text-primary transition-colors">
              your goods
            </span>
          </button>

          {/* Hi Fives */}
          <button 
            onClick={onHighFiveClick}
            className="flex flex-col items-center gap-0.5 sm:gap-1 group"
          >
            <Hand className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <span className="text-muted-foreground text-[10px] sm:text-xs group-hover:text-primary transition-colors">
              Hi Fives
            </span>
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
    </header>
  );
};

export default Header;
