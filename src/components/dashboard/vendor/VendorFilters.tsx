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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VendorFiltersProps {
  mainCategories: string[];
  subcategories: string[];
  onEditSubcategories: (newSubcategories: string[]) => void;
}

const VendorFilters = ({ mainCategories, subcategories, onEditSubcategories }: VendorFiltersProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedSubcategories, setEditedSubcategories] = useState<string[]>(subcategories);
  const [newSubcategory, setNewSubcategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

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
          {/* Search and Filter Tabs on Same Line */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search filters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-5 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="products" className="text-xs sm:text-sm">Products</TabsTrigger>
                <TabsTrigger value="services" className="text-xs sm:text-sm">Services</TabsTrigger>
                <TabsTrigger value="experiences" className="text-xs sm:text-sm">Experiences</TabsTrigger>
                <TabsTrigger value="sales" className="text-xs sm:text-sm">Sales</TabsTrigger>
              </TabsList>
            </Tabs>
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
