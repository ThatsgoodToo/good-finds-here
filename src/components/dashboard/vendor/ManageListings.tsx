import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus, Edit2, Pause, Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Listing {
  id: string;
  title: string;
  type: "product" | "service" | "experience";
  categories?: string[];
  price: string;
  inventory: string;
  activeOffer: boolean;
  offerDetails?: string;
  couponClaims?: number;
  status: "active" | "paused";
}

interface ManageListingsProps {
  listings: Listing[];
  onAddListing: () => void;
  onEditListing: (id: string) => void;
  onDeleteListing: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

const ManageListings = ({ 
  listings, 
  onAddListing, 
  onEditListing, 
  onDeleteListing, 
  onToggleStatus 
}: ManageListingsProps) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listingToDelete, setListingToDelete] = useState<string | null>(null);

  const getTypeBadge = (type: "product" | "service" | "experience") => {
    const configs = {
      product: { label: "P", colorClass: "bg-category-product", name: "Product" },
      service: { label: "S", colorClass: "bg-category-service", name: "Service" },
      experience: { label: "E", colorClass: "bg-category-experience", name: "Experience" },
    };
    
    const config = configs[type];
    
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className="gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${config.colorClass}`} />
            <span>{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.name}</p>
        </TooltipContent>
      </Tooltip>
    );
  };

  const handleDeleteClick = (id: string) => {
    setListingToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (listingToDelete) {
      onDeleteListing(listingToDelete);
      setDeleteDialogOpen(false);
      setListingToDelete(null);
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Listings</CardTitle>
              <CardDescription>Your products, services, and experiences</CardDescription>
            </div>
            <Button onClick={() => navigate("/vendor/listing/new")} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New Listing</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden md:table-cell">Inventory</TableHead>
                  <TableHead>Active Offer</TableHead>
                  <TableHead className="hidden sm:table-cell">Claims</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No listings yet. Create your first listing to get started!
                    </TableCell>
                  </TableRow>
                ) : (
                  listings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="font-medium truncate max-w-[150px] sm:max-w-[200px] lg:max-w-none">
                                {listing.title}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{listing.title}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Badge 
                            variant={listing.status === "active" ? "default" : "secondary"}
                            className="text-xs shrink-0"
                          >
                            {listing.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {getTypeBadge(listing.type)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{listing.price}</TableCell>
                      <TableCell className="hidden md:table-cell">{listing.inventory}</TableCell>
                      <TableCell>
                        {listing.activeOffer ? (
                          <div className="text-sm">
                            <div className="font-medium">{listing.offerDetails}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {listing.couponClaims || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEditListing(listing.id)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit listing</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onToggleStatus(listing.id, listing.status)}
                              >
                                {listing.status === "active" ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{listing.status === "active" ? "Pause" : "Activate"} listing</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteClick(listing.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete listing</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the listing
              and remove any associated coupons from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default ManageListings;
