import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterType = "all" | "product" | "service" | "experience" | "sale";

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterBar = ({ activeFilter, onFilterChange }: FilterBarProps) => {
  const filters: { type: FilterType; label: string; color: string }[] = [
    { type: "all", label: "All", color: "bg-foreground" },
    { type: "product", label: "Products", color: "bg-category-product" },
    { type: "service", label: "Services", color: "bg-category-service" },
    { type: "experience", label: "Experiences", color: "bg-category-experience" },
    { type: "sale", label: "Sales", color: "bg-category-sale" },
  ];

  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-4 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
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
