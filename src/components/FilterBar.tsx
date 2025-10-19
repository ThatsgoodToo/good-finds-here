import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft, Grid3x3, List, SlidersHorizontal } from "lucide-react";

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

  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-4 animate-fade-in">
      <div className="container mx-auto px-4 space-y-3">
        {/* Top Row: Back Button, Search Input, Edit Filters, View Toggle */}
        <div className="flex items-center gap-3">
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
            placeholder="Search filters..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="max-w-xs bg-card border-border"
          />
          
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-2"
            title="Edit filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Edit Filters
          </Button>
          
          <div className="ml-auto flex items-center gap-1 shrink-0">
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

        {/* Bottom Row: Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filteredFilters.map((filter) => (
            <Button
              key={filter.type}
              variant={activeFilter === filter.type ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.type)}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap transition-all",
                activeFilter === filter.type
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground border-border hover:bg-muted"
              )}
            >
              <span className={cn("w-2 h-2 rounded-full", filter.color)} />
              {filter.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
