import { useState, useEffect } from "react";
import { Search, Mic, MapPin, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onToggleMap: () => void;
  isMapView: boolean;
  isCentered: boolean;
}

const SearchBar = ({ onSearch, onToggleMap, isMapView, isCentered }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  if (isCentered) {
    // Hero/Centered search bar layout
    return (
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 animate-fade-in">
        <h1 className="text-foreground text-4xl md:text-5xl font-light mb-12 text-center">
          What are you looking for?
        </h1>
        
        <div className="flex items-center gap-3 w-full max-w-4xl">
          {/* Map toggle on left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMap}
            className={cn(
              "h-14 w-14 rounded-full border transition-colors flex-shrink-0",
              isMapView 
                ? "border-primary text-primary hover:bg-primary/10" 
                : "border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            title="Toggle map view"
          >
            <Globe className="h-6 w-6" />
          </Button>

          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="WHAT ARE YOU LOOKING FOR?"
              className="pl-12 pr-24 h-14 bg-foreground text-background placeholder:text-muted-foreground/60 border-none rounded-full text-sm uppercase tracking-wide"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-background/60 hover:text-background hover:bg-transparent"
                title="Location"
              >
                <MapPin className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearch}
                className="h-10 w-10 text-background/60 hover:text-background hover:bg-transparent"
                title="Voice search"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bottom sticky search bar layout
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/98 backdrop-blur-sm border-t border-border py-3 animate-slide-up">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          {/* Map toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMap}
            className={cn(
              "h-11 w-11 rounded-full flex-shrink-0",
              isMapView 
                ? "text-primary hover:text-primary/80 bg-primary/10" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Toggle map view"
          >
            <Globe className="h-5 w-5" />
          </Button>

          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search..."
              className="pl-9 pr-20 h-11 bg-input border-border text-foreground placeholder:text-muted-foreground text-sm rounded-full"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <MapPin className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
