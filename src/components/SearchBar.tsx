import { useState, useEffect } from "react";
import { Search, Mic, MapPin, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onToggleMap: () => void;
  isMapView: boolean;
}

const SearchBar = ({ onSearch, onToggleMap, isMapView }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
      setHasSearched(true);
    }
  };

  useEffect(() => {
    if (hasSearched) {
      const timer = setTimeout(() => setIsSticky(true), 300);
      return () => clearTimeout(timer);
    }
  }, [hasSearched]);

  return (
    <>
      {/* Spacer for sticky positioning */}
      {isSticky && <div className="h-20" />}
      
      <div
        className={cn(
          "transition-all duration-500 ease-in-out z-40",
          isSticky
            ? "fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border py-4 animate-slide-up"
            : "relative py-8 animate-fade-in"
        )}
      >
        <div className="container mx-auto px-4">
          {!isSticky && (
            <p className="text-center text-foreground text-lg mb-4 animate-fade-in">
              What are you looking for?
            </p>
          )}
          
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search products, services, experiences..."
                className="pl-10 pr-12 h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <MapPin className="h-5 w-5" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-muted-foreground hover:text-foreground"
              title="Voice search"
            >
              <Mic className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleMap}
              className={cn(
                "h-12 w-12 transition-colors",
                isMapView 
                  ? "text-primary hover:text-primary/80" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Toggle map view"
            >
              <Globe className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={handleSearch}
              className="h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBar;
