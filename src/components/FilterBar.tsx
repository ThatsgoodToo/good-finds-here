import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, Grid3x3, List, X } from "lucide-react";

type FilterType = "all" | "product" | "service" | "experience" | "sale";

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onBack?: () => void;
  viewMode?: "gallery" | "list";
  onViewModeChange?: (mode: "gallery" | "list") => void;
}

const FilterBar = ({ 
  activeFilter, 
  onFilterChange, 
  onBack,
  viewMode = "gallery",
  onViewModeChange 
}: FilterBarProps) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [customFilters, setCustomFilters] = useState<string[]>([]);
  
  const filters: { type: FilterType; label: string; color: string }[] = [
    { type: "all", label: "All", color: "bg-foreground" },
    { type: "product", label: "Products", color: "bg-category-product" },
    { type: "service", label: "Services", color: "bg-category-service" },
    { type: "experience", label: "Experiences", color: "bg-category-experience" },
    { type: "sale", label: "Sales", color: "bg-category-sale" },
  ];

  const filteredFilters = filters.filter(filter => 
    filter.label.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchFilter.trim()) {
      if (!customFilters.includes(searchFilter.trim())) {
        setCustomFilters([...customFilters, searchFilter.trim()]);
      }
      setSearchFilter("");
    }
  };

  const removeCustomFilter = (filter: string) => {
    setCustomFilters(customFilters.filter(f => f !== filter));
  };

  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-4 animate-fade-in">
      <div className="container mx-auto px-4">
        {/* Single Row: Back Button, Search, Filters, View Toggle - Horizontal Scroll */}
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-foreground hover:text-primary shrink-0"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <Input
            type="text"
            placeholder="Search filters... (Press Enter to add)"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-40 sm:w-48 shrink-0"
          />
          
          {/* Filter Buttons */}
          {filteredFilters.map((filter) => (
            <Button
              key={filter.type}
              variant={activeFilter === filter.type ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.type)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap transition-all px-3 py-1.5 text-sm shrink-0",
                activeFilter === filter.type
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground border-border hover:bg-muted"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", filter.color)} />
              {filter.label}
            </Button>
          ))}
          
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant={viewMode === "gallery" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange?.("gallery")}
              className="h-8 w-8"
              title="Gallery view"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => onViewModeChange?.("list")}
              className="h-8 w-8"
              title="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Active Filters Display - Below main row */}
        {(activeFilter !== "all" || customFilters.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            <span className="text-sm text-muted-foreground shrink-0">Active:</span>
            {activeFilter !== "all" && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1"
              >
                {filters.find(f => f.type === activeFilter)?.label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-transparent ml-1"
                  onClick={() => onFilterChange("all")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {customFilters.map((filter) => (
              <Badge 
                key={filter}
                variant="secondary" 
                className="flex items-center gap-1.5 px-3 py-1"
              >
                {filter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 p-0 hover:bg-transparent ml-1"
                  onClick={() => removeCustomFilter(filter)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
