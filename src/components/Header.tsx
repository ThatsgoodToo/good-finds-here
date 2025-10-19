import { Hand, Settings, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

const Header = ({ showGoodToday = true }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center">
          <img src={logo} alt="That's Good Too" className="h-10 w-10" />
        </div>

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
        <div className="flex items-center gap-6">
          {/* Your Goods */}
          <button className="flex flex-col items-center gap-1 group">
            <Store className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <span className="text-muted-foreground text-xs group-hover:text-primary transition-colors">
              your goods
            </span>
          </button>

          {/* Hi Fives */}
          <button className="flex flex-col items-center gap-1 group">
            <Hand className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <span className="text-muted-foreground text-xs group-hover:text-primary transition-colors">
              Hi Fives
            </span>
          </button>
          
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
