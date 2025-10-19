import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Edit2 } from "lucide-react";

interface VendorFiltersProps {
  mainCategories: string[];
  subcategories: string[];
  onEditSubcategories: () => void;
}

const VendorFilters = ({ mainCategories, subcategories, onEditSubcategories }: VendorFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Filters</CardTitle>
        <CardDescription>
          Define your shop overview for TGT searches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Categories - Locked */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-sm">Main Categories</h4>
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Locked
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {mainCategories.map((category) => (
              <Badge key={category} variant="default">
                {category}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Main categories cannot be changed. Contact TGT for modifications.
          </p>
        </div>

        {/* Subcategories - Editable */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Subcategories</h4>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onEditSubcategories}
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subcategories.map((subcategory) => (
              <Badge key={subcategory} variant="secondary">
                {subcategory}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Subcategories can be edited instantly for specific listings.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorFilters;
