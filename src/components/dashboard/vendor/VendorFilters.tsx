import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Edit2, Plus, X, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";


interface VendorFiltersProps {
  mainCategories: string[];
  subcategories: string[];
  onEditSubcategories: (newSubcategories: string[]) => void;
  additionalInfo?: {
    businessType?: string;
    businessDuration?: string;
    sustainableMethods?: string[];
    pricingStyle?: string;
    inventoryType?: string[];
    shippingOptions?: string[];
  };
}

const VendorFilters = ({ mainCategories, subcategories, onEditSubcategories, additionalInfo }: VendorFiltersProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedSubcategories, setEditedSubcategories] = useState<string[]>(subcategories);
  const [newSubcategory, setNewSubcategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenEdit = () => {
    setEditedSubcategories(subcategories);
    setEditDialogOpen(true);
  };

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && !editedSubcategories.includes(newSubcategory.trim())) {
      setEditedSubcategories([...editedSubcategories, newSubcategory.trim()]);
      setNewSubcategory("");
    }
  };

  const handleRemoveSubcategory = (subcategory: string) => {
    setEditedSubcategories(editedSubcategories.filter(s => s !== subcategory));
  };

  const handleSaveSubcategories = () => {
    onEditSubcategories(editedSubcategories);
    setEditDialogOpen(false);
    toast.success("Subcategories updated successfully!");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Filters</CardTitle>
          <CardDescription>
            Define your shop overview for TGT searches
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Filters */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search filters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

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
                onClick={handleOpenEdit}
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

          {/* Additional Information from Application */}
          {additionalInfo && (
            <div className="border-t pt-6 mt-6">
              <h4 className="font-semibold text-sm mb-4">Additional Information</h4>
              <div className="space-y-4">
                {additionalInfo.businessType && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Business Type / Ownership</p>
                    <Badge variant="outline">{additionalInfo.businessType}</Badge>
                  </div>
                )}
                
                {additionalInfo.businessDuration && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Business Duration</p>
                    <Badge variant="outline">{additionalInfo.businessDuration}</Badge>
                  </div>
                )}

                {additionalInfo.pricingStyle && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Pricing Style</p>
                    <Badge variant="outline">{additionalInfo.pricingStyle}</Badge>
                  </div>
                )}

                {additionalInfo.inventoryType && additionalInfo.inventoryType.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Inventory Type</p>
                    <div className="flex flex-wrap gap-2">
                      {additionalInfo.inventoryType.map((type) => (
                        <Badge key={type} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {additionalInfo.shippingOptions && additionalInfo.shippingOptions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Shipping Options</p>
                    <div className="flex flex-wrap gap-2">
                      {additionalInfo.shippingOptions.map((option) => (
                        <Badge key={option} variant="outline">{option}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {additionalInfo.sustainableMethods && additionalInfo.sustainableMethods.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Sustainable Methods</p>
                    <div className="flex flex-wrap gap-2">
                      {additionalInfo.sustainableMethods.map((method) => (
                        <Badge key={method} variant="outline">{method}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Subcategories Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subcategories</DialogTitle>
            <DialogDescription>
              Add, change, or remove filters for your listings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Add New Subcategory */}
            <div className="flex gap-2">
              <Input
                placeholder="Add new filter..."
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcategory();
                  }
                }}
              />
              <Button
                onClick={handleAddSubcategory}
                disabled={!newSubcategory.trim()}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {/* Current Subcategories */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Filters:</p>
              <div className="flex flex-wrap gap-2">
                {editedSubcategories.map((subcategory) => (
                  <Badge
                    key={subcategory}
                    variant="secondary"
                    className="gap-2 pr-1"
                  >
                    {subcategory}
                    <button
                      onClick={() => handleRemoveSubcategory(subcategory)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              {editedSubcategories.length === 0 && (
                <p className="text-sm text-muted-foreground">No filters added yet</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSubcategories}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendorFilters;
