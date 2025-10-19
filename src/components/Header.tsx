import { Store, Hand, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showGoodToday?: boolean;
}

const Header = ({ showGoodToday = true }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left: Menu Icon */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-foreground hover:text-primary rounded-full border border-border/50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-card border-border">
            <DropdownMenuItem>About Us</DropdownMenuItem>
            <DropdownMenuItem>Contact</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
        <div className="flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
