import { useState, useEffect } from "react";
import { Search, Mic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
interface SearchBarProps {
  onSearch: (query: string) => void;
  isCentered: boolean;
  onWhatsgoodClick?: () => void;
}
const SearchBar = ({
  onSearch,
  isCentered,
  onWhatsgoodClick
}: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };
  if (isCentered) {
    // Hero/Centered search bar layout
    return <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-4 animate-fade-in">
        {/* What's Good Today Button */}
        <div className="flex items-center gap-3 mb-12">
          <Button onClick={onWhatsgoodClick} variant="outline" className="text-foreground hover:text-primary border-border/50 rounded-full px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base bg-transparent hover:bg-muted/50 relative overflow-hidden group" data-tour="whatsgood-button">
            <span className="relative z-10 inline-block animate-[pulse_2s_ease-in-out_infinite]">
              WHAT'S GOOD TODAY
            </span>
            <span className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></span>
          </Button>
        </div>
        
        {/* Search bar - Full width on mobile */}
        <div className="w-full max-w-4xl" data-tour="search-bar">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
            <Input value={query} onChange={e => setQuery(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSearch()} placeholder="WHAT ARE YOU LOOKING FOR?" className="pl-12 pr-24 h-14 bg-stone-50 dark:bg-card text-foreground placeholder:text-muted-foreground/60 border-none rounded-full text-sm uppercase tracking-wide w-full" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={handleSearch} className="h-10 w-10 text-foreground/60 hover:text-foreground hover:bg-transparent" title="Voice search">
                <Mic className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Subtitle text */}
        <div className="mt-8 text-center">
          
        </div>
      </div>;
  }

  // Bottom sticky search bar layout
  return <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/98 backdrop-blur-sm border-t border-border py-3 animate-slide-up">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={e => setQuery(e.target.value)} onKeyPress={e => e.key === "Enter" && handleSearch()} placeholder="Search..." className="pl-9 pr-20 h-11 bg-stone-50 dark:bg-input border-border text-foreground placeholder:text-muted-foreground text-sm rounded-full" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default SearchBar;