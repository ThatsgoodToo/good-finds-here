import { Hand, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showGoodToday?: boolean;
}

const Header = ({ showGoodToday = true }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Empty space for symmetry */}
        <div className="w-10" />

        {/* Center: What's Good Today */}
        {showGoodToday && (
          <Button 
            variant="outline"
            className="text-foreground hover:text-primary border-border/50 rounded-full px-8 bg-transparent hover:bg-muted/50"
          >
            WHAT'S GOOD TODAY
          </Button>
        )}

        {/* Right: Icons */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-muted-foreground text-sm">
            your shop
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-foreground hover:text-primary"
            title="High Five"
          >
            <Hand className="h-5 w-5" />
          </Button>
          
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-foreground hover:text-primary"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border w-48">
              <DropdownMenuItem>Account Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>About Us</DropdownMenuItem>
              <DropdownMenuItem>Contact</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Privacy Policy</DropdownMenuItem>
              <DropdownMenuItem>Terms of Service</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
